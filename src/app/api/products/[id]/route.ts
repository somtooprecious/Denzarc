import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProducts } from '@/lib/plan';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable().or(z.literal('')),
  category: z.string().optional().nullable().or(z.literal('')),
  image_url: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().min(0).optional(),
  unit_price: z.coerce.number().min(0).optional(),
  low_stock_threshold: z.coerce.number().min(0).optional(),
  is_listed: z.boolean().optional(),
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

  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.description !== undefined) {
    updates.description = (parsed.data.description as string)?.trim() || null;
  }
  if (parsed.data.category !== undefined) {
    updates.category = (parsed.data.category as string)?.trim() || null;
  }
  if (parsed.data.image_url !== undefined) {
    updates.image_url = (parsed.data.image_url as string)?.trim() || null;
  }
  if (parsed.data.sku !== undefined) updates.sku = parsed.data.sku?.trim() || null;
  if (parsed.data.quantity !== undefined) updates.quantity = parsed.data.quantity;
  if (parsed.data.unit_price !== undefined) updates.unit_price = parsed.data.unit_price;
  if (parsed.data.low_stock_threshold !== undefined) {
    updates.low_stock_threshold = parsed.data.low_stock_threshold;
  }
  if (parsed.data.is_listed !== undefined) updates.is_listed = parsed.data.is_listed;

  const { error } = await supabase.from('products').update(updates).eq('id', id).eq('user_id', profileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: updated } = await supabase.from('products').select('*').eq('id', id).single();
  return NextResponse.json(updated ?? { ok: true });
}

export async function DELETE(
  _req: NextRequest,
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

  const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', profileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
