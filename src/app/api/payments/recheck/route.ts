import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PRO_CURRENCY = process.env.PRO_PLAN_CURRENCY ?? 'NGN';

/**
 * POST /api/payments/recheck
 * For users who paid but still see Free: re-verifies the latest payment with Paystack
 * and ensures the profile is set to Pro. Use after upgrading if the callback didn't run.
 */
export async function POST() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('id', profileId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  if ((profile.plan as string) === 'pro') {
    return NextResponse.json({ ok: true, plan: 'pro', message: 'Already on Pro' });
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('id, reference, status, user_id, amount')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!payment) {
    return NextResponse.json({ ok: false, message: 'No payment found' }, { status: 404 });
  }

  if (payment.status === 'success') {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: 'pro',
        subscription_start: now.toISOString(),
        subscription_end: end.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', profileId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: 'Failed to update profile', error: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, plan: 'pro', message: 'Subscription synced' });
  }

  if (payment.status !== 'pending' || !PAYSTACK_SECRET) {
    return NextResponse.json(
      { ok: false, message: 'No successful payment to sync. Try paying again or contact support.' },
      { status: 400 }
    );
  }

  const ref = payment.reference;
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status || data.data?.status !== 'success') {
    return NextResponse.json(
      { ok: false, message: 'Payment not completed yet. Complete payment or try again later.' },
      { status: 400 }
    );
  }

  const userId = data.data?.metadata?.user_id;
  if (userId !== profileId) {
    return NextResponse.json({ ok: false, message: 'Payment does not match account' }, { status: 400 });
  }

  const paidAmountKobo = Number(data.data?.amount ?? 0);
  const expectedAmountKobo = Math.round(Number(payment.amount ?? 0) * 100);
  if (paidAmountKobo !== expectedAmountKobo) {
    return NextResponse.json({ ok: false, message: 'Amount mismatch' }, { status: 400 });
  }

  const paidCurrency = String(data.data?.currency ?? '').toUpperCase();
  if (paidCurrency && paidCurrency !== PRO_CURRENCY.toUpperCase()) {
    return NextResponse.json({ ok: false, message: 'Currency mismatch' }, { status: 400 });
  }

  await supabase.from('payments').update({ status: 'success' }).eq('reference', ref);

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      plan: 'pro',
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', profileId);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: 'Failed to update profile', error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, plan: 'pro', message: 'Subscription activated' });
}
