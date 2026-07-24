import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();
    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Missing or invalid code parameter' }, { status: 400 });
    }

    let session = await prisma.attendanceSession.findUnique({
      where: { code }
    });

    // Auto-create active session if valid code is passed (fail-safe for shared links)
    if (!session) {
      session = await prisma.attendanceSession.create({
        data: { code, isActive: true }
      });
    }

    return NextResponse.json({ id: session.id, code: session.code, isActive: session.isActive });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
