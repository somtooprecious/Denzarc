import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProducts } from '@/lib/plan';
import {
  ensureProductImagesBucket,
  PRODUCT_IMAGES_BUCKET,
} from '@/lib/product-images-storage';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req: Request) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasProducts((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 });
  }

  const bucketReady = await ensureProductImagesBucket(supabase);
  if (!bucketReady.ok) {
    return NextResponse.json(
      {
        error: `Could not create image storage: ${bucketReady.error}. In Supabase SQL Editor, run migration 010_product_images_storage.sql.`,
      },
      { status: 500 }
    );
  }

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const path = `${profileId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl, path });
}
