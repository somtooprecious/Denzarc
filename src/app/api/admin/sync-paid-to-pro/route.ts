import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';

/**
 * POST /api/admin/sync-paid-to-pro
 * Admin-only: finds all users who have at least one successful payment but profile.plan is still 'free',
 * and updates their profile to Pro. Use once to fix existing paid accounts.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: successPayments } = await supabase
    .from('payments')
    .select('user_id')
    .eq('status', 'success');

  const paidUserIds = Array.from(new Set((successPayments ?? []).map((p) => p.user_id)));

  if (paidUserIds.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: 'No successful payments found.' });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, plan')
    .in('id', paidUserIds);

  const toUpgrade = (profiles ?? []).filter((p) => (p.plan as string) !== 'pro').map((p) => p.id);

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const updatePayload = {
    plan: 'pro',
    subscription_start: now.toISOString(),
    subscription_end: end.toISOString(),
    updated_at: now.toISOString(),
  };

  let updated = 0;
  for (const profileId of toUpgrade) {
    const { error } = await supabase.from('profiles').update(updatePayload).eq('id', profileId);
    if (!error) updated++;
  }

  return NextResponse.json({
    ok: true,
    updated,
    total: toUpgrade.length,
    message: `Updated ${updated} profile(s) to Pro.`,
  });
}
