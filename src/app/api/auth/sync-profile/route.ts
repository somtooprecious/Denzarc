import { NextResponse } from 'next/server';
import { syncCurrentUserProfile } from '@/lib/auth';

/** Link Clerk user to Supabase profile (call after sign-in if dashboard shows setup screen). */
export async function POST() {
  const result = await syncCurrentUserProfile();
  if ('error' in result) {
    const status = result.code === 'UNAUTHORIZED' ? 401 : 503;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }
  return NextResponse.json({ ok: true, profileId: result.profileId });
}
