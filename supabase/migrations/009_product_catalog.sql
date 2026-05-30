-- Product catalog: images, categories, public listing, shareable shop URL

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_listed BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS catalog_slug TEXT UNIQUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_catalog_slug ON public.profiles(catalog_slug) WHERE catalog_slug IS NOT NULL;

COMMENT ON COLUMN public.products.is_listed IS 'When true, product appears on public catalog page';
COMMENT ON COLUMN public.profiles.catalog_slug IS 'URL slug for public catalog: /catalog/{catalog_slug}';
