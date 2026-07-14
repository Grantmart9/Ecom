/**
 * Admin orders list API route - supports filtering, listing, and ordering.
 */
import { NextResponse } from 'next/server';
import { orders } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, sql, and, count } from 'drizzle-orm';
import { listOrdersForAdmin } from '@/lib/orders';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('orderNumber');
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));

    const { orders: rows, total } = await listOrdersForAdmin({
      userId: userId ? Number(userId) : undefined,
      status: status || undefined,
      orderNumber: orderNumber || undefined,
      skip,
      limit,
    });

    const mapped = rows.map((o) => ({
      id: o.id,
      userId: o.userId,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: o.subtotal,
      totalAmount: o.totalAmount,
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    return NextResponse.json({ orders: mapped, total, skip, limit });
  } catch (e) {
    console.error('[api/admin/orders]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
