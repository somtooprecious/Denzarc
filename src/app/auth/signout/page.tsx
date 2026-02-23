'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function FallbackSignOutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-slate-600 dark:text-slate-400">Redirecting…</p>
    </div>
  );
}

function ClerkSignOutPage() {
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    signOut?.({ redirectUrl: '/' }).then(() => {
      router.push('/');
      router.refresh();
    });
  }, [signOut, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-slate-600 dark:text-slate-400">Signing out…</p>
    </div>
  );
}

export default function AuthSignOutPage() {
  return hasClerkPublishableKey ? <ClerkSignOutPage /> : <FallbackSignOutPage />;
}
