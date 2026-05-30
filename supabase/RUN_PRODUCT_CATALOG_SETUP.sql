-- =============================================================================
-- DENZARC: Run this ONCE in Supabase → SQL Editor → New query → paste → Run
-- Fixes: "Could not find the 'category' column of 'products' in the schema cache"
-- =============================================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS catalog_slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_catalog_slug
  ON public.profiles(catalog_slug)
  WHERE catalog_slug IS NOT NULL;

-- Refresh Supabase API schema cache (important after adding columns)
NOTIFY pgrst, 'reload schema';
