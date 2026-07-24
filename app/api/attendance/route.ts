import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const search = searchParams.get('search') || '';

    const where: any = {};
    
    if (dateParam) {
      const date = new Date(dateParam);
      date.setHours(0, 0, 0, 0);
      where.date = date;
    }

    if (search) {
      where.username = { contains: search, mode: 'insensitive' };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
      include: { session: true }
    });

    // Timeout logic: older than 90 seconds -> OFFLINE
    const now = new Date();
    const updatedRecords = await Promise.all(records.map(async (record) => {
      if (record.status === 'ONLINE' && now.getTime() - record.lastSeen.getTime() > 90000) {
        return await prisma.attendanceRecord.update({
          where: { id: record.id },
          data: { status: 'OFFLINE' },
          include: { session: true }
        });
      }
      return record;
    }));

    // Deduplicate/Consolidate records by IP address or username per day
    const deduplicatedMap = new Map<string, any>();
    
    for (const rec of updatedRecords) {
      const key = (rec.ipAddress && rec.ipAddress !== '127.0.0.1' && rec.ipAddress !== '::1') 
        ? `${rec.date.toISOString().split('T')[0]}_IP_${rec.ipAddress}` 
        : `${rec.date.toISOString().split('T')[0]}_USER_${rec.username.toLowerCase()}`;

      if (!deduplicatedMap.has(key)) {
        deduplicatedMap.set(key, { ...rec });
      } else {
        const existing = deduplicatedMap.get(key)!;
        const firstSeen = rec.firstSeen < existing.firstSeen ? rec.firstSeen : existing.firstSeen;
        const lastSeen = rec.lastSeen > existing.lastSeen ? rec.lastSeen : existing.lastSeen;
        const status = (rec.status === 'ONLINE' || existing.status === 'ONLINE') ? 'ONLINE' : 'OFFLINE';
        const totalMinutes = Math.floor((lastSeen.getTime() - firstSeen.getTime()) / 60000);

        deduplicatedMap.set(key, {
          ...existing,
          username: rec.lastSeen >= existing.lastSeen ? rec.username : existing.username,
          firstSeen,
          lastSeen,
          totalMinutes,
          status,
        });
      }
    }

    const deduplicatedList = Array.from(deduplicatedMap.values());

    const formattedRecords = deduplicatedList.map(record => {
      const firstSeenIST = record.firstSeen.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const lastSeenIST = record.lastSeen.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const dateIST = record.date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });
      const totalHours = (record.totalMinutes / 60).toFixed(1) + " hrs";

      return {
        ...record,
        dateFormatted: dateIST,
        firstSeenFormatted: firstSeenIST,
        lastSeenFormatted: lastSeenIST,
        totalHoursFormatted: totalHours,
      };
    });

    return NextResponse.json(formattedRecords);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
