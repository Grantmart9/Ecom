/**
 * Inventory API route - handles listing and adjusting inventory.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adjustInventory, getInventoryWithProducts } from '@/lib/inventory';

export const runtime = 'nodejs';

const adjustSchema = z.object({
  productId: z.number().int().positive(),
  quantityChange: z.number().int(),
  movementType: z.enum(['manual_adjustment', 'order_fulfilled', 'order_cancelled', 'restock', 'return', 'initial_stock', 'reservation']),
  notes: z.string().max(1000).optional(),
});

type InventoryItem = {
  id: number;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number | null;
  trackInventory: boolean;
  allowBackorder: boolean;
  product: { id: number | null; name: string | null; sku: string | null };
  isLowStock: boolean;
};

/**
 * GET /api/inventory - List all inventory with low stock detection
 * Query params: lowStock (boolean), limit, skip
 */
export async function GET(req: NextRequest) {
  try {
    const rows = await getInventoryWithProducts();

    const searchParams = new URL(req.url).searchParams;
    const onlyLowStock = searchParams.get('lowStock') === 'true';
    const skip = Math.max(0, Number(searchParams.get('skip') || 0));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));

    const filtered = onlyLowStock ? rows.filter((r) => (r.quantity ?? 0) < (r.lowStockThreshold ?? 10)) : rows;

    const data: InventoryItem[] = filtered.slice(skip, skip + limit).map((r) => ({
      id: r.id,
      quantity: r.quantity,
      reservedQuantity: r.reservedQuantity,
      lowStockThreshold: r.lowStockThreshold,
      trackInventory: r.trackInventory,
      allowBackorder: r.allowBackorder,
      product: { id: r.productId, name: r.productName, sku: r.productSku },
      isLowStock: (r.quantity ?? 0) <= (r.lowStockThreshold ?? 10),
    }));

    return NextResponse.json({
      data,
      total: filtered.length,
      lowStockCount: filtered.filter((i) => (i.quantity ?? 0) <= (i.lowStockThreshold ?? 10)).length,
    });
  } catch (e) {
    console.error('[api/inventory]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/inventory - Adjust inventory stock via service
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adjustSchema.parse(body);

    await adjustInventory({
      productId: validated.productId,
      quantityChange: validated.quantityChange,
      movementType: validated.movementType,
      notes: validated.notes,
    });

    return NextResponse.json({ detail: 'Inventory updated' });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/inventory]', e);
    const message = e instanceof Error ? e.message : 'Server error';
    const status = message.includes('not found') ? 404 : message.includes('Insufficient') ? 400 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
