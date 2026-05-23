import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/admin';

/** Check deployment config (no secrets exposed). */
export async function GET() {
  const clerk =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) &&
    Boolean(process.env.CLERK_SECRET_KEY?.trim());
  const supabase = isSupabaseConfigured();
  const webhook = Boolean(process.env.CLERK_WEBHOOK_SECRET?.trim());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || null;

  const ready = clerk && supabase;

  return NextResponse.json({
    ready,
    clerk,
    supabase,
    webhook,
    appUrl,
    hints: [
      !clerk && 'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in Vercel.',
      !supabase && 'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
      !webhook && 'Optional: add CLERK_WEBHOOK_SECRET and webhook URL for automatic sign-up sync.',
      !appUrl && 'Set NEXT_PUBLIC_APP_URL=https://denzarc.com',
      clerk &&
        supabase &&
        'Run supabase/migrations/005_clerk_auth.sql in Supabase if sign-in still fails.',
    ].filter(Boolean),
  });
}
