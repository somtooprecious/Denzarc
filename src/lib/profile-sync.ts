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
  try {
    return await upsertProfileForClerkUserInner(input);
  } catch (err) {
    return networkErrorResult(err);
  }
}

async function upsertProfileForClerkUserInner(input: {
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
    if (isUnreachableSupabaseError(findError.message)) {
      return unreachableSupabaseResult();
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

  // Link existing profile by email (e.g. account created before Clerk migration)
  if (email.includes('@') && !email.endsWith('@users.denzarc.local')) {
    const { data: byEmail, error: emailFindError } = await supabase
      .from('profiles')
      .select('id, clerk_user_id')
      .ilike('email', email)
      .maybeSingle();

    if (emailFindError && isMigrationError(emailFindError.message, emailFindError.code)) {
      return migrationRequiredResult();
    }

    if (byEmail?.id) {
      if (byEmail.clerk_user_id && byEmail.clerk_user_id !== input.clerkUserId) {
        return {
          ok: false,
          code: 'DB_ERROR',
          message: 'This email is linked to another sign-in account. Contact support.',
        };
      }

      const { error: linkError } = await supabase
        .from('profiles')
        .update({
          clerk_user_id: input.clerkUserId,
          email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', byEmail.id);

      if (linkError) {
        if (isMigrationError(linkError.message, linkError.code)) return migrationRequiredResult();
        if (isForeignKeyError(linkError.message)) return migrationRequiredResult();
        if (isUnreachableSupabaseError(linkError.message)) return unreachableSupabaseResult();
        return { ok: false, code: 'DB_ERROR', message: linkError.message };
      }

      return { ok: true, profileId: byEmail.id };
    }
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
    if (isForeignKeyError(insertError.message)) {
      return migrationRequiredResult();
    }
    if (isUnreachableSupabaseError(insertError.message)) {
      return unreachableSupabaseResult();
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
    (message.includes('column') && message.includes('does not exist'))
  );
}

function isForeignKeyError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('foreign key') || lower.includes('profiles_id_fkey');
}

function migrationRequiredResult(): ProfileSyncResult {
  return {
    ok: false,
    code: 'MIGRATION_REQUIRED',
    message:
      'Run supabase/RUN_CLERK_SETUP.sql in Supabase SQL Editor, then click Link my account again.',
  };
}

export function isUnreachableSupabaseError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('fetch failed') ||
    lower.includes('enotfound') ||
    lower.includes('getaddrinfo') ||
    lower.includes('network') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('certificate')
  );
}

export function unreachableSupabaseMessage(): string {
  return (
    'Cannot reach your Supabase database. NEXT_PUBLIC_SUPABASE_URL is set but the host does not respond ' +
    '(wrong URL, deleted project, or paused project). Open Supabase → Project Settings → API, copy the Project URL, ' +
    'update it in Vercel Production env vars with a matching SUPABASE_SERVICE_ROLE_KEY, restore/unpause the project if needed, then redeploy.'
  );
}

function unreachableSupabaseResult(): ProfileSyncResult {
  return { ok: false, code: 'DB_ERROR', message: unreachableSupabaseMessage() };
}

function networkErrorResult(err: unknown): ProfileSyncResult {
  const msg = err instanceof Error ? err.message : String(err);
  if (isUnreachableSupabaseError(msg)) {
    return unreachableSupabaseResult();
  }
  return { ok: false, code: 'DB_ERROR', message: msg };
}
