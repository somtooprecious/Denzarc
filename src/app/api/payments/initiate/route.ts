import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { auth } from '@clerk/nextjs/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PRO_AMOUNT = (Number(process.env.PRO_PLAN_AMOUNT ?? 2999)) * 100;
const PRO_CURRENCY = process.env.PRO_PLAN_CURRENCY ?? 'NGN';
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET) return NextResponse.json({ error: 'Paystack not configured' }, { status: 503 });
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, email')
    .eq('id', profileId)
    .single();
  if ((profile?.plan as string) === 'pro') return NextResponse.json({ error: 'Already on Pro' }, { status: 400 });

  const reference = `pro-${profileId}-${Date.now()}`;
  const clerkUser = await auth();
  const email = (clerkUser.sessionClaims?.email as string) ?? profile?.email ?? '';
  if (!email) return NextResponse.json({ error: 'No billing email found for this account' }, { status: 400 });

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email || undefined,
      amount: PRO_AMOUNT,
      currency: PRO_CURRENCY,
      reference,
      callback_url: `${APP_URL}/api/payments/verify`,
      metadata: { user_id: profileId },
    }),
  });
  const data = await res.json();
  if (!data.status) return NextResponse.json({ error: data.message ?? 'Paystack error' }, { status: 502 });

  await supabase.from('payments').insert({ user_id: profileId, amount: PRO_AMOUNT / 100, reference, status: 'pending' });
  return NextResponse.json({ authorization_url: data.data?.authorization_url, reference: data.data?.reference });
}
