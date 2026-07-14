/**
 * Admin coupons API route - CRUD operations for discount codes.
 */
import { NextResponse } from 'next/server';
import { discountCodes } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().max(255).optional(),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  discountValue: z.number().positive(),
  minimumPurchase: z.number().nonnegative().default(0),
  maximumUsage: z.number().int().positive().optional().nullable(),
  usageLimitPerUser: z.number().int().positive().default(1),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updateCouponSchema = createCouponSchema.partial();

/**
 * POST /api/admin/coupons - Create a new coupon
 */
export async function POST(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const body = await req.json();
    const validated = createCouponSchema.parse(body);

    const existing = await db.select().from(discountCodes).where(eq(discountCodes.code, validated.code.toUpperCase()));
    if (existing.length > 0) {
      return NextResponse.json({ detail: 'Coupon code already exists' }, { status: 400 });
    }

    const now = new Date();
    const [newCoupon] = await db.insert(discountCodes).values({
      code: validated.code.toUpperCase(),
      description: validated.description || null,
      discountType: validated.discountType,
      discountValue: String(validated.discountValue),
      minimumPurchase: String(validated.minimumPurchase),
      maximumUsage: validated.maximumUsage || null,
      usageCount: 0,
      usageLimitPerUser: validated.usageLimitPerUser,
      startsAt: validated.startsAt ? new Date(validated.startsAt) : null,
      endsAt: validated.endsAt ? new Date(validated.endsAt) : null,
      isActive: validated.isActive,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/admin/coupons]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}