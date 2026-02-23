'use client';

import { SessionProvider, SessionProviderNoAuth } from './SessionProvider';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {hasClerkPublishableKey ? (
        <SessionProvider>{children}</SessionProvider>
      ) : (
        <SessionProviderNoAuth>{children}</SessionProviderNoAuth>
      )}
    </ThemeProvider>
  );
}
