import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const reviewSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().optional().nullable(),
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
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
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

