-- Supabase Storage for product image uploads (used by /api/products/upload)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can view product images (public catalog)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Server (service role) uploads via /api/products/upload
DROP POLICY IF EXISTS "Service role upload product images" ON storage.objects;
CREATE POLICY "Service role upload product images"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role update product images" ON storage.objects;
CREATE POLICY "Service role update product images"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Service role delete product images" ON storage.objects;
CREATE POLICY "Service role delete product images"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'product-images');
