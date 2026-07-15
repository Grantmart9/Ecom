/**
 * Single category API route - handles fetching, updating, and deleting a category.
 */
import { NextResponse } from 'next/server';
import { categories } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Category } from '../route';

export const runtime = 'nodejs';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  slug: z.string().min(1, 'Slug is required').max(100).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  image: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * GET /api/categories/[id] - Get single category by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const rows = await db.select().from(categories).where(eq(categories.id, Number(id)));

    if (rows.length === 0) {
      return NextResponse.json({ detail: 'Category not found' }, { status: 404 });
    }

    const category = rows[0];
    const mapped: Category = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
      image: category.image ?? null,
      icon: category.icon ?? null,
      status: category.status,
      sortOrder: category.sortOrder ?? 0,
      createdAt: new Date(category.createdAt).toISOString(),
      updatedAt: new Date(category.updatedAt).toISOString(),
    };

    return NextResponse.json<Category>(mapped);
  } catch (e) {
    console.error('[api/categories/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/categories/[id] - Update a category
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const body = await req.json();
    const validated = updateCategorySchema.parse(body);

    // Check if category exists
    const existingRows = await db.select().from(categories).where(eq(categories.id, Number(id)));
    if (existingRows.length === 0) {
      return NextResponse.json({ detail: 'Category not found' }, { status: 404 });
    }

    // Validate parentId if provided
    if (validated.parentId !== undefined && validated.parentId !== null) {
      if (validated.parentId === Number(id)) {
        return NextResponse.json({ detail: 'Category cannot be its own parent' }, { status: 400 });
      }
      const parentRows = await db.select().from(categories).where(eq(categories.id, validated.parentId));
      if (parentRows.length === 0) {
        return NextResponse.json({ detail: 'Parent category not found' }, { status: 400 });
      }
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.description !== undefined) updateData.description = validated.description || null;
    if (validated.parentId !== undefined) updateData.parentId = validated.parentId;
    if (validated.image !== undefined) updateData.image = validated.image || null;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;

    const [updated] = await db.update(categories).set(updateData).where(eq(categories.id, Number(id))).returning();

    const mapped: Category = {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description ?? null,
      parentId: updated.parentId ?? null,
      image: updated.image ?? null,
      icon: updated.icon ?? null,
      status: updated.status,
      sortOrder: updated.sortOrder ?? 0,
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: now.toISOString(),
    };

    return NextResponse.json<Category>(mapped);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/categories/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id] - Delete a category
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    // Check if category has children
    const childRows = await db.select().from(categories).where(eq(categories.parentId, Number(id)));
    if (childRows.length > 0) {
      return NextResponse.json({ detail: 'Cannot delete category with sub-categories' }, { status: 400 });
    }

    const result = await db.delete(categories).where(eq(categories.id, Number(id))).returning();

    if (result.length === 0) {
      return NextResponse.json({ detail: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ detail: 'Category deleted successfully' });
  } catch (e) {
    console.error('[api/categories/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}