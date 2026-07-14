/**
 * Inventory movements API route - handles listing inventory history.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInventoryMovements } from '@/lib/inventory';

export const runtime = 'nodejs';

/**
 * GET /api/inventory/movements - List inventory movements
 * Query params: productId, limit
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const productId = searchParams.get('productId');
    const limit = Math.min(200, Math.max(1, Number(isFinite(Number(searchParams.get('limit') || 50)) ? Number(searchParams.get('limit')) : 50)));

    const rows = await getInventoryMovements(productId ? Number(productId) : undefined, limit);

    const data = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      quantityChange: r.quantityChange,
      movementType: r.movementType,
      referenceType: r.referenceType,
      referenceId: r.referenceId,
      userId: r.userId,
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      productName: r.productName,
      productSku: r.productSku,
    }));

    return NextResponse.json({ data, total: data.length });
  } catch (e) {
    console.error('[api/inventory/movements]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
