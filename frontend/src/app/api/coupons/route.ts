import { NextResponse } from 'next/server';
import { discountCodes } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { validateCoupon, getActiveCoupons, getAllCoupons } from '@/lib/coupons';

export const runtime = 'nodejs';

const validateSchema = z.object({
  code: z.string().min(1),
  userId: z.number().int().positive().optional(),
  orderTotal: z.number().nonnegative(),
});

type CouponRow = {
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

/**
 * GET /api/coupons - List coupons (active only by default, all with ?all=true)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const showAll = searchParams.get('all') === 'true';

    let coupons: CouponRow[];
    if (showAll) {
      coupons = await getAllCoupons();
    } else {
      coupons = await getActiveCoupons();
    }

    return NextResponse.json({ data: coupons, total: coupons.length });
  } catch (e) {
    console.error('[api/coupons]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/coupons/validate - Validate a coupon code for a given cart total
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateSchema.parse(body);

    const result = await validateCoupon({
      code: validated.code,
      userId: validated.userId,
      orderTotal: validated.orderTotal,
    });

    if (result.valid) {
      return NextResponse.json({
        valid: true,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        discountType: result.discountType,
        discountValue: result.discountValue,
        message: 'Coupon applied successfully',
      });
    }

    return NextResponse.json(
      { valid: false, discountAmount: 0, finalTotal: validated.orderTotal, message: result.message },
      { status: 400 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/coupons/validate]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
