import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PRO_CURRENCY = process.env.PRO_PLAN_CURRENCY ?? 'NGN';

export async function GET(req: NextRequest) {
  const ref =
    req.nextUrl.searchParams.get('reference') ??
    req.nextUrl.searchParams.get('trxref') ??
    req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return NextResponse.redirect(new URL('/pricing?error=missing_ref', req.url));
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.redirect(new URL('/pricing?error=config', req.url));
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const data = await res.json();

  if (!data.status || data.data?.status !== 'success') {
    return NextResponse.redirect(new URL('/pricing?error=verify_failed', req.url));
  }

  const userId = data.data?.metadata?.user_id;
  if (!userId) {
    return NextResponse.redirect(new URL('/pricing?error=metadata', req.url));
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, user_id, amount')
    .eq('reference', ref)
    .single();

  if (!payment) {
    return NextResponse.redirect(new URL('/pricing?error=payment_not_found', req.url));
  }

  if (payment.user_id !== userId) {
    return NextResponse.redirect(new URL('/pricing?error=user_mismatch', req.url));
  }

  const paidAmountKobo = Number(data.data?.amount ?? 0);
  const expectedAmountKobo = Math.round(Number(payment.amount ?? 0) * 100);
  if (paidAmountKobo !== expectedAmountKobo) {
    return NextResponse.redirect(new URL('/pricing?error=amount_mismatch', req.url));
  }

  const paidCurrency = String(data.data?.currency ?? '').toUpperCase();
  if (paidCurrency && paidCurrency !== PRO_CURRENCY.toUpperCase()) {
    return NextResponse.redirect(new URL('/pricing?error=currency_mismatch', req.url));
  }

  if (payment.status === 'success') {
    return NextResponse.redirect(new URL('/dashboard?upgraded=pro&already=1', req.url));
  }

  await supabase.from('payments').update({ status: 'success' }).eq('reference', ref);

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  await supabase.from('profiles').update({
    plan: 'pro',
    subscription_start: now.toISOString(),
    subscription_end: end.toISOString(),
    updated_at: now.toISOString(),
  }).eq('id', userId);

  return NextResponse.redirect(new URL('/dashboard?upgraded=pro', req.url));
}
