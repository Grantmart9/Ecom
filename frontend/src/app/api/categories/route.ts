/**
 * Categories API route - handles listing and creating categories.
 * Uses Drizzle ORM to query PostgreSQL database directly.
 */
import { NextResponse } from 'next/server';
import { categories } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().max(1000).optional(),
  parentId: z.number().int().positive().optional(),
  image: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  sortOrder: z.number().int().default(0),
});

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  image: string | null;
  icon: string | null;
  status: string;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * GET /api/categories - List categories with pagination
 * Query params: skip (default 0), limit (default 50, max 100), status (optional filter)
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }, { eq, and, count }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const searchParams = new URL(req.url).searchParams;
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const rawLimit = Number(searchParams.get('limit') || 50);
    const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 50));
    const statusFilter = searchParams.get('status');

    // Build query conditions
    const conditions = statusFilter ? [eq(categories.status, statusFilter as 'active' | 'inactive' | 'archived')] : [];

    // Fetch categories with pagination
    const rows = conditions.length
      ? await db.select().from(categories).where(and(...conditions)).limit(limit).offset(skip)
      : await db.select().from(categories).limit(limit).offset(skip);

    const mapped: Category[] = rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      parentId: c.parentId ?? null,
      image: c.image ?? null,
      icon: c.icon ?? null,
      status: c.status,
      sortOrder: c.sortOrder ?? 0,
      createdAt: new Date(c.createdAt).toISOString(),
      updatedAt: new Date(c.updatedAt).toISOString(),
    }));

    // Get total count
    const totalResult = await db.select({ count: count() }).from(categories);
    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: mapped,
      total,
      skip,
      limit,
    });
  } catch (e) {
    console.error('[api/categories]', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

/**
 * POST /api/categories - Create a new category
 */
export async function POST(req: NextRequest) {
  try {
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    // Generate slug from name if not provided
    const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check for existing slug
    const existing = await db.select().from(categories).where(eq(categories.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json({ detail: 'Category with this slug already exists' }, { status: 400 });
    }

    // Validate parentId if provided
    if (validated.parentId) {
      const parent = await db.select().from(categories).where(eq(categories.id, validated.parentId));
      if (parent.length === 0) {
        return NextResponse.json({ detail: 'Parent category not found' }, { status: 400 });
      }
    }

    const now = new Date();
    const [newCategory] = await db.insert(categories).values({
      name: validated.name,
      slug,
      description: validated.description || null,
      parentId: validated.parentId || null,
      image: validated.image || null,
      status: validated.status,
      sortOrder: validated.sortOrder,
      createdAt: now,
      updatedAt: now,
    }).returning();

    const mapped: Category = {
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description ?? null,
      parentId: newCategory.parentId ?? null,
      image: newCategory.image ?? null,
      icon: newCategory.icon ?? null,
      status: newCategory.status,
      sortOrder: newCategory.sortOrder ?? 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/categories]', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}