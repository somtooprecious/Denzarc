import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasInventory } from '@/lib/plan';
import { z } from 'zod';

const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['in', 'out']),
  quantity: z.coerce.number().positive(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasInventory((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = stockMovementSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

  const { data: product } = await supabase.from('products').select('quantity').eq('id', parsed.data.product_id).eq('user_id', profileId).single();
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const currentQty = Number(product.quantity);
  const change = parsed.data.type === 'in' ? parsed.data.quantity : -parsed.data.quantity;
  const newQty = currentQty + change;
  if (newQty < 0) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });

  const { error: moveErr } = await supabase.from('stock_movements').insert({
    product_id: parsed.data.product_id,
    user_id: profileId,
    type: parsed.data.type,
    quantity: parsed.data.quantity,
    notes: parsed.data.notes ?? null,
  });
  if (moveErr) return NextResponse.json({ error: moveErr.message }, { status: 500 });

  const { data: updated, error: updateErr } = await supabase.from('products').update({ quantity: newQty, updated_at: new Date().toISOString() }).eq('id', parsed.data.product_id).select().single();
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json(updated);
}
