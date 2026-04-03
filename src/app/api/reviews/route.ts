import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const looseEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export async function POST(req: NextRequest) {
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

  const supabase = createAdminClient();
  const { name, email, rating, review_text } = parsed.data;

  const { error } = await supabase.from('reviews').insert({
    name,
    email: email ?? null,
    rating,
    review_text,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

