import { NextResponse } from 'next/server';
import { userAddresses, users } from '@/db/schema';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const addressSchema = z.object({
  userId: z.number().int().positive(),
  type: z.enum(['billing', 'shipping', 'both']).default('both'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  company: z.string().max(255).optional(),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

type AddressRow = {
  id: number;
  userId: number;
  type: string;
  firstName: string;
  lastName: string;
  company: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function GET(req: NextRequest) {
  try {
    const [{ db }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ detail: 'userId is required' }, { status: 400 });
    }

    const rows = await db.select().from(userAddresses).where(eq(userAddresses.userId, Number(userId))).orderBy(userAddresses.isDefault);

    const data: AddressRow[] = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      firstName: r.firstName,
      lastName: r.lastName,
      company: r.company,
      addressLine1: r.addressLine1,
      addressLine2: r.addressLine2,
      city: r.city,
      state: r.state,
      postalCode: r.postalCode,
      country: r.country,
      phone: r.phone,
      isDefault: r.isDefault,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data, total: data.length });
  } catch (e) {
    console.error('[api/addresses]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = addressSchema.parse(body);

    const [{ db }, { eq }] = await Promise.all([import('@/db/client'), import('drizzle-orm')]);

    const userCheck = await db.select().from(users).where(eq(users.id, validated.userId));
    if (userCheck.length === 0) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    if (validated.isDefault) {
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, validated.userId));
    }

    const now = new Date();
    const [newAddress] = await db.insert(userAddresses).values({
      userId: validated.userId,
      type: validated.type,
      firstName: validated.firstName,
      lastName: validated.lastName,
      company: validated.company,
      addressLine1: validated.addressLine1,
      addressLine2: validated.addressLine2,
      city: validated.city,
      state: validated.state,
      postalCode: validated.postalCode,
      country: validated.country,
      phone: validated.phone,
      isDefault: validated.isDefault,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({
      id: newAddress.id,
      userId: newAddress.userId,
      type: newAddress.type,
      firstName: newAddress.firstName,
      lastName: newAddress.lastName,
      addressLine1: newAddress.addressLine1,
      city: newAddress.city,
      state: newAddress.state,
      postalCode: newAddress.postalCode,
      country: newAddress.country,
      isDefault: newAddress.isDefault,
      createdAt: newAddress.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ detail: e.issues[0].message }, { status: 400 });
    }
    console.error('[api/addresses]', e);
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
