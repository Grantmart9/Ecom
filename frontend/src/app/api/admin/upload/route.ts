/**
 * Admin image upload endpoint.
 * Accepts a single image file (multipart/form-data, field name "image"),
 * stores it under /public/uploads, and returns its public URL.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ detail: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ detail: 'Unsupported image type' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ detail: 'Image exceeds 5MB limit' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.png';
    const filename = `${randomUUID()}${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e) {
    console.error('[api/admin/upload]', e);
    return NextResponse.json({ detail: 'Upload failed' }, { status: 500 });
  }
}
