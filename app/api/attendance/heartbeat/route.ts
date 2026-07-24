import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { heartbeatSchema } from '@/lib/validation';
import { calculateTotalMinutes } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, username, deviceUuid } = heartbeatSchema.parse(body);

    const sessionCode = code.trim().toUpperCase();
    let session = await prisma.attendanceSession.findUnique({
      where: { code: sessionCode }
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: { code: sessionCode, isActive: true }
      });
    }

    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ipAddress = rawIp ? rawIp.split(',')[0].trim() : null;
    const userAgent = req.headers.get('user-agent') || null;
    // Strict Network Validation against authorized RAMBOLL-GUEST network prefixes
    const allowedPrefixes = (process.env.ALLOWED_IP_PREFIX || '172.16.50.,1.6.224.,2401:4900:ca77:,10.79.130.,127.0.0.1,::1').split(',');
    
    if (ipAddress) {
      const isAuthorizedNetwork = allowedPrefixes.some(prefix => 
        prefix.trim() && ipAddress.startsWith(prefix.trim())
      );

      if (process.env.STRICT_NETWORK_CHECK === 'true' && !isAuthorizedNetwork) {
        return NextResponse.json({
          error: 'Access Denied: Please connect to the authorized Galaxy S25 Ultra 7A56 network.',
          authorizedSSID: process.env.AUTHORIZED_SSID || 'Galaxy S25 Ultra 7A56'
        }, { status: 403 });
      }
    }

    // Deduplication matching criteria:
    // 1. Same sessionId AND same username (case-insensitive) OR
    // 2. Same sessionId AND same IP address (if IP is valid and not empty) OR
    // 3. Same sessionId AND same deviceUuid (stored in userAgent)
    const matchConditions: any[] = [
      { username: { equals: username.trim(), mode: 'insensitive' } }
    ];

    if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
      matchConditions.push({ ipAddress });
    }

    if (deviceUuid) {
      matchConditions.push({ userAgent: { contains: `[UUID:${deviceUuid}]` } });
    }

    let record = await prisma.attendanceRecord.findFirst({
      where: {
        sessionId: session.id,
        OR: matchConditions,
      },
      orderBy: { firstSeen: 'asc' }
    });

    if (record) {
      const totalMinutes = calculateTotalMinutes(record.firstSeen, now);
      record = await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          username: username.trim(), // update to latest username spelling if corrected
          lastSeen: now,
          totalMinutes,
          ipAddress: ipAddress || record.ipAddress,
          userAgent: combinedUserAgent || record.userAgent,
          status: 'ONLINE',
        }
      });
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          username: username.trim(),
          date,
          firstSeen: now,
          lastSeen: now,
          ipAddress,
          userAgent: combinedUserAgent,
          status: 'ONLINE',
        }
      });
    }

    return NextResponse.json({ success: true, record }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
