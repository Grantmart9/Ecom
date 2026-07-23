import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { orders, payments, orderItems } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = typeof value === 'string' ? value : '';
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID || '';

    const sortedKeys = Object.keys(data).sort((a, b) => a.localeCompare(b));
    const pairs = sortedKeys
      .filter((key) => key !== 'signature' && data[key] !== '')
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
    const paramString = pairs.join('&');
    const signature = crypto.createHash('md5').update(paramString).digest('hex');

    if (data.merchant_id !== merchantId || data.signature !== signature) {
      console.error('[payfast/itn] Invalid signature');
      return NextResponse.json({ status: 'invalid' }, { status: 400 });
    }

    const mPaymentId = data.m_payment_id;
    const pfPaymentId = data.pf_payment_id;
    const paymentStatus = data.payment_status?.toUpperCase();

    if (!mPaymentId || !pfPaymentId) {
      return NextResponse.json({ status: 'missing' }, { status: 400 });
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, mPaymentId)).limit(1);
    if (!order) {
      return NextResponse.json({ status: 'order_not_found' }, { status: 404 });
    }

    const [payment] = await db.select().from(payments).where(eq(payments.orderId, mPaymentId)).limit(1);

    if (paymentStatus === 'COMPLETE') {
      await db.update(orders).set({
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentTransactionId: pfPaymentId,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(orders.id, mPaymentId));

      if (payment) {
        await db.update(payments).set({
          status: 'completed',
          providerPaymentId: pfPaymentId,
          updatedAt: new Date(),
        }).where(eq(payments.id, payment.id));
      }

      const orderItemsList = await db.select().from(orderItems).where(eq(orderItems.orderId, mPaymentId));
      for (const item of orderItemsList) {
        await db.execute(sql`
          INSERT INTO inventory_movements (product_id, quantity_change, movement_type, reference_type, reference_id, notes, created_at)
          VALUES (${item.productId}, -${item.quantity}, 'order_fulfilled', 'order', ${mPaymentId}, 'Order confirmed via Payfast', NOW())
          ON CONFLICT DO NOTHING
        `);
      }
    } else if (paymentStatus === 'FAILED') {
      await db.update(orders).set({
        status: 'cancelled',
        paymentStatus: 'failed',
        updatedAt: new Date(),
      }).where(eq(orders.id, mPaymentId));

      if (payment) {
        await db.update(payments).set({
          status: 'failed',
          failureReason: data.results_description || 'Payment failed',
          updatedAt: new Date(),
        }).where(eq(payments.id, payment.id));
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (e) {
    console.error('[api/checkout/payfast/itn]', e);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
