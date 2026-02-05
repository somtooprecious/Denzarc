-- Add phone for notifications (subscription expiry, low stock alerts to self)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
