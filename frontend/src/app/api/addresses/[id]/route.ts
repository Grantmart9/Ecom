import { NextResponse } from 'next/server';
import { userAddresses } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

const updateAddressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'both']).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  company: z.string().max(255).optional(),
  addressLine1: z.string().min(1).max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const addressId = Number(id);
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const body = await req.json();
    const validated = updateAddressSchema.parse(body);

    const [existing] = await db.select().from(userAddresses).where(eq(userAddresses.id, addressId));
    if (!existing) {
      return NextResponse.json({ detail: 'Address not found' }, { status: 404 });
    }

    if (validated.isDefault) {
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, existing.userId));
    }

    const updateFields: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.type !== undefined) updateFields.type = validated.type;
    if (validated.firstName !== undefined) updateFields.firstName = validated.firstName;
    if (validated.lastName !== undefined) updateFields.lastName = validated.lastName;
    if (validated.company !== undefined) updateFields.company = validated.company;
    if (validated.addressLine1 !== undefined) updateFields.addressLine1 = validated.addressLine1;
    if (validated.addressLine2 !== undefined) updateFields.addressLine2 = validated.addressLine2;
    if (validated.city !== undefined) updateFields.city = validated.city;
    if (validated.state !== undefined) updateFields.state = validated.state;
    if (validated.postalCode !== undefined) updateFields.postalCode = validated.postalCode;
    if (validated.country !== undefined) updateFields.country = validated.country;
    if (validated.phone !== undefined) updateFields.phone = validated.phone;
    if (validated.isDefault !== undefined) updateFields.isDefault = validated.isDefault;

    const [updated] = await db.update(userAddresses).set(updateFields).where(eq(userAddresses.id, addressId)).returning();

    return NextResponse.json({
      id: updated.id,
      type: updated.type,
      firstName: updated.firstName,
      lastName: updated.lastName,
      addressLine1: updated.addressLine1,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      country: updated.country,
      isDefault: updated.isDefault,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/addresses/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const addressId = Number(id);
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const [existing] = await db.select().from(userAddresses).where(eq(userAddresses.id, addressId));
    if (!existing) {
      return NextResponse.json({ detail: 'Address not found' }, { status: 404 });
    }

    await db.delete(userAddresses).where(eq(userAddresses.id, addressId));
    return NextResponse.json({ detail: 'Address deleted' });
  } catch (e) {
    console.error('[api/addresses/[id]]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
