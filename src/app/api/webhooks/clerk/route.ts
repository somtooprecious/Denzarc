import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import {
  parseClerkEmail,
  parseClerkFullName,
  upsertProfileForClerkUser,
} from '@/lib/profile-sync';

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('[clerk-webhook] Verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const result = await upsertProfileForClerkUser({
      clerkUserId: event.data.id,
      email: parseClerkEmail(event.data),
      fullName: parseClerkFullName(event.data),
    });
    if (!result.ok) {
      console.error('[clerk-webhook] Profile sync failed:', result.code, result.message);
      return NextResponse.json({ error: result.message, code: result.code }, { status: 500 });
    }
    return NextResponse.json({ ok: true, profileId: result.profileId });
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
