import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/support',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/robots.txt',
  '/sitemap.xml',
  '/api/cron/notifications',
  '/api/payments/verify',
]);

export default clerkMiddleware(async (auth, request) => {
  const proto = request.headers.get('x-forwarded-proto');
  const isHttp = proto === 'http' || (typeof request.url === 'string' && request.url.startsWith('http://') && !request.url.includes('localhost'));
  if (isHttp) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
