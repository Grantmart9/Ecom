/**
 * Order service - centralizes order workflow transitions and side-effects.
 */
import { db } from '@/db/client';
import { orders, orderItems, inventory, notifications } from '@/db/schema';
import { eq, sql, and, type SQL } from 'drizzle-orm';

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export interface OrderTransitionInput {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  adminNotes?: string | null;
  userId?: number | null;
}

export interface AdminOrderUpdateInput {
  status?: OrderStatus;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  adminNotes?: string | null;
}

export async function transitionOrderStatus(input: OrderTransitionInput) {
  const { orderId, status, trackingNumber, shippingCarrier, adminNotes, userId } = input;

  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!existing) {
    throw new Error('Order not found');
  }

  if (existing.status === 'delivered' && status !== 'delivered') {
    throw new Error('Cannot modify a completed order');
  }

  const now = new Date();
  const update: Record<string, unknown> = { status, updatedAt: now };

  if (status === 'confirmed' && !existing.confirmedAt) update.confirmedAt = now;
  else if (status === 'shipped' && !existing.shippedAt) update.shippedAt = now;
  else if (status === 'delivered' && !existing.deliveredAt) update.deliveredAt = now;
  else if (status === 'cancelled' && !existing.cancelledAt) update.cancelledAt = now;

  if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
  if (shippingCarrier !== undefined) update.shippingCarrier = shippingCarrier;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const [updated] = await db.update(orders).set(update).where(eq(orders.id, orderId)).returning();

  if (userId) {
    void enqueueCustomerNotification({
      userId,
      orderId,
      status,
      trackingNumber: trackingNumber ?? existing.trackingNumber,
      shippingCarrier: shippingCarrier ?? existing.shippingCarrier,
    });
  }

  return updated;
}

export async function updateOrderFromAdmin(orderId: string, payload: AdminOrderUpdateInput) {
  if (!payload.status && !payload.trackingNumber && !payload.shippingCarrier && !payload.adminNotes) {
    throw new Error('No changes provided');
  }

  const existing = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!existing.length) {
    throw new Error('Order not found');
  }

  const order = existing[0];

  if (payload.status && order.status === 'delivered' && payload.status !== 'delivered') {
    throw new Error('Cannot modify a completed order');
  }

  const now = new Date();
  const update: Record<string, unknown> = { updatedAt: now };

  if (payload.status) {
    update.status = payload.status;
    if (payload.status === 'confirmed' && !order.confirmedAt) update.confirmedAt = now;
    else if (payload.status === 'shipped' && !order.shippedAt) update.shippedAt = now;
    else if (payload.status === 'delivered' && !order.deliveredAt) update.deliveredAt = now;
    else if (payload.status === 'cancelled' && !order.cancelledAt) update.cancelledAt = now;
  }
  if (payload.trackingNumber !== undefined) update.trackingNumber = payload.trackingNumber;
  if (payload.shippingCarrier !== undefined) update.shippingCarrier = payload.shippingCarrier;
  if (payload.adminNotes !== undefined) update.adminNotes = payload.adminNotes;

  const [updated] = await db.update(orders).set(update).where(eq(orders.id, orderId)).returning();

  if (payload.status && order.userId) {
    void enqueueCustomerNotification({
      userId: order.userId,
      orderId,
      status: payload.status,
      trackingNumber: payload.trackingNumber ?? order.trackingNumber,
      shippingCarrier: payload.shippingCarrier ?? order.shippingCarrier,
      adminNotes: payload.adminNotes ?? order.adminNotes,
    });
  }

  return updated;
}

export async function listOrdersForAdmin(filters: { userId?: number; status?: string; orderNumber?: string; skip?: number; limit?: number }) {
  const skip = filters.skip ?? 0;
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const clauses: SQL[] = [];

  if (filters.userId) clauses.push(eq(orders.userId, filters.userId));
  if (filters.status) clauses.push(eq(orders.status, filters.status));
  if (filters.orderNumber) clauses.push(eq(orders.orderNumber, filters.orderNumber));

  const where = clauses.length ? and(...clauses) : undefined;

  const rows = where
    ? await db.select().from(orders).where(where).orderBy(sql`${orders.createdAt} DESC`).limit(limit).offset(skip)
    : await db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`).limit(limit).offset(skip);

  const [{ count: total }] = (where
    ? await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(where)
    : await db.select({ count: sql<number>`COUNT(*)` }).from(orders));

  return { orders: rows, total: Number(total ?? 0), skip, limit };
}

async function enqueueCustomerNotification({
  userId,
  orderId,
  status,
  trackingNumber,
  shippingCarrier,
  adminNotes,
}: {
  userId: number;
  orderId: string;
  status: string;
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
  adminNotes?: string | null;
}) {
  const title = `Order ${orderId} status updated`;
  const message = [
    `Your order has been updated to: ${status}`,
    trackingNumber ? `Tracking: ${trackingNumber}${shippingCarrier ? ` via ${shippingCarrier}` : ''}` : null,
    adminNotes ? `Note: ${adminNotes}` : null,
  ].filter(Boolean).join('\n');

  await db.insert(notifications).values({
    userId,
    type: 'order',
    title,
    message,
    isRead: false,
    data: JSON.stringify({ orderId, status, trackingNumber, shippingCarrier }),
    createdAt: new Date(),
  });
}
