import { NextResponse } from 'next/server';
import { orders } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { transitionOrderStatus } from '@/lib/inventory';

export const runtime = 'nodejs';

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) {
      return NextResponse.json({ detail: 'Order not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateOrderStatusSchema.parse(body);

    if (existing.status === 'delivered' && validated.status !== 'delivered') {
      return NextResponse.json({ detail: 'Cannot modify a completed order' }, { status: 400 });
    }

    const now = new Date();
    const update: Record<string, Date | string> = { status: validated.status, updatedAt: now };

    if (validated.status === 'confirmed' && !existing.confirmedAt) {
      update.confirmedAt = now;
    } else if (validated.status === 'shipped' && !existing.shippedAt) {
      update.shippedAt = now;
    } else if (validated.status === 'delivered' && !existing.deliveredAt) {
      update.deliveredAt = now;
    } else if (validated.status === 'cancelled' && !existing.cancelledAt) {
      update.cancelledAt = now;
    }

    const [updated] = await db.update(orders).set(update).where(eq(orders.id, id)).returning();

    await transitionOrderStatus({
      orderId: id,
      status: validated.status as 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
      userId: existing.userId,
    });

    return NextResponse.json({
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/orders/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
