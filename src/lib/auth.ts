import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/types';

/**
 * Get the current Clerk user id, or null if not signed in.
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the Supabase profile id for the current Clerk user.
 * Creates a profile row if none exists (first sign-in with Clerk).
 * Returns null if not signed in.
 */
export async function getSupabaseProfileId(): Promise<string | null> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return null;

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkId)
    .single();

  if (existing?.id) return existing.id;

  // First sign-in: create profile. We need Clerk user email/name from auth().
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  const email = (sessionClaims?.email as string) ?? '';
  const fullName = (sessionClaims?.full_name as string) ?? (sessionClaims?.name as string) ?? null;

  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert({
      id: randomUUID(),
      clerk_user_id: clerkId,
      email: email || `clerk-${clerkId}@placeholder.local`,
      full_name: fullName,
      plan: 'free',
    })
    .select('id')
    .single();

  if (error) {
    // Race: another request may have inserted; fetch again
    const { data: again } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', clerkId)
      .single();
    if (again?.id) return again.id;
    throw new Error(`Failed to create profile: ${error.message}`);
  }
  return inserted?.id ?? null;
}

/**
 * Get the full profile row for the current Clerk user.
 * Returns null if not signed in or profile not found.
 */
export async function getSupabaseProfile(): Promise<Profile | null> {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}
