'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/providers/SessionProvider';

/**
 * When the user lands on the dashboard with ?upgraded=pro (after Paystack callback),
 * refresh the client-side profile so the nav and UI immediately show Pro,
 * then replace the URL to remove the query param.
 */
export function UpgradeSuccessRefresh({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined> | null;
}) {
  const router = useRouter();
  const { refreshProfile } = useSession();
  const didRun = useRef(false);

  useEffect(() => {
    const upgraded = searchParams?.upgraded;
    const value = Array.isArray(upgraded) ? upgraded[0] : upgraded;
    if (value !== 'pro' || didRun.current) return;
    didRun.current = true;

    (async () => {
      await refreshProfile();
      router.replace('/dashboard', { scroll: false });
    })();
  }, [searchParams, refreshProfile, router]);

  return null;
}
