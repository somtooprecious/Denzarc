-- Users & Payments (per prompt spec)
-- users: id, email, plan, subscription_start, subscription_end
-- payments: id, user_id, amount, reference, status, created_at

-- Users view: exposes prompt's user structure from profiles (Supabase uses auth.users + profiles)
CREATE OR REPLACE VIEW public.users AS
SELECT
  id,
  email,
  plan,
  subscription_start,
  subscription_end
FROM public.profiles;

-- Ensure payments table has prompt spec columns (already in 001; this documents/adds any missing)
-- payments: id, user_id, amount, reference, status, created_at (+ provider for Paystack)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'paystack';

COMMENT ON VIEW public.users IS 'Users table per prompt: id, email, plan, subscription_start, subscription_end';
COMMENT ON TABLE public.payments IS 'Payments (Paystack): id, user_id, amount, reference, status, created_at';
