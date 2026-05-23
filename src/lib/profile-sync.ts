import { randomUUID } from 'crypto';
import { tryCreateAdminClient } from '@/lib/supabase/admin';

export type ProfileSyncErrorCode =
  | 'SUPABASE_NOT_CONFIGURED'
  | 'MIGRATION_REQUIRED'
  | 'DB_ERROR';

export type ProfileSyncResult =
  | { ok: true; profileId: string }
  | { ok: false; code: ProfileSyncErrorCode; message: string };

export function parseClerkEmail(data: {
  email_addresses?: { email_address: string; id: string }[];
  primary_email_address_id?: string | null;
}): string {
  const primary =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses?.[0]?.email_address;
  return primary?.trim() ?? '';
}

export function parseClerkFullName(data: {
  first_name?: string | null;
  last_name?: string | null;
}): string | null {
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  return name || null;
}

/**
 * Create or update a Supabase profile linked to a Clerk user id.
 * Safe to call from webhooks, API routes, and server pages.
 */
export async function upsertProfileForClerkUser(input: {
  clerkUserId: string;
  email?: string | null;
  fullName?: string | null;
}): Promise<ProfileSyncResult> {
  const supabase = tryCreateAdminClient();
  if (!supabase) {
    return {
      ok: false,
      code: 'SUPABASE_NOT_CONFIGURED',
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.',
    };
  }

  const email = (input.email?.trim() || `clerk-${input.clerkUserId}@users.denzarc.local`).slice(0, 320);
  const fullName = input.fullName?.trim() || null;

  const { data: existing, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', input.clerkUserId)
    .maybeSingle();

  if (findError) {
    if (isMigrationError(findError.message, findError.code)) {
      return migrationRequiredResult();
    }
    return { ok: false, code: 'DB_ERROR', message: findError.message };
  }

  if (existing?.id) {
    await supabase
      .from('profiles')
      .update({
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    return { ok: true, profileId: existing.id };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: randomUUID(),
      clerk_user_id: input.clerkUserId,
      email,
      full_name: fullName,
      plan: 'free',
    })
    .select('id')
    .single();

  if (insertError) {
    if (isMigrationError(insertError.message, insertError.code)) {
      return migrationRequiredResult();
    }
    // Race: webhook + page load both inserted
    const { data: again } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', input.clerkUserId)
      .maybeSingle();
    if (again?.id) return { ok: true, profileId: again.id };
    return { ok: false, code: 'DB_ERROR', message: insertError.message };
  }

  return { ok: true, profileId: inserted!.id };
}

function isMigrationError(message: string, code?: string): boolean {
  return (
    code === '42703' ||
    message.includes('clerk_user_id') ||
    message.includes('column') && message.includes('does not exist')
  );
}

function migrationRequiredResult(): ProfileSyncResult {
  return {
    ok: false,
    code: 'MIGRATION_REQUIRED',
    message:
      'Database is missing clerk_user_id on profiles. Run supabase/migrations/005_clerk_auth.sql in Supabase SQL Editor.',
  };
}
