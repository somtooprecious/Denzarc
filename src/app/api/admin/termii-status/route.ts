import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin';

/**
 * Admin-only: confirms Termii env vars are set (no secrets returned).
 * GET /api/admin/termii-status when logged in as admin.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKeySet = Boolean(process.env.TERMII_API_KEY?.trim());
  const senderIdSet = Boolean(process.env.TERMII_SENDER_ID?.trim());

  return NextResponse.json({
    termiiConfigured: apiKeySet,
    senderIdSet,
    ready: apiKeySet, // SMS works if API key is set (sender ID has default)
  });
}
