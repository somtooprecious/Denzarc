-- Clerk authentication: link profiles to Clerk user id instead of auth.users
-- Run after 001–004. Enables Clerk as auth provider while keeping Supabase for data.

-- Add Clerk user id (nullable for existing rows; new signups get this set)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);

-- Drop Supabase Auth dependency: remove trigger and FK from profiles to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop FK: profiles.id -> auth.users(id). Constraint name may vary; try common names.
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

-- Allow profiles.id to be any UUID (for new Clerk users we insert with uuid_generate_v4())
-- No need to change id type; we just removed the FK.

COMMENT ON COLUMN public.profiles.clerk_user_id IS 'Clerk user id (e.g. user_xxx). Set on first sign-in when using Clerk.';
