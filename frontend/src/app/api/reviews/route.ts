/**
 * Reviews API route - handles listing and creating product reviews.
 */
import { NextResponse } from 'next/server';
import { reviews, users } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const createReviewSchema = z.object({
  userId: z.number().int().positive(),
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().max(5000).optional(),
  orderId: z.string().uuid().optional().nullable(),
});

type ReviewWithUser = {
  id: string;
  userId: number;
  productId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulVotes: number;
  createdAt: string;
  user: { username: string | null };
};

type ReviewStats = {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
};

/**
 * GET /api/reviews?productId=X - List reviews for a product with stats
 * Query params: productId (required), limit, skip
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }, { eq, sql, count }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const searchParams = new URL(req.url).searchParams;
    const productId = searchParams.get('productId');
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 10)));

    if (!productId) {
      return NextResponse.json({ detail: 'productId is required' }, { status: 400 });
    }

    const pid = Number(productId);

    const reviewRows = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        isApproved: reviews.isApproved,
        helpfulVotes: reviews.helpfulVotes,
        createdAt: reviews.createdAt,
        username: users.username,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, pid))
      .orderBy(reviews.createdAt)
      .limit(limit)
      .offset(skip);

    const mapped: ReviewWithUser[] = reviewRows.map((r) => ({
      id: r.id,
      userId: r.userId,
      productId: r.productId,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      isApproved: r.isApproved,
      helpfulVotes: r.helpfulVotes,
      createdAt: r.createdAt.toISOString(),
      user: { username: r.username },
    }));

    const statsResult = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: count(),
        dist1: sql<number>`SUM(CASE WHEN ${reviews.rating} = 1 THEN 1 ELSE 0 END)`,
        dist2: sql<number>`SUM(CASE WHEN ${reviews.rating} = 2 THEN 1 ELSE 0 END)`,
        dist3: sql<number>`SUM(CASE WHEN ${reviews.rating} = 3 THEN 1 ELSE 0 END)`,
        dist4: sql<number>`SUM(CASE WHEN ${reviews.rating} = 4 THEN 1 ELSE 0 END)`,
        dist5: sql<number>`SUM(CASE WHEN ${reviews.rating} = 5 THEN 1 ELSE 0 END)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, pid));

    const statsRow = statsResult[0];
    const stats: ReviewStats = {
      averageRating: Number(statsRow?.avg ?? 0),
      reviewCount: Number(statsRow?.count ?? 0),
      ratingDistribution: {
        1: Number(statsRow?.dist1 ?? 0),
        2: Number(statsRow?.dist2 ?? 0),
        3: Number(statsRow?.dist3 ?? 0),
        4: Number(statsRow?.dist4 ?? 0),
        5: Number(statsRow?.dist5 ?? 0),
      },
    };

    return NextResponse.json({ data: mapped, stats, total: mapped.length });
  } catch (e) {
    console.error('[api/reviews]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/reviews - Submit a new review
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createReviewSchema.parse(body);

    const [{ db }, { eq, and }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const userCheck = await db.select().from(users).where(eq(users.id, validated.userId));
    if (userCheck.length === 0) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, validated.productId), eq(reviews.userId, validated.userId)));

    if (existingReview.length > 0) {
      return NextResponse.json({ detail: 'You have already reviewed this product' }, { status: 409 });
    }

    const isVerified = !!validated.orderId;

    const now = new Date();
    const [newReview] = await db.insert(reviews).values({
      userId: validated.userId,
      productId: validated.productId,
      rating: validated.rating,
      title: validated.title,
      comment: validated.comment,
      isVerifiedPurchase: isVerified,
      isApproved: false,
      status: 'pending',
      helpfulVotes: 0,
      reportedCount: 0,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({
      id: newReview.id,
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      isVerifiedPurchase: newReview.isVerifiedPurchase,
      createdAt: newReview.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/reviews]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
