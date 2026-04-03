import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const looseEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUPPORT_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
  'somtooprecious1@gmail.com';

const reviewSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || v === '') return null;
      const s = String(v).trim();
      return s === '' ? null : s;
    })
    .refine((s) => s === null || looseEmail.test(s), { message: 'Invalid email' }),
  rating: z.coerce.number().int().min(1).max(5),
  review_text: z.string().min(10, 'Review must be at least 10 characters'),
});

function escHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        (first.email?.[0] as string | undefined) ||
        (first.name?.[0] as string | undefined) ||
        (first.review_text?.[0] as string | undefined) ||
        'Please check your entries and try again';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { name, email, rating, review_text } = parsed.data;
    const row = {
      name,
      email: email ?? null,
      rating,
      review_text,
    };

    let savedToDb = false;
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from('reviews').insert(row);
      savedToDb = !error;
    } catch {
      savedToDb = false;
    }

    if (savedToDb) {
      return NextResponse.json({ ok: true });
    }

    const text = [
      'New Denzarc website review',
      '',
      `Name: ${name}`,
      `Email: ${email ?? '(not provided)'}`,
      `Rating: ${rating} / 5`,
      '',
      review_text,
    ].join('\n');

    const html = [
      '<p><strong>New Denzarc website review</strong></p>',
      `<p><strong>Name:</strong> ${escHtml(name)}</p>`,
      `<p><strong>Email:</strong> ${escHtml(email ?? '(not provided)')}</p>`,
      `<p><strong>Rating:</strong> ${rating} / 5</p>`,
      `<p><strong>Review:</strong></p><p>${escHtml(review_text).replace(/\n/g, '<br/>')}</p>`,
    ].join('');

    const sent = await sendEmail({
      to: SUPPORT_EMAIL,
      subject: 'Denzarc: new review from website',
      text,
      html,
    });

    if (sent.ok) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        error:
          'We could not save your review yet. Please use the Contact page or try again later.',
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

