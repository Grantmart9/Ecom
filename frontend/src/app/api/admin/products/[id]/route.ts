/**
 * Admin single product API route - update and delete products.
 */
import { NextResponse } from 'next/server';
import { products, productImages, inventory, orderItems, cartItems, reviews } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(1).max(100).optional(),
  categoryId: z.number().int().positive().optional(),
  images: z.array(z.object({
    id: z.number().optional(),
    imageUrl: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
});

/**
 * GET /api/admin/products/[id] - Get single product details
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ detail: 'Invalid product ID' }, { status: 400 });
    }

    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 });
    }

    const imageRows = await db.select().from(productImages).where(eq(productImages.productId, productId));
    const invRow = await db.select().from(inventory).where(eq(inventory.productId, productId));

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      sku: product.sku,
      categoryId: product.categoryId,
      status: product.status,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: imageRows.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      stockQuantity: invRow[0]?.quantity ?? 0,
    });
  } catch (e) {
    console.error('[api/admin/products/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id] - Update product
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ detail: 'Invalid product ID' }, { status: 400 });
    }

    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = updateProductSchema.parse(body);

    const now = new Date();
    const updateValues: Record<string, unknown> = { updatedAt: now };

    if (validated.name !== undefined) updateValues.name = validated.name;
    if (validated.slug !== undefined) {
      const existingSlug = await db.select().from(products).where(
        and(eq(products.slug, validated.slug), sql`${products.id} != ${productId}`)
      );
      if (existingSlug.length > 0) {
        return NextResponse.json({ detail: 'Slug already in use' }, { status: 400 });
      }
      updateValues.slug = validated.slug;
    }
    if (validated.description !== undefined) updateValues.description = validated.description;
    if (validated.price !== undefined) updateValues.price = String(validated.price);
    if (validated.compareAtPrice !== undefined) updateValues.compareAtPrice = validated.compareAtPrice ? String(validated.compareAtPrice) : null;
    if (validated.sku !== undefined) {
      const existingSku = await db.select().from(products).where(
        and(eq(products.sku, validated.sku), sql`${products.id} != ${productId}`)
      );
      if (existingSku.length > 0) {
        return NextResponse.json({ detail: 'SKU already in use' }, { status: 400 });
      }
      updateValues.sku = validated.sku;
    }
    if (validated.categoryId !== undefined) updateValues.categoryId = validated.categoryId;
    if (validated.status !== undefined) {
      updateValues.status = validated.status;
      updateValues.isActive = validated.status === 'active';
    }

    const [updated] = await db.update(products).set(updateValues).where(eq(products.id, productId)).returning();

    if (validated.images) {
      // Delete existing images and re-insert
      await db.delete(productImages).where(eq(productImages.productId, productId));
      if (validated.images.length > 0) {
        const imageValues = validated.images.map((img, idx) => ({
          productId,
          imageUrl: img.imageUrl,
          altText: img.altText || null,
          isPrimary: idx === 0 ? true : !!img.isPrimary,
          sortOrder: idx,
          createdAt: now,
        }));
        await db.insert(productImages).values(imageValues);
      }
    }

    if (validated.stockQuantity !== undefined) {
      const invRow = await db.select().from(inventory).where(eq(inventory.productId, productId));
      if (invRow.length > 0) {
        await db.update(inventory).set({ quantity: validated.stockQuantity, updatedAt: now }).where(eq(inventory.productId, productId));
      } else {
        await db.insert(inventory).values({
          productId,
          quantity: validated.stockQuantity,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          trackInventory: true,
          allowBackorder: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const imageRows = await db.select().from(productImages).where(eq(productImages.productId, productId));

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      price: Number(updated.price),
      compareAtPrice: updated.compareAtPrice ? Number(updated.compareAtPrice) : null,
      sku: updated.sku,
      categoryId: updated.categoryId,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      images: imageRows.map((img) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/admin/products/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id] - Permanently delete product and related records
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [{ db }, { eq }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ detail: 'Invalid product ID' }, { status: 400 });
    }

    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 });
    }

    await db.delete(productImages).where(eq(productImages.productId, productId));
    await db.delete(inventory).where(eq(inventory.productId, productId));
    await db.delete(orderItems).where(eq(orderItems.productId, productId));
    await db.delete(cartItems).where(eq(cartItems.productId, productId));
    await db.delete(reviews).where(eq(reviews.productId, productId));
    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({ success: true, message: 'Product permanently deleted' });
  } catch (e) {
    console.error('[api/admin/products/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}