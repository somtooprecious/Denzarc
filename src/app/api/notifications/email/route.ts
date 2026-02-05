import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProfileId } from '@/lib/auth';
import { Resend } from 'resend';

const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';

export async function POST(req: NextRequest) {
  if (!RESEND_KEY) return NextResponse.json({ error: 'Email not configured' }, { status: 503 });
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { to, subject, html } = body as { to: string; subject: string; html?: string };
  if (!to || !subject) return NextResponse.json({ error: 'Missing to or subject' }, { status: 400 });
  try {
    const resend = new Resend(RESEND_KEY);
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html: html ?? undefined });
    if (error) return NextResponse.json({ error: error.message }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Resend error:', e);
    return NextResponse.json({ error: 'Email send failed' }, { status: 502 });
  }
}
