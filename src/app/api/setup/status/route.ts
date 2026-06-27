import { NextResponse } from 'next/server';
import { isClerkConfigured, getMissingSupabaseServerVars } from '@/lib/env';
import { tryCreateAdminClient } from '@/lib/supabase/admin';

/** Check deployment config (no secrets exposed). */
export async function GET() {
  const clerk = isClerkConfigured();
  const missingSupabase = getMissingSupabaseServerVars();
  const supabase = missingSupabase.length === 0;
  const webhook = Boolean(process.env.CLERK_WEBHOOK_SECRET?.trim());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || null;

  let database = false;
  let databaseError: string | null = null;
  let clerkColumnReady = false;

  if (supabase) {
    const client = tryCreateAdminClient();
    if (client) {
      const { error } = await client.from('profiles').select('clerk_user_id').limit(1);
      if (!error) {
        database = true;
        clerkColumnReady = true;
      } else if (
        error.message.includes('clerk_user_id') ||
        (error.message.includes('column') && error.message.includes('does not exist'))
      ) {
        database = true;
        databaseError = 'Run 005_clerk_auth.sql in Supabase (missing clerk_user_id column).';
      } else {
        databaseError = error.message;
      }
    }
  }

  const ready = clerk && supabase && database && clerkColumnReady;

  return NextResponse.json({
    ready,
    clerk,
    supabase,
    database,
    clerkColumnReady,
    webhook,
    appUrl,
    missingSupabase,
    databaseError,
    hints: [
      !clerk && 'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY for Production in Vercel.',
      missingSupabase.includes('NEXT_PUBLIC_SUPABASE_URL') &&
        'Add NEXT_PUBLIC_SUPABASE_URL (Supabase project URL).',
      missingSupabase.includes('SUPABASE_SERVICE_ROLE_KEY') &&
        'Add SUPABASE_SERVICE_ROLE_KEY (not anon key). Name must be exact, or use SERVICE_ROLE_KEY.',
      supabase &&
        !clerkColumnReady &&
        'Supabase: run supabase/RUN_CLERK_SETUP.sql in SQL Editor.',
      clerk &&
        supabase &&
        clerkColumnReady &&
        !webhook &&
        'Optional: CLERK_WEBHOOK_SECRET for automatic sign-up sync.',
      !appUrl && 'Set NEXT_PUBLIC_APP_URL=https://denzarc.com for Production.',
      'denzarc.com uses Vercel Production env vars — not Development only.',
    ].filter(Boolean),
  });
}
