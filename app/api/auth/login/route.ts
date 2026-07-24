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

    const inputUser = username.trim();
    const isEnvUser = inputUser.toLowerCase() === envUser.toLowerCase();
    const isEnvPass = password === envPass;

    let adminAuthenticated = false;

    // Try database authentication & upsert first
    try {
      let admin = await prisma.admin.findUnique({ where: { username: envUser } });

      if (isEnvUser && isEnvPass) {
        const hash = await bcrypt.hash(password, 10);
        admin = await prisma.admin.upsert({
          where: { username: envUser },
          update: { passwordHash: hash },
          create: { username: envUser, passwordHash: hash }
        });
        adminAuthenticated = true;
      } else if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
        adminAuthenticated = true;
      }
    } catch (dbError) {
      console.error("Database connection error during login:", dbError);
      // DB Fallback: allow admin login via environment credentials if DB is temporarily unreachable
      if (isEnvUser && isEnvPass) {
        adminAuthenticated = true;
      }
    }

    if (!adminAuthenticated) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await signToken({ username: envUser, adminId: 'admin-root' });
    await setAuthCookie(token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: error?.message || 'Invalid login request' }, { status: 400 });
  }
}
