/**
 * Admin products API route - full CRUD for products (admin access).
 * Uses Drizzle ORM to query PostgreSQL database directly.
 */
import { NextResponse } from 'next/server';
import { products, productImages, inventory, categories } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, and, ilike, count, desc, or } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1, 'SKU is required').max(100),
  categoryId: z.number().int().positive('Category is required'),
  images: z.array(z.object({
    imageUrl: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('active'),
});

type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number | null;
};

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  categoryId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};

/**
 * GET /api/admin/products - List all products with pagination (admin view)
 * Query params: skip, limit, categoryId, search (name, SKU), status
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const searchParams = new URL(req.url).searchParams;
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const rawLimit = Number(searchParams.get('limit') || 20);
    const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
    const categoryIdFilter = searchParams.get('categoryId');
    const searchQuery = searchParams.get('search');
    const statusFilter = searchParams.get('status');

    // Build query conditions
    const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof ilike>> = [];
    if (categoryIdFilter) {
      conditions.push(eq(products.categoryId, Number(categoryIdFilter)));
    }
    if (statusFilter) {
      conditions.push(eq(products.status, statusFilter as 'draft' | 'active' | 'inactive' | 'archived'));
    }
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      const searchCondition = or(ilike(products.name, searchPattern), ilike(products.sku, searchPattern), ilike(products.description, searchPattern));
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Fetch products with pagination
    const rows = conditions.length
      ? await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt)).limit(limit).offset(skip)
      : await db.select().from(products).orderBy(desc(products.createdAt)).limit(limit).offset(skip);

    // Include product images in response
    const mapped: Product[] = await Promise.all(
      rows.map(async (product) => {
        const imageRows = await db.select().from(productImages).where(eq(productImages.productId, product.id));
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
          sku: product.sku,
          categoryId: product.categoryId,
          status: product.status,
          createdAt: new Date(product.createdAt).toISOString(),
          updatedAt: new Date(product.updatedAt).toISOString(),
          images: imageRows.map((img) => ({
            id: img.id,
            productId: img.productId,
            imageUrl: img.imageUrl,
            altText: img.altText ?? null,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        } satisfies Product;
      }),
    );

    // Get total count
    const totalResult = conditions.length
      ? await db.select({ count: count() }).from(products).where(and(...conditions))
      : await db.select({ count: count() }).from(products);
    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: mapped,
      total,
      skip,
      limit,
    });
  } catch (e) {
    console.error('[api/admin/products]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products - Create a new product
 */
export async function POST(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const body = await req.json();
    const validated = createProductSchema.parse(body);

    // Check for existing slug
    const existingSlug = await db.select().from(products).where(eq(products.slug, validated.slug));
    if (existingSlug.length > 0) {
      return NextResponse.json({ detail: 'Product with this slug already exists' }, { status: 400 });
    }

    // Check for existing SKU
    const existingSku = await db.select().from(products).where(eq(products.sku, validated.sku));
    if (existingSku.length > 0) {
      return NextResponse.json({ detail: 'Product with this SKU already exists' }, { status: 400 });
    }

    // Validate category exists
    const category = await db.select().from(categories).where(eq(categories.id, validated.categoryId));
    if (category.length === 0) {
      return NextResponse.json({ detail: 'Category not found' }, { status: 400 });
    }

    const now = new Date();
    const [newProduct] = await db.insert(products).values({
      name: validated.name,
      slug: validated.slug,
      description: validated.description || null,
      price: String(validated.price),
      compareAtPrice: validated.compareAtPrice ? String(validated.compareAtPrice) : null,
      sku: validated.sku,
      categoryId: validated.categoryId,
      status: validated.status,
      isActive: validated.status === 'active',
      createdAt: now,
      updatedAt: now,
    }).returning();

    // Insert images if provided
    if (validated.images && validated.images.length > 0) {
      const imageValues = validated.images.map((img, idx) => ({
        productId: newProduct.id,
        imageUrl: img.imageUrl,
        altText: img.altText || null,
        isPrimary: idx === 0 ? true : !!img.isPrimary,
        sortOrder: idx,
        createdAt: now,
      }));
      await db.insert(productImages).values(imageValues);
    }

    // Create inventory record
    await db.insert(inventory).values({
      productId: newProduct.id,
      quantity: validated.stockQuantity,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      trackInventory: true,
      allowBackorder: false,
      createdAt: now,
      updatedAt: now,
    });

    const imageRows = await db.select().from(productImages).where(eq(productImages.productId, newProduct.id));

    return NextResponse.json({
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: Number(newProduct.price),
      compareAtPrice: newProduct.compareAtPrice ? Number(newProduct.compareAtPrice) : null,
      sku: newProduct.sku,
      categoryId: newProduct.categoryId,
      status: newProduct.status,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      images: imageRows.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/admin/products]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}