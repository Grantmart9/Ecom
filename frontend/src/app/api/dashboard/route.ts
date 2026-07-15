import { NextResponse } from 'next/server';
import {
  orders, users, products, inventory, discountCodes, reviews
} from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, sql, count, sum, gte, lt, desc, and } from 'drizzle-orm';

export const runtime = 'nodejs';

type Stats = {
  revenue: { total: number; monthly: number };
  orders: { total: number; pending: number; processing: number; delivered: number; cancelled: number };
  customers: number;
  products: { total: number; active: number; lowStock: number };
  reviews: number;
  coupons: number;
  period: string;
};

async function getAdminUser(req: NextRequest) {
  const sessionToken = req.cookies.get('session_token')?.value;
  if (!sessionToken) return null;

  const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);
  const { userSessions } = await import('@/db/schema');
  const { gt, and: andCond } = await import('drizzle-orm');

  const now = new Date();
  const result = await db
    .select({ role: users.role })
    .from(userSessions)
    .innerJoin(users, eq(userSessions.userId, users.id))
    .where(
      andCond(
        eq(userSessions.token, sessionToken),
        gt(userSessions.expiresAt, now)
      )
    )
    .limit(1);

  if (result.length === 0 || result[0].role !== 'admin') return null;
  return result[0];
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) {
      return NextResponse.json({ detail: 'Admin access required' }, { status: 403 });
    }

    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const searchParams = new URL(req.url).searchParams;
    const period = searchParams.get('period') || '30d';

    let dateFrom: Date;
    const now = new Date();
    if (period === '7d') {
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const revenue = { total: 0, monthly: 0 };
    const orderStatuses: Record<string, number> = {};
    let totalOrders = 0;
    let customers = 0;
    const productsStats = { total: 0, active: 0, lowStock: 0 };
    let reviewsCount = 0;
    let couponsCount = 0;

    try {
      const orderTotalResult = await db
        .select({ count: count(), revenue: sum(orders.totalAmount) })
        .from(orders)
        .where(gte(orders.createdAt, dateFrom));
      totalOrders = Number(orderTotalResult[0]?.count ?? 0);
      revenue.total = Number(orderTotalResult[0]?.revenue ?? 0);
    } catch (e) {
      console.error('[api/dashboard] orders query failed', e);
    }

    try {
      const statusCounts = await db
        .select({ status: orders.status, count: count() })
        .from(orders)
        .where(gte(orders.createdAt, dateFrom))
        .groupBy(orders.status);
      statusCounts.forEach((row) => {
        orderStatuses[row.status] = Number(row.count);
      });
    } catch (e) {
      console.error('[api/dashboard] status counts query failed', e);
    }

    try {
      const customerCount = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.isDeleted, false));
      customers = Number(customerCount[0]?.count ?? 0);
    } catch (e) {
      console.error('[api/dashboard] customers query failed', e);
    }

    try {
      const productCounts = await db
        .select({ count: count(), active: sql<number>`SUM(CASE WHEN ${products.isActive} = true THEN 1 ELSE 0 END)` })
        .from(products);
      const productRow = productCounts[0];
      productsStats.total = Number(productRow?.count ?? 0);
      productsStats.active = Number(productRow?.active ?? 0);
    } catch (e) {
      console.error('[api/dashboard] products query failed', e);
    }

    try {
      const lowStockCount = await db
        .select({ count: count() })
        .from(inventory)
        .where(sql`${inventory.quantity} <= COALESCE(${inventory.lowStockThreshold}, 10)`);
      productsStats.lowStock = Number(lowStockCount[0]?.count ?? 0);
    } catch (e) {
      console.error('[api/dashboard] low stock query failed', e);
    }

    try {
      const reviewCount = await db
        .select({ count: count() })
        .from(reviews);
      reviewsCount = Number(reviewCount[0]?.count ?? 0);
    } catch (e) {
      console.error('[api/dashboard] reviews query failed', e);
    }

    try {
      const couponCount = await db
        .select({ count: count() })
        .from(discountCodes)
        .where(eq(discountCodes.isActive, true));
      couponsCount = Number(couponCount[0]?.count ?? 0);
    } catch (e) {
      console.error('[api/dashboard] coupons query failed', e);
    }

    try {
      const monthlyRevenueResult = await db
        .select({ revenue: sum(orders.totalAmount) })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, new Date(now.getFullYear(), now.getMonth() - 1, 1)),
            lt(orders.createdAt, new Date(now.getFullYear(), now.getMonth() + 1, 1))
          )
        );
      revenue.monthly = Number(monthlyRevenueResult[0]?.revenue ?? 0);
    } catch (e) {
      console.error('[api/dashboard] monthly revenue query failed', e);
    }

    const stats: Stats = {
      revenue,
      orders: {
        total: totalOrders,
        pending: orderStatuses['pending'] ?? 0,
        processing: orderStatuses['processing'] ?? 0,
        delivered: orderStatuses['delivered'] ?? 0,
        cancelled: orderStatuses['cancelled'] ?? 0,
      },
      customers,
      products: productsStats,
      reviews: reviewsCount,
      coupons: couponsCount,
      period,
    };

    return NextResponse.json(stats);
  } catch (e) {
    console.error('[api/dashboard]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}


