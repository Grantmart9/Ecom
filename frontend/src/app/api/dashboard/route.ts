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

export async function GET(req: NextRequest) {
  try {
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

    const orderTotalResult = await db
      .select({ count: count(), revenue: sum(orders.totalAmount) })
      .from(orders)
      .where(gte(orders.createdAt, dateFrom));

    const statusCounts = await db
      .select({ status: orders.status, count: count() })
      .from(orders)
      .where(gte(orders.createdAt, dateFrom))
      .groupBy(orders.status);

    const customerCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isDeleted, false));

    const productCounts = await db
      .select({ count: count(), active: sql<number>`SUM(CASE WHEN ${products.isActive} = true THEN 1 ELSE 0 END)` })
      .from(products);

    const lowStockCount = await db
      .select({ count: count() })
      .from(inventory)
      .where(sql`${inventory.quantity} <= COALESCE(${inventory.lowStockThreshold}, 10)`);

    const reviewCount = await db
      .select({ count: count() })
      .from(reviews);

    const couponCount = await db
      .select({ count: count() })
      .from(discountCodes)
      .where(eq(discountCodes.isActive, true));

    const monthlyRevenueResult = await db
      .select({ revenue: sum(orders.totalAmount) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(now.getFullYear(), now.getMonth() - 1, 1)),
          lt(orders.createdAt, new Date(now.getFullYear(), now.getMonth() + 1, 1))
        )
      );

    const totalRevenueRow = orderTotalResult[0] ?? { count: 0, revenue: 0 };
    const monthlyRevenueRow = monthlyRevenueResult[0] ?? { revenue: 0 };

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((row) => {
      statusMap[row.status] = Number(row.count);
    });

    const productRow = productCounts[0] ?? { count: 0, active: 0 };

    const stats: Stats = {
      revenue: {
        total: Number(totalRevenueRow.revenue ?? 0),
        monthly: Number(monthlyRevenueRow.revenue ?? 0),
      },
      orders: {
        total: Number(totalRevenueRow.count ?? 0),
        pending: statusMap['pending'] ?? 0,
        processing: statusMap['processing'] ?? 0,
        delivered: statusMap['delivered'] ?? 0,
        cancelled: statusMap['cancelled'] ?? 0,
      },
      customers: Number(customerCount[0]?.count ?? 0),
      products: {
        total: Number(productRow.count ?? 0),
        active: Number(productRow.active ?? 0),
        lowStock: Number(lowStockCount[0]?.count ?? 0),
      },
      reviews: Number(reviewCount[0]?.count ?? 0),
      coupons: Number(couponCount[0]?.count ?? 0),
      period,
    };

    return NextResponse.json(stats);
  } catch (e) {
    console.error('[api/dashboard]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}


