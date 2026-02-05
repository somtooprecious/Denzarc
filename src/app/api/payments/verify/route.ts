import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
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
