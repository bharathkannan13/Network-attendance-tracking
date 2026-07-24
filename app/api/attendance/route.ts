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

    // Physical Database-Level Deduplication & Consolidation
    const ipGroupMap = new Map<string, typeof updatedRecords>();
    
    for (const rec of updatedRecords) {
      const cleanIp = rec.ipAddress ? rec.ipAddress.split(',')[0].trim() : '';
      const key = (cleanIp && cleanIp !== '127.0.0.1' && cleanIp !== '::1')
        ? `IP_${cleanIp}`
        : `USER_${rec.username.trim().toLowerCase()}`;

      if (!ipGroupMap.has(key)) {
        ipGroupMap.set(key, []);
      }
      ipGroupMap.get(key)!.push(rec);
    }

    const consolidatedRecords: any[] = [];

    for (const [key, group] of ipGroupMap.entries()) {
      if (group.length === 1) {
        consolidatedRecords.push(group[0]);
      } else {
        // Sort to find earliest firstSeen and latest lastSeen
        group.sort((a, b) => new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime());
        const primary = group[0];
        
        const latestRec = [...group].sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())[0];
        
        const firstSeen = new Date(primary.firstSeen);
        const lastSeen = new Date(latestRec.lastSeen);
        const totalMinutes = Math.floor((lastSeen.getTime() - firstSeen.getTime()) / 60000);
        const isOnline = group.some(r => r.status === 'ONLINE');

        // Update primary record in database
        const updatedPrimary = await prisma.attendanceRecord.update({
          where: { id: primary.id },
          data: {
            username: latestRec.username,
            firstSeen,
            lastSeen,
            totalMinutes,
            status: isOnline ? 'ONLINE' : 'OFFLINE',
          },
          include: { session: true }
        });

        // Permanently delete extra duplicate row IDs from PostgreSQL database
        const duplicateIds = group.filter(r => r.id !== primary.id).map(r => r.id);
        if (duplicateIds.length > 0) {
          await prisma.attendanceRecord.deleteMany({
            where: { id: { in: duplicateIds } }
          });
        }

        consolidatedRecords.push(updatedPrimary);
      }
    }

    const formattedRecords = consolidatedRecords.map(record => {
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

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    await prisma.attendanceRecord.deleteMany({});
    return NextResponse.json({ success: true, message: 'All attendance records cleared' });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
