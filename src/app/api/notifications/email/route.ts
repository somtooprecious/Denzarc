import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProfileId } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { to, subject, html, text } = body as { to: string; subject: string; html?: string; text?: string };
  if (!to || !subject) return NextResponse.json({ error: 'Missing to or subject' }, { status: 400 });

  const result = await sendEmail({ to, subject, html, text });
  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Email send failed' }, { status: 502 });

  return NextResponse.json({ ok: true });
}
