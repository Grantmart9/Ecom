/**
 * Admin customers API route - list users with order totals.
 */
import { NextResponse } from 'next/server';
import { users, orders } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, count, sum, and, ilike, desc } from 'drizzle-orm';

export const runtime = 'nodejs';
/**
 * GET /api/admin/customers - List all users with order totals
 * Query params: skip, limit, search
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const searchParams = new URL(req.url).searchParams;
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const rawLimit = Number(searchParams.get('limit') || 20);
    const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
    const searchQuery = searchParams.get('search');

    const searchPattern = searchQuery ? `%${searchQuery}%` : null;

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        isVerified: users.isVerified,
        totalOrders: count(orders.id).as('total_orders'),
        totalSpent: sum(orders.totalAmount).as('total_spent'),
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(orders, eq(users.id, orders.userId))
      .where(
        searchQuery ? and(ilike(users.email, searchPattern!)) : undefined
      )
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(skip);

    const totalResult = await db.select({ count: count() }).from(users);

    return NextResponse.json({
      data: rows.map((r) => ({
        id: r.id,
        email: r.email,
        username: r.username,
        firstName: r.firstName,
        lastName: r.lastName,
        role: r.role,
        status: r.status,
        isVerified: r.isVerified,
        totalOrders: Number(r.totalOrders ?? 0),
        totalSpent: Number(r.totalSpent ?? 0),
        createdAt: r.createdAt.toISOString(),
      })),
      total: totalResult[0]?.count ?? 0,
      skip,
      limit,
    });
  } catch (e) {
    console.error('[api/admin/customers]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}