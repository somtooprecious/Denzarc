import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PRO_CURRENCY = process.env.PRO_PLAN_CURRENCY ?? 'NGN';

/**
 * POST /api/admin/verify-payment
 * Admin-only: re-verify a payment by reference with Paystack and update payment + profile to success/Pro.
 * Use when a payment was completed but the callback didn't run (e.g. user closed tab).
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { reference?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const ref = typeof body.reference === 'string' ? body.reference.trim() : '';
  if (!ref) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'Paystack not configured' }, { status: 503 });
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    return NextResponse.json({ error: 'Paystack verify failed', detail: data?.message }, { status: 400 });
  }
  if (data.data?.status !== 'success') {
    return NextResponse.json({ error: 'Transaction not successful on Paystack', status: data.data?.status }, { status: 400 });
  }

  const verifiedReference = String(data.data?.reference ?? ref);
  const userIdFromMeta = data.data?.metadata?.user_id;
  if (!userIdFromMeta) {
    return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, user_id, amount')
    .eq('reference', verifiedReference)
    .single();

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found for this reference' }, { status: 404 });
  }
  if (payment.user_id !== userIdFromMeta) {
    return NextResponse.json({ error: 'User mismatch' }, { status: 400 });
  }

  const paidAmountKobo = Number(data.data?.amount ?? 0);
  const expectedAmountKobo = Math.round(Number(payment.amount ?? 0) * 100);
  if (paidAmountKobo !== expectedAmountKobo) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  const paidCurrency = String(data.data?.currency ?? '').toUpperCase();
  if (paidCurrency && paidCurrency !== PRO_CURRENCY.toUpperCase()) {
    return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 });
  }

  await supabase.from('payments').update({ status: 'success' }).eq('reference', verifiedReference);

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const { error: updateError } = await supabase.from('profiles').update({
    plan: 'pro',
    subscription_start: now.toISOString(),
    subscription_end: end.toISOString(),
    updated_at: now.toISOString(),
  }).eq('id', userIdFromMeta);

  if (updateError) {
    return NextResponse.json(
      { error: 'Profile update failed', detail: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Payment and profile updated. Refresh the admin page to see it in Success and Revenue.',
    reference: verifiedReference,
  });
}
