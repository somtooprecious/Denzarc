-- =============================================================================
-- DENZARC — COPY ALL OF THIS INTO SUPABASE SQL EDITOR → NEW QUERY → RUN
-- Fixes dashboard "finish setup" / "fetch failed" after Clerk sign-in
-- =============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'profiles'
    AND constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
