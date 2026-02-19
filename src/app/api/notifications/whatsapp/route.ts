import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProfileId } from '@/lib/auth';
import { sendTermiiMessage } from '@/lib/termii';

export async function POST(req: NextRequest) {
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

  const result = await sendTermiiMessage(to, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'SMS/WhatsApp send failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
