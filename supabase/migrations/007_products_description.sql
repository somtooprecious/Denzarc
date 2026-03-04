-- Add description to products (for Products catalog feature; Inventory uses same table)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
