import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { z } from 'zod';

const createSaleSchema = z.object({
  sale_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.coerce.number().min(0),
  payment_type: z.enum(['cash', 'transfer', 'other']).optional().default('cash'),
  description: z.string().optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().optional().nullable().or(z.literal('')),
  quantity: z.coerce.number().min(0).optional().nullable(),
  unit_price: z.coerce.number().min(0).optional().nullable(),
});

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', profileId)
    .order('sale_date', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createSaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const q = parsed.data.quantity ?? 0;
  const up = parsed.data.unit_price ?? 0;
  const amount = q > 0 && up >= 0 ? q * up : parsed.data.amount;

  const { data, error } = await supabase
    .from('sales')
    .insert({
      user_id: profileId,
      sale_date: parsed.data.sale_date,
      amount: Number(amount),
      payment_type: parsed.data.payment_type ?? 'cash',
      description: parsed.data.description ?? null,
      product_id: parsed.data.product_id ?? null,
      customer_name: (parsed.data.customer_name as string)?.trim() || null,
      quantity: parsed.data.quantity ?? null,
      unit_price: parsed.data.unit_price ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
