/**
 * Admin authentication endpoint.
 * Validates session and returns user info if admin.
 */
import { NextResponse } from 'next/server';
import { users, userSessions } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, and, gt } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ detail: 'No session token' }, { status: 401 });
    }

    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const now = new Date();
    const result = await db
      .select({
        userId: users.id,
        email: users.email,
        role: users.role,
        firstName: users.firstName,
        lastName: users.lastName,
        sessionExpiresAt: userSessions.expiresAt,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(
          eq(userSessions.token, sessionToken),
          gt(userSessions.expiresAt, now)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ detail: 'Invalid or expired session' }, { status: 401 });
    }

    const user = result[0];

    if (user.role !== 'admin') {
      return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (e) {
    console.error('[api/admin/auth]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}