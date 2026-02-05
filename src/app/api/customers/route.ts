import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasCustomerManagement } from '@/lib/plan';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasCustomerManagement((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }
  const { data, error } = await supabase.from('customers').select('*').eq('user_id', profileId).order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasCustomerManagement((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  const { data, error } = await supabase.from('customers').insert({
    user_id: profileId,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
