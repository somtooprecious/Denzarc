import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

const PRO_CURRENCY = (process.env.PRO_PLAN_CURRENCY ?? 'NGN').toString().trim().toUpperCase();
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

function currencyMatches(paid: string, expected: string): boolean {
  const p = String(paid ?? '').replace(/\s/g, '').toUpperCase();
  const e = String(expected ?? '').replace(/\s/g, '').toUpperCase();
  if (!p) return true; // Paystack didn't send currency; allow
  const ngnVariants = ['NGN', 'NGR', 'NAIRA', '566'];
  const isNgn = (c: string) =>
    ngnVariants.includes(c) || c.includes('NGN') || c.includes('NAIRA') || c.includes('NGR');
  if (isNgn(e) && isNgn(p)) return true;
  return p === e;
}

type PaystackVerifyData = {
  status?: boolean;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    metadata?: { user_id?: string };
  };
};

/**
 * Verify with Paystack and grant Pro: update payment to success and profile to pro.
 * Used by both the redirect callback (GET verify) and the webhook (POST).
 * Returns { ok: true } or { error: string }.
 */
export async function verifyAndGrantPro(
  reference: string,
  paystackSecret: string
): Promise<{ ok: true; userId: string } | { error: string }> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${paystackSecret}` } }
  );
  const data: PaystackVerifyData = await res.json().catch(() => null);

  if (!res.ok || !data?.status) {
    return { error: 'verify_failed' };
  }
  if (data.data?.status !== 'success') {
    return { error: 'verify_failed' };
  }

  const verifiedReference = String(data.data?.reference ?? reference);
  const userId = data.data?.metadata?.user_id;
  if (!userId) {
    return { error: 'metadata' };
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, user_id, amount')
    .eq('reference', verifiedReference)
    .single();

  if (!payment) {
    return { error: 'payment_not_found' };
  }
  if (payment.user_id !== userId) {
    return { error: 'user_mismatch' };
  }

  const paidAmountKobo = Number(data.data?.amount ?? 0);
  const expectedAmountKobo = Math.round(Number(payment.amount ?? 0) * 100);
  if (paidAmountKobo !== expectedAmountKobo) {
    return { error: 'amount_mismatch' };
  }

  const paidCurrency = String(data.data?.currency ?? '').trim().toUpperCase();
  if (!currencyMatches(paidCurrency, PRO_CURRENCY)) {
    return { error: 'currency_mismatch' };
  }

  const alreadySuccess = payment.status === 'success';
  if (!alreadySuccess) {
    await supabase.from('payments').update({ status: 'success' }).eq('reference', verifiedReference);
  }

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  const { error: updateError } = await supabase.from('profiles').update({
    plan: 'pro',
    subscription_start: now.toISOString(),
    subscription_end: end.toISOString(),
    updated_at: now.toISOString(),
  }).eq('id', userId);

  if (updateError) {
    console.error('[Paystack grantPro] Profile update failed', {
      userId,
      reference: verifiedReference,
      error: updateError.message,
    });
    return { error: 'update_failed' };
  }

  if (ADMIN_NOTIFICATION_EMAIL && !alreadySuccess) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    const customerEmail = profile?.email ?? 'Unknown';
    await sendEmail({
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `New Pro subscription: ${customerEmail}`,
      html: `<p>A user upgraded to Pro.</p><p><strong>User ID:</strong> ${userId}</p><p><strong>Email:</strong> ${customerEmail}</p><p><strong>Reference:</strong> ${verifiedReference}</p><p><strong>Subscription end:</strong> ${end.toISOString()}</p>`,
      text: `New Pro subscription. User ID: ${userId}. Email: ${customerEmail}. Reference: ${verifiedReference}.`,
    }).catch(() => {});
  }

  return { ok: true, userId };
}
