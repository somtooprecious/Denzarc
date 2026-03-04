import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProducts } from '@/lib/plan';
import { z } from 'zod';

const updateProductSchema = z.object({
  unit_price: z.coerce.number().min(0, 'Price must be 0 or greater'),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasProducts((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .eq('user_id', profileId)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('products')
    .update({ unit_price: parsed.data.unit_price, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: updated } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  return NextResponse.json(updated ?? { ok: true });
}
