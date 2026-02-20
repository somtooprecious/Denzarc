import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';
import { sendTermiiMessage } from '@/lib/termii';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { to, message } = body as { to?: string; message?: string };
  if (!to || typeof to !== 'string' || !message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid to / message' }, { status: 400 });
  }

  let phone: string;
  const toTrimmed = to.trim();
  if (UUID_REGEX.test(toTrimmed)) {
    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', toTrimmed)
      .single();
    if (error || !profile?.phone) {
      return NextResponse.json({ error: 'User not found or has no phone number' }, { status: 404 });
    }
    phone = String(profile.phone).trim();
  } else {
    phone = toTrimmed;
  }

  const result = await sendTermiiMessage(phone, message);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'SMS send failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
