import { db } from '@/db/client';
import { discountCodes, users, orders } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export type CouponValidationInput = {
  code: string;
  userId?: number;
  orderTotal: number;
};

export type CouponValidationResult = {
  valid: boolean;
  discountCodeId?: number;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
  message?: string;
};

export type DiscountCodeWithValidation = {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minimumPurchase: number;
  maximumUsage: number | null;
  usageCount: number;
  usageLimitPerUser: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export async function validateCoupon(input: CouponValidationInput): Promise<CouponValidationResult> {
  const { code, userId, orderTotal } = input;

  const normalizedCode = code.trim().toUpperCase();

  const rows = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, normalizedCode))
    .limit(1);

  const coupon = rows[0];

  if (!coupon) {
    return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: 'Coupon code not found' };
  }

  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: 'This coupon is no longer active' };
  }

  const now = new Date();

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: 'This coupon has not started yet' };
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: 'This coupon has expired' };
  }

  if (coupon.maximumUsage !== null && coupon.usageCount >= coupon.maximumUsage) {
    return { valid: false, discountAmount: 0, finalTotal: orderTotal, message: 'This coupon has reached its usage limit' };
  }

  if (orderTotal < Number(coupon.minimumPurchase)) {
    return {
      valid: false,
      discountAmount: 0,
      finalTotal: orderTotal,
      message: `Minimum purchase of ${Number(coupon.minimumPurchase).toFixed(2)} required`,
    };
  }

  if (userId && coupon.usageLimitPerUser > 0) {
    const userUsage = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          sql`LOWER(${orders.discountAmount})::numeric > 0`,
          sql`EXISTS (SELECT 1 FROM ${orders} o2 WHERE o2.id = ${orders.id} AND o2.updated_at >= ${coupon.startsAt ?? '1970-01-01'} AND o2.updated_at <= ${coupon.endsAt ?? '9999-12-31'})`
        )
      );

    const usageCountForUser = Number(userUsage[0]?.count ?? 0);
    if (usageCountForUser >= coupon.usageLimitPerUser) {
      return {
        valid: false,
        discountAmount: 0,
        finalTotal: orderTotal,
        message: `You have already used this coupon ${coupon.usageLimitPerUser} time(s)`,
      };
    }
  }

  let discountAmount = 0;
  const discountValue = Number(coupon.discountValue);

  if (coupon.discountType === 'percentage') {
    discountAmount = orderTotal * (discountValue / 100);
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }
  } else if (coupon.discountType === 'fixed_amount') {
    discountAmount = discountValue;
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }
  } else if (coupon.discountType === 'free_shipping') {
    discountAmount = 0;
  }

  const finalTotal = Math.max(0, orderTotal - discountAmount);

  return {
    valid: true,
    discountCodeId: coupon.id,
    discountType: coupon.discountType as 'percentage' | 'fixed_amount',
    discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,
  };
}

export async function getActiveCoupons() {
  const now = new Date();
  const rows = await db
    .select()
    .from(discountCodes)
    .where(
      and(
        eq(discountCodes.isActive, true),
        sql`(${discountCodes.startsAt} IS NULL OR ${discountCodes.startsAt} <= ${now})`,
        sql`(${discountCodes.endsAt} IS NULL OR ${discountCodes.endsAt} >= ${now})`,
        sql`(${discountCodes.maximumUsage} IS NULL OR ${discountCodes.usageCount} < ${discountCodes.maximumUsage})`
      )
    )
    .orderBy(desc(discountCodes.createdAt));

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    description: r.description,
    discountType: r.discountType,
    discountValue: Number(r.discountValue),
    minimumPurchase: Number(r.minimumPurchase),
    maximumUsage: r.maximumUsage,
    usageCount: r.usageCount,
    usageLimitPerUser: r.usageLimitPerUser,
    startsAt: r.startsAt?.toISOString() ?? null,
    endsAt: r.endsAt?.toISOString() ?? null,
    isActive: r.isActive,
  })) as DiscountCodeWithValidation[];
}

export async function getAllCoupons() {
  const rows = await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    description: r.description,
    discountType: r.discountType,
    discountValue: Number(r.discountValue),
    minimumPurchase: Number(r.minimumPurchase),
    maximumUsage: r.maximumUsage,
    usageCount: r.usageCount,
    usageLimitPerUser: r.usageLimitPerUser,
    startsAt: r.startsAt?.toISOString() ?? null,
    endsAt: r.endsAt?.toISOString() ?? null,
    isActive: r.isActive,
  })) as DiscountCodeWithValidation[];
}

export async function incrementCouponUsage(couponId: number) {
  const [updated] = await db
    .update(discountCodes)
    .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
    .where(eq(discountCodes.id, couponId))
    .returning();

  return updated;
}
