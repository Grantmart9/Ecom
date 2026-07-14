/**
 * Admin single-order API route - fetches one order with items and timestamps.
 */
import { NextResponse } from 'next/server';
import { orders, orderItems } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) {
      return NextResponse.json({ detail: 'Order not found' }, { status: 404 });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    return NextResponse.json({
      order: {
        id: order.id,
        userId: order.userId,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
        shippingMethod: order.shippingMethod,
        paymentMethod: order.paymentMethod,
        customerNotes: order.customerNotes,
        adminNotes: order.adminNotes,
        trackingNumber: order.trackingNumber ?? null,
        shippingCarrier: order.shippingCarrier ?? null,
        confirmedAt: order.confirmedAt?.toISOString() ?? null,
        shippedAt: order.shippedAt?.toISOString() ?? null,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
        cancelledAt: order.cancelledAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items,
      },
    });
  } catch (e) {
    console.error('[api/admin/orders/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber, shippingCarrier, adminNotes } = body;

    const [{ db }, { eq }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) {
      return NextResponse.json({ detail: 'Order not found' }, { status: 404 });
    }

    if (existing.status === 'delivered' && status && status !== 'delivered') {
      return NextResponse.json({ detail: 'Cannot modify a completed order' }, { status: 400 });
    }

    const now = new Date();
    const update: Record<string, unknown> = { updatedAt: now };
    if (status) {
      update.status = status;
      if (status === 'confirmed' && !existing.confirmedAt) update.confirmedAt = now;
      else if (status === 'shipped' && !existing.shippedAt) update.shippedAt = now;
      else if (status === 'delivered' && !existing.deliveredAt) update.deliveredAt = now;
      else if (status === 'cancelled' && !existing.cancelledAt) update.cancelledAt = now;
    }
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (shippingCarrier !== undefined) update.shippingCarrier = shippingCarrier;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const [updated] = await db.update(orders).set(update).where(eq(orders.id, id)).returning();

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      trackingNumber: updated.trackingNumber ?? null,
      shippingCarrier: updated.shippingCarrier ?? null,
      adminNotes: updated.adminNotes ?? null,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error('[api/admin/orders/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
