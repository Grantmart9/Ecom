/**
 * Auth login endpoint - validates credentials and creates session.
 */
import { NextResponse } from 'next/server';
import { users, userSessions } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    // For demo: create admin user if no users exist
    const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    if (Number(count) === 0) {
      const demoEmail = 'admin@example.com';

      // Create demo admin user
      await db.insert(users).values({
        email: demoEmail,
        username: 'admin',
        hashedPassword: '$2a$10$dummyhash',
        role: 'admin',
        status: 'active',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const [user] = await db.select().from(users).where(eq(users.email, demoEmail));

      const sessionToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.insert(userSessions).values({
        userId: user.id,
        token: sessionToken,
        refreshToken: null,
        expiresAt,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      });

      const response = NextResponse.json({ success: true, demo: true });
      response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
      });

      return response;
    }

    // Normal login flow when users exist
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }

    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(userSessions).values({
      userId: user.id,
      token: sessionToken,
      refreshToken: null,
      expiresAt,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    return response;
  } catch (e) {
    console.error('[api/auth/login]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
