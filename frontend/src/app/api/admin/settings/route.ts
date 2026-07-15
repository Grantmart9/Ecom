/**
 * Admin settings API route - manages store configuration.
 */
import { NextResponse } from 'next/server';
import { storeSettings } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const [row] = await db.select().from(storeSettings).where(eq(storeSettings.id, 1));
    if (!row) {
      return NextResponse.json({
        storeName: '',
        currency: 'USD',
        taxRate: 0,
        emailNotifications: true,
        shippingZones: [],
      });
    }

    let shippingZones = [];
    try {
      shippingZones = JSON.parse(row.shippingZones);
    } catch {
      shippingZones = [];
    }

    return NextResponse.json({
      storeName: row.storeName,
      currency: row.currency,
      taxRate: Number(row.taxRate),
      emailNotifications: row.emailNotifications,
      shippingZones,
    });
  } catch (e) {
    console.error('[api/admin/settings]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);
    const body = await req.json();

    const shippingZones = Array.isArray(body.shippingZones) ? body.shippingZones : [];
    const serializedZones = JSON.stringify(shippingZones);

    const [updated] = await db.insert(storeSettings).values({
      id: 1,
      storeName: body.storeName || 'My Store',
      currency: body.currency || 'USD',
      taxRate: String(body.taxRate ?? 0),
      emailNotifications: !!body.emailNotifications,
      shippingZones: serializedZones,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        storeName: body.storeName || 'My Store',
        currency: body.currency || 'USD',
        taxRate: String(body.taxRate ?? 0),
        emailNotifications: !!body.emailNotifications,
        shippingZones: serializedZones,
        updatedAt: new Date(),
      },
    }).returning();

    let parsedZones = [];
    try {
      parsedZones = JSON.parse(updated.shippingZones);
    } catch {
      parsedZones = [];
    }

    return NextResponse.json({
      storeName: updated.storeName,
      currency: updated.currency,
      taxRate: Number(updated.taxRate),
      emailNotifications: updated.emailNotifications,
      shippingZones: parsedZones,
    });
  } catch (e) {
    console.error('[api/admin/settings]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
