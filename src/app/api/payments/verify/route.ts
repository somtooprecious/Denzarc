import { NextRequest, NextResponse } from 'next/server';
import { verifyAndGrantPro } from '@/lib/paystack/grantPro';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: NextRequest) {
  const ref =
    req.nextUrl.searchParams.get('reference') ??
    req.nextUrl.searchParams.get('trxref') ??
    req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return NextResponse.redirect(new URL('/pricing?error=missing_ref', req.url));
  }
  if (!PAYSTACK_SECRET) {
    return NextResponse.redirect(new URL('/pricing?error=config', req.url));
  }

  const result = await verifyAndGrantPro(ref, PAYSTACK_SECRET);

  if ('ok' in result && result.ok) {
    return NextResponse.redirect(new URL('/dashboard?upgraded=pro', req.url));
  }
  const errorCode = 'error' in result ? result.error : 'verify_failed';
  return NextResponse.redirect(new URL(`/pricing?error=${errorCode}`, req.url));
}
