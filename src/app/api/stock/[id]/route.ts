import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasInventory } from '@/lib/plan';
import { z } from 'zod';

const patchSchema = z.object({
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: profileRow } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasInventory((profileRow?.plan as 'free' | 'pro') ?? 'free')) {
    return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const { data: movement, error: fetchErr } = await supabase
    .from('stock_movements')
    .select('id')
    .eq('id', id)
    .eq('user_id', profileId)
    .single();

  if (fetchErr || !movement) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error: updateErr } = await supabase
    .from('stock_movements')
    .update({ notes: parsed.data.notes ?? null })
    .eq('id', id)
    .eq('user_id', profileId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
