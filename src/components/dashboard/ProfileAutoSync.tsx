'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/** Tries once to link Clerk → Supabase after sign-in (before user clicks retry). */
export function ProfileAutoSync() {
  const router = useRouter();
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    fetch('/api/auth/sync-profile', { method: 'POST' })
      .then((res) => {
        if (res.ok) router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
