import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
