import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseProfile } from '@/lib/auth';

const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'somtooprecious1@gmail.com';

type SupportBody = {
  category?: string;
  subject?: string;
  message?: string;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(req: NextRequest) {
  if (!RESEND_KEY) {
    return NextResponse.json({ error: 'Support email is not configured' }, { status: 503 });
  }

  const profile = await getSupabaseProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SupportBody;
  try {
    body = (await req.json()) as SupportBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const category = (body.category ?? 'General').trim();
  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!subject || subject.length < 5) {
    return NextResponse.json({ error: 'Subject must be at least 5 characters' }, { status: 400 });
  }
  if (!message || message.length < 15) {
    return NextResponse.json({ error: 'Message must be at least 15 characters' }, { status: 400 });
  }
  if (subject.length > 120) {
    return NextResponse.json({ error: 'Subject is too long' }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
  }

  const safeCategory = escapeHtml(category);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const safeName = escapeHtml(profile.full_name ?? 'Unknown');
  const safeEmail = escapeHtml(profile.email);
  const safePlan = escapeHtml(profile.plan);
  const safeProfileId = escapeHtml(profile.id);

  const resend = new Resend(RESEND_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: SUPPORT_EMAIL,
    subject: `[Support] ${subject}`,
    html: `
      <h2>New support request</h2>
      <p><strong>Category:</strong> ${safeCategory}</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong><br />${safeMessage}</p>
      <hr />
      <p><strong>User:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Plan:</strong> ${safePlan}</p>
      <p><strong>Profile ID:</strong> ${safeProfileId}</p>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Failed to send support request' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
