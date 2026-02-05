import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasInventory } from '@/lib/plan';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name required'),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().min(0).default(0),
  unit_price: z.coerce.number().min(0).default(0),
  low_stock_threshold: z.coerce.number().min(0).default(5),
});

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasInventory((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }
  const { data, error } = await supabase.from('products').select('*').eq('user_id', profileId).order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

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
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await supabase.from('products').insert({
    user_id: profileId,
    name: parsed.data.name,
    sku: parsed.data.sku || null,
    quantity: parsed.data.quantity,
    unit_price: parsed.data.unit_price,
    low_stock_threshold: parsed.data.low_stock_threshold,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
