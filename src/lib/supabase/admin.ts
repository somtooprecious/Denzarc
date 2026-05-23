import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS. Use only in API routes / server code after validating the user via Clerk.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  }
  return createClient(url, key);
}

/** Returns null instead of throwing when Supabase env vars are missing. */
export function tryCreateAdminClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}
