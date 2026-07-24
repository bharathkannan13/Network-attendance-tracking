import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = loginSchema.parse(body);

    const envUser = (process.env.ADMIN_USERNAME || 'admin').trim();
    const envPass = (process.env.ADMIN_PASSWORD || 'RambollAdmin2026').trim();

    const isEnvMatch = username.trim().toLowerCase() === envUser.toLowerCase() && password === envPass;

    let admin = await prisma.admin.findUnique({ where: { username: envUser } });

    // Fail-proof admin login: if credentials match environment setup, auto-upsert Admin record
    if (isEnvMatch) {
      const hash = await bcrypt.hash(password, 10);
      admin = await prisma.admin.upsert({
        where: { username: envUser },
        update: { passwordHash: hash },
        create: { username: envUser, passwordHash: hash }
      });
    }

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await signToken({ username: admin.username, adminId: admin.id });
    await setAuthCookie(token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
