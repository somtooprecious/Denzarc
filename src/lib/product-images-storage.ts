import type { SupabaseClient } from '@supabase/supabase-js';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

const BUCKET_OPTIONS = {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;

/**
 * Ensures the product-images bucket exists (creates it via service role if missing).
 */
export async function ensureProductImagesBucket(
  supabase: SupabaseClient
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await supabase.storage.getBucket(PRODUCT_IMAGES_BUCKET);
  if (existing) return { ok: true };

  const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, BUCKET_OPTIONS);

  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes('already exists') || lower.includes('duplicate')) {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
