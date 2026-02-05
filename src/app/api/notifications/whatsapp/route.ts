import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProfileId } from '@/lib/auth';

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER = process.env.TERMII_SENDER_ID ?? 'Businesstool';

export async function POST(req: NextRequest) {
  if (!TERMII_API_KEY) return NextResponse.json({ error: 'Termii not configured' }, { status: 503 });
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { to, message } = body as { to: string; message: string };
  if (!to || !message) return NextResponse.json({ error: 'Missing to or message' }, { status: 400 });

  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: to.replace(/\D/g, '').replace(/^0/, '234'),
        from: TERMII_SENDER,
        sms: message,
        type: 'plain',
        api_key: TERMII_API_KEY,
      }),
    });
    const data = await res.json();
    if (!res.ok || data?.code !== 'ok') return NextResponse.json({ error: data?.message ?? 'Termii error' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Termii error:', e);
    return NextResponse.json({ error: 'SMS/WhatsApp send failed' }, { status: 502 });
  }
}
