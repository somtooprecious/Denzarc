-- Add business_address to profiles (used in Settings)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
