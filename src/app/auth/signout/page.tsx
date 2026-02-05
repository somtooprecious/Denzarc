'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export default function AuthSignOutPage() {
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
