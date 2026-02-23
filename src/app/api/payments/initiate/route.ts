import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PRO_AMOUNT_NAIRA = Number(process.env.PRO_PLAN_AMOUNT ?? 2999);
const PRO_AMOUNT_KOBO = Math.round(PRO_AMOUNT_NAIRA * 100);
const PRO_CURRENCY = (process.env.PRO_PLAN_CURRENCY ?? 'NGN').toUpperCase();
import { getAppUrl } from '@/lib/url';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ? getAppUrl() : 'http://localhost:3000'.replace(/\/$/, '');

export async function POST(_req: NextRequest) {
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
  const email = profile?.email ?? '';
  if (!email) return NextResponse.json({ error: 'No billing email found for this account' }, { status: 400 });

  const callbackUrl = `${APP_URL}/api/payments/verify`;
  const body = {
    email: email.trim(),
    amount: PRO_AMOUNT_KOBO,
    currency: PRO_CURRENCY,
    reference,
    callback_url: callbackUrl,
    metadata: { user_id: profileId },
  };

  console.log('[Paystack initiate] Request payload:', body);

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  console.log('[Paystack initiate] Response:', {
    httpStatus: res.status,
    status: data?.status,
    message: data?.message,
    reference,
  });

  if (!res.ok || !data?.status) {
    console.error('Paystack initialize failed', {
      httpStatus: res.status,
      reference,
      profileId,
      paystackMessage: data?.message ?? null,
      paystackCode: data?.code ?? null,
      paystackStatus: data?.status ?? null,
      paystackData: data?.data ?? null,
    });
    return NextResponse.json(
      {
        error: data?.message ?? `Paystack initialize failed (${res.status})`,
        reference,
      },
      { status: 502 }
    );
  }

  if (!data.data?.authorization_url) {
    console.error('Paystack initialize missing authorization_url', {
      reference,
      profileId,
      paystackData: data?.data ?? null,
    });
    return NextResponse.json({ error: 'No authorization URL returned by Paystack', reference }, { status: 502 });
  }

  await supabase.from('payments').insert({ user_id: profileId, amount: PRO_AMOUNT_NAIRA, reference, status: 'pending' });
  return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data?.reference ?? reference });
}
