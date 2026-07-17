'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function ProfileSyncRetry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sync-profile', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const raw = data.error ?? 'Could not link your account.';
        const msg =
          typeof raw === 'string' && /fetch failed|enotfound|getaddrinfo/i.test(raw)
            ? 'Cannot reach Supabase. Fix NEXT_PUBLIC_SUPABASE_URL in Vercel Production (project may be paused or deleted), redeploy, then try again.'
            : raw;
        toast.error(msg, { duration: 10000 });
        return;
      }
      toast.success('Account linked. Loading dashboard…');
      router.refresh();
    } catch {
      toast.error('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
    >
      {loading ? 'Linking account…' : 'Link my account now'}
    </button>
  );
}
