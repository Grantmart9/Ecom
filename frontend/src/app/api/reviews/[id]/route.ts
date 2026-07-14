/**
 * Review per-item API route - handles updating and deleting reviews.
 */
import { NextResponse } from 'next/server';
import { reviews } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  comment: z.string().max(5000).optional(),
});

/**
 * PUT /api/reviews/[id] - Update a review
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const body = await req.json();
    const validated = updateReviewSchema.parse(body);

    const [existing] = await db.select().from(reviews).where(eq(reviews.id, id));
    if (!existing) {
      return NextResponse.json({ detail: 'Review not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.rating !== undefined) updateData.rating = validated.rating;
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.comment !== undefined) updateData.comment = validated.comment;

    const [updated] = await db.update(reviews).set(updateData).where(eq(reviews.id, id)).returning();

    return NextResponse.json({
      id: updated.id,
      rating: updated.rating,
      title: updated.title,
      comment: updated.comment,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/reviews/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews/[id] - Delete a review
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const [existing] = await db.select().from(reviews).where(eq(reviews.id, id));
    if (!existing) {
      return NextResponse.json({ detail: 'Review not found' }, { status: 404 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    return NextResponse.json({ detail: 'Review deleted' });
  } catch (e) {
    console.error('[api/reviews/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
