import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS. Use only in API routes / server code after validating the user via Clerk.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  return createClient(url, key);
}
