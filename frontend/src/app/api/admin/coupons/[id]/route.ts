/**
 * Admin single coupon API route - update and delete coupons.
 */
import { NextResponse } from 'next/server';
import { discountCodes } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(255).optional(),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_shipping']).optional(),
  discountValue: z.number().positive().optional(),
  minimumPurchase: z.number().nonnegative().optional(),
  maximumUsage: z.number().int().positive().optional().nullable(),
  usageLimitPerUser: z.number().int().positive().optional(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/admin/coupons/[id] - Update coupon
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const couponId = Number(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ detail: 'Invalid coupon ID' }, { status: 400 });
    }

    const [existing] = await db.select().from(discountCodes).where(eq(discountCodes.id, couponId));
    if (!existing) {
      return NextResponse.json({ detail: 'Coupon not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateCouponSchema.parse(body);

    const now = new Date();
    const updateValues: Record<string, unknown> = { updatedAt: now };

    if (validated.code !== undefined) {
      const existingCode = await db.select().from(discountCodes).where(
        and(eq(discountCodes.code, validated.code.toUpperCase()), sql`${discountCodes.id} != ${couponId}`)
      );
      if (existingCode.length > 0) {
        return NextResponse.json({ detail: 'Code already in use' }, { status: 400 });
      }
      updateValues.code = validated.code.toUpperCase();
    }
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.discountType !== undefined) updateValues.discountType = validated.discountType;
    if (validated.discountValue !== undefined) updateValues.discountValue = String(validated.discountValue);
    if (validated.minimumPurchase !== undefined) updateValues.minimumPurchase = String(validated.minimumPurchase);
    if (validated.maximumUsage !== undefined) updateValues.maximumUsage = validated.maximumUsage;
    if (validated.usageLimitPerUser !== undefined) updateValues.usageLimitPerUser = validated.usageLimitPerUser;
    if (validated.startsAt !== undefined) updateValues.startsAt = validated.startsAt ? new Date(validated.startsAt) : null;
    if (validated.endsAt !== undefined) updateValues.endsAt = validated.endsAt ? new Date(validated.endsAt) : null;
    if (validated.isActive !== undefined) updateValues.isActive = validated.isActive;

    const [updated] = await db.update(discountCodes).set(updateValues).where(eq(discountCodes.id, couponId)).returning();

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/admin/coupons/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/coupons/[id] - Delete coupon
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const couponId = Number(id);
    if (isNaN(couponId)) {
      return NextResponse.json({ detail: 'Invalid coupon ID' }, { status: 400 });
    }

    const [existing] = await db.select().from(discountCodes).where(eq(discountCodes.id, couponId));
    if (!existing) {
      return NextResponse.json({ detail: 'Coupon not found' }, { status: 404 });
    }

    await db.delete(discountCodes).where(eq(discountCodes.id, couponId));

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (e) {
    console.error('[api/admin/coupons/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}