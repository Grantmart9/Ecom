import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { orders, orderItems, payments, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { buildPayfastForm, generateWebCheckoutSignature } from '@/lib/payments/web';
import type { PayfastWebCheckoutParams } from '@/lib/payments/types';
import { payfastConfig, isPayfastConfigured } from '@/lib/payments/config';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, shippingAddressId, billingAddressId, shippingMethod, paymentMethod, currency, coupon, customerNotes } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ detail: 'Invalid checkout payload' }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    const subtotal = items.reduce((sum: number, item: { productId: number; quantity: number; unitPrice: number }) => sum + item.unitPrice * item.quantity, 0);
    const tax = 0;
    const shipping = shippingMethod ? 3000 : 0;
    const discount = coupon?.discountAmount || 0;
    const total = Math.max(0, subtotal + tax + shipping - discount);

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = new Date();

    const [newOrder] = await db.insert(orders).values({
      userId,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: String(subtotal),
      taxAmount: String(tax),
      shippingAmount: String(shipping),
      discountAmount: String(discount),
      totalAmount: String(total),
      currency: currency || 'ZAR',
      billingAddressId: billingAddressId || null,
      shippingAddressId: shippingAddressId || null,
      shippingMethod: shippingMethod || null,
      paymentMethod: paymentMethod || 'payfast',
      customerNotes: customerNotes || null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    const orderItemRows = items.map((item: { productId: number; quantity: number; unitPrice: number }) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: `Product ${item.productId}`,
      productSku: null,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.unitPrice * item.quantity),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(orderItems).values(orderItemRows);

    const [payment] = await db.insert(payments).values({
      orderId: newOrder.id,
      amount: String(total),
      currency: currency || 'ZAR',
      status: 'pending',
      paymentMethod: 'payfast',
      provider: 'payfast',
      createdAt: now,
      updatedAt: now,
    }).returning();

    if (!isPayfastConfigured()) {
      return NextResponse.json({ detail: 'Payfast is not configured' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutParams: PayfastWebCheckoutParams = {
      merchantId: payfastConfig.merchantId,
      merchantKey: payfastConfig.merchantKey,
      amount: total,
      itemName: `Order ${orderNumber}`,
      itemDescription: customerNotes || `Order ${orderNumber} from ${user.email}`,
      returnUrl: `${baseUrl}/checkout/success?order_id=${newOrder.id}`,
      cancelUrl: `${baseUrl}/checkout/cancel?order_id=${newOrder.id}`,
      notifyUrl: `${baseUrl}/api/checkout/payfast/itn`,
      mPaymentId: newOrder.id,
      emailAddress: user.email || '',
      nameFirst: user.firstName || '',
      nameLast: user.lastName || '',
    };

    const signature = generateWebCheckoutSignature(checkoutParams, payfastConfig.merchantKey);
    const formParams = buildPayfastForm(checkoutParams, signature);

    return NextResponse.json({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      paymentId: payment.id,
      formParams,
      payfastUrl: 'https://www.payfast.co.za/eng/process',
    });
  } catch (e) {
    console.error('[api/checkout/payfast/initiate]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
