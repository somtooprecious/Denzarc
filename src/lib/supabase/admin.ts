import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getMissingSupabaseServerVars,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/env';

export function isSupabaseConfigured(): boolean {
  return getMissingSupabaseServerVars().length === 0;
}

/**
 * Server-only Supabase client with service role key.
 * Bypasses RLS. Use only in API routes / server code after validating the user via Clerk.
 */
export function createAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error(
      'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel (Production).'
    );
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
