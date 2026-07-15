/**
 * Products API route - handles listing and creating products.
 * Uses Drizzle ORM to query PostgreSQL database directly.
 */
import { NextResponse } from 'next/server';
import { products, productImages } from '@/db/schema';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// Response types for API
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
  costPrice: number | null;
  weight: number | null;
  dimensions: string | null;
  sku: string | null;
  barcode: string | null;
  isActive: boolean;
  isFeatured: boolean;
  status: string;
  availabilityStatus: string;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
};

/**
 * GET /api/products - List all active products
 * Query params: skip, limit, categoryId, search (search by name, SKU, description)
 */
export async function GET(req: NextRequest) {
  try {
    const [{ db }, { eq, and, ilike, count }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const searchParams = new URL(req.url).searchParams;
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const rawLimit = Number(searchParams.get('limit') || 20);
    const limit = Math.min(100, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 20));
    const categoryIdFilter = searchParams.get('categoryId');
    const searchQuery = searchParams.get('search');

    // Build query conditions
    const conditions = [eq(products.isActive, true)];
    if (categoryIdFilter) {
      conditions.push(eq(products.categoryId, Number(categoryIdFilter)));
    }
    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      conditions.push(
        ilike(products.name, searchPattern) ||
          ilike(products.sku, searchPattern) ||
          ilike(products.description, searchPattern)
      );
    }

    // Fetch active products with pagination
    const rows = await db.select().from(products).where(and(...conditions)).limit(limit).offset(skip);

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
          costPrice: product.costPrice ? Number(product.costPrice) : null,
          weight: product.weight ? Number(product.weight) : null,
          dimensions: product.dimensions,
          sku: product.sku,
          barcode: product.barcode,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          status: product.status,
          availabilityStatus: product.availabilityStatus,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          categoryId: product.categoryId,
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
    const totalResult = await db.select({ count: count() }).from(products).where(and(...conditions));
    const total = totalResult[0]?.count ?? 0;

    return NextResponse.json({
      data: mapped,
      total,
      skip,
      limit,
    });
  } catch (e) {
    console.error('[api/products]', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

/**
 * POST /api/products - Create a new product
 * Returns 501 Not Implemented (admin endpoint)
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json({ detail: 'Not implemented' }, { status: 501 });
}