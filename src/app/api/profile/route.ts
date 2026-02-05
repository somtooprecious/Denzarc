import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseProfileId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
  business_name: z.string().optional().nullable(),
  business_address: z.string().optional().nullable(),
  business_logo_url: z.union([z.string().url(), z.literal('')]).optional().nullable(),
  phone: z.string().optional().nullable(),
});

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }
  const { business_name, business_address, business_logo_url, phone } = parsed.data;

  const supabase = createAdminClient();
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      business_name: business_name ?? null,
      business_address: business_address ?? null,
      business_logo_url: business_logo_url || null,
      phone: phone ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
