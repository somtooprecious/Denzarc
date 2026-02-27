import { NextResponse } from 'next/server';
import { getSupabaseProfile } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

const SUPPORT_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
  'somtooprecious1@gmail.com';

const SUBJECT = 'Denzarc Pro – subscription expiry reminder';
const MESSAGE = 'Hi,\n\nMy subscription is expiring soon. Please assist with renewal.\n\nThank you.';

export async function POST() {
  const profile = await getSupabaseProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userEmail = (profile.email as string)?.trim() || null;
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Add your email in Settings to send the reminder' },
      { status: 400 }
    );
  }

  const text = `${MESSAGE}\n\n---\nFrom: ${userEmail}`;
  const html = `<p>Hi,</p><p>My subscription is expiring soon. Please assist with renewal.</p><p>Thank you.</p><p><small>From: ${userEmail}</small></p>`;

  const result = await sendEmail({
    to: SUPPORT_EMAIL,
    subject: SUBJECT,
    html,
    text,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? 'Email send failed' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
