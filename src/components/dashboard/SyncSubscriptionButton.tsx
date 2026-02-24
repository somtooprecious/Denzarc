'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/providers/SessionProvider';

/**
 * Shown when the user is on Free plan. Lets them sync subscription if they already paid
 * but the callback didn’t run or profile wasn’t updated.
 */
export function SyncSubscriptionButton() {
  const router = useRouter();
  const { refreshProfile } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/payments/recheck', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        await refreshProfile();
        router.refresh();
        setMessage('Pro access activated. Refreshing…');
        return;
      }
      setMessage(data.message ?? 'Could not sync. Try upgrading again or contact support.');
    } catch {
      setMessage('Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
      >
        {loading ? 'Syncing…' : 'Paid but still Free? Sync subscription'}
      </button>
      {message && (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {message}
        </span>
      )}
    </span>
  );
}
