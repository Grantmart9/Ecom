/**
 * Single product API route - fetches a single product by ID.
 */
import { NextResponse } from 'next/server';
import { products, productImages } from '@/db/schema';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

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
  images: ProductImage[];
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }, { eq }] = await Promise.all([
      import('@/db/client'),
      import('drizzle-orm'),
    ]);

    const rows = await db.select().from(products).where(eq(products.id, Number(id)));
    
    if (rows.length === 0) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 });
    }

    const product = rows[0];
    const imageRows = await db.select().from(productImages).where(eq(productImages.productId, product.id));

    const mapped: Product = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      images: imageRows.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText ?? null,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };

    return NextResponse.json<Product>(mapped);
  } catch (e) {
    console.error('[api/products/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}