import { auth, currentUser } from '@clerk/nextjs/server';
import { tryCreateAdminClient } from '@/lib/supabase/admin';
import { upsertProfileForClerkUser } from '@/lib/profile-sync';
import type { Profile } from '@/types';

/**
 * Get the current Clerk user id, or null if not signed in.
 */
export async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

/**
 * Get the Supabase profile id for the current Clerk user.
 * Creates or updates the profile on first sign-in.
 */
export async function getSupabaseProfileId(): Promise<string | null> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return null;

  const supabase = tryCreateAdminClient();
  if (!supabase) {
    console.error('[auth] Supabase is not configured');
    return null;
  }

  try {
    const { data: existing, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', clerkId)
      .maybeSingle();

    if (findError) {
      console.error('[auth] Profile lookup failed:', findError.message);
      // Fall through to upsert path which maps network errors clearly
    } else if (existing?.id) {
      return existing.id;
    }
  } catch (err) {
    console.error('[auth] Profile lookup threw:', err);
  }

  const user = await currentUser();
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    '';
  const fullName = user?.fullName ?? user?.firstName ?? null;

  const result = await upsertProfileForClerkUser({
    clerkUserId: clerkId,
    email,
    fullName,
  });

  if (!result.ok) {
    console.error('[auth] Profile sync failed:', result.code, result.message);
    return null;
  }

  return result.profileId;
}

/**
 * Force sync profile from Clerk (used by API + retry button).
 */
export async function syncCurrentUserProfile(): Promise<
  { profileId: string } | { error: string; code?: string }
> {
  const clerkId = await getClerkUserId();
  if (!clerkId) return { error: 'Not signed in', code: 'UNAUTHORIZED' };

  const user = await currentUser();
  const result = await upsertProfileForClerkUser({
    clerkUserId: clerkId,
    email:
      user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user?.emailAddresses?.[0]?.emailAddress,
    fullName: user?.fullName ?? user?.firstName ?? null,
  });

  if (!result.ok) return { error: result.message, code: result.code };
  return { profileId: result.profileId };
}

/**
 * Get the full profile row for the current Clerk user.
 */
export async function getSupabaseProfile(): Promise<Profile | null> {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return null;

  const supabase = tryCreateAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}
