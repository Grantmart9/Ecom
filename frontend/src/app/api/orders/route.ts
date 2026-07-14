/**
 * Orders API route - handles listing, creating, and status transitions.
 * Stock is automatically reduced on delivered orders and restored on cancellation.
 */
import { NextResponse } from 'next/server';
import { orders, orderItems, users } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const createOrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
  })).min(1),
  shippingAddressId: z.number().int().positive().optional(),
  billingAddressId: z.number().int().positive().optional(),
  shippingMethod: z.string().optional(),
  paymentMethod: z.string().optional(),
  currency: z.string().length(3).default('ZAR'),
  customerNotes: z.string().optional(),
});

/**
 * GET /api/orders - List orders (paginated, filterable by userId and orderNumber)
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }, { eq, and, count }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const searchParams = new URL(req.url).searchParams;
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const userId = searchParams.get('userId');
    const orderNumber = searchParams.get('orderNumber');

    let rows;
    if (userId && orderNumber) {
      rows = await db.select().from(orders).where(and(eq(orders.userId, Number(userId)), eq(orders.orderNumber, orderNumber))).limit(limit).offset(skip);
    } else if (userId) {
      rows = await db.select().from(orders).where(eq(orders.userId, Number(userId))).limit(limit).offset(skip);
    } else if (orderNumber) {
      rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(limit).offset(skip);
    } else {
      rows = await db.select().from(orders).limit(limit).offset(skip);
    }

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

    const totalResult = await db.select({ count: count() }).from(orders);
    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({ data: mapped, total, skip, limit });
  } catch (e) {
    console.error('[api/orders]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/orders - Create a new order
 */
export async function POST(req: NextRequest) {
  try {
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const body = await req.json();
    const validated = createOrderSchema.parse(body);

    const userCheck = await db.select().from(users).where(eq(users.id, validated.userId));
    if (userCheck.length === 0) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date();

    const subtotal = validated.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const taxes = 0;
    const shipping = 0;
    const total = subtotal + taxes + shipping;

    const [newOrder] = await db.insert(orders).values({
      userId: validated.userId,
      orderNumber,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      subtotal: String(subtotal),
      taxAmount: '0',
      shippingAmount: '0',
      discountAmount: '0',
      totalAmount: String(total),
      currency: validated.currency,
      createdAt: now,
      updatedAt: now,
    }).returning();

    const orderItemRows = validated.items.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: `Product ${item.productId}`,
      productSku: null,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.unitPrice * item.quantity),
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(orderItems).values(orderItemRows);

    const createdAtStr = now.toISOString();
    return NextResponse.json({
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      status: newOrder.status,
      totalAmount: newOrder.totalAmount,
      createdAt: createdAtStr,
    }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/orders]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
