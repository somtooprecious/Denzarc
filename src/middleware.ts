import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Visitors always see the landing page (/) first; sign-in and sign-up are reached from there.
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/support',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service',
  '/refund-policy',
  '/robots.txt',
  '/sitemap.xml',
  '/api/cron/notifications',
  '/api/payments/verify',
  '/api/payments/webhook',
  // Landing-page review form (visitors are not signed in)
  '/api/reviews',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;
  try {
    await auth.protect();
  } catch {
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
