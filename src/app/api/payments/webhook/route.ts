import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { verifyAndGrantPro } from '@/lib/paystack/grantPro';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/**
 * Paystack sends charge.success to this URL when a payment completes.
 * This runs server-to-server so the user gets Pro even if they close the tab before redirect.
 * Always return 200 so Paystack stops retrying.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';

  if (!PAYSTACK_SECRET) {
    console.error('[Paystack webhook] No secret key');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const hash = createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
  if (hash !== signature) {
    console.error('[Paystack webhook] Invalid signature');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error('[Paystack webhook] Invalid JSON');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const reference = event.data?.reference;
  if (!reference || typeof reference !== 'string') {
    console.error('[Paystack webhook] No reference in charge.success');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const result = await verifyAndGrantPro(reference.trim(), PAYSTACK_SECRET);
  if (result.ok) {
    console.log('[Paystack webhook] Granted Pro for reference', reference);
  } else {
    console.warn('[Paystack webhook] grantPro failed', reference, result.error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
