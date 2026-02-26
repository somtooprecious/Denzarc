'use client';

import { useState } from 'react';

/**
 * One-click fix: sync all users who have a successful payment but are still on Free to Pro.
 */
export function SyncPaidToProButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/sync-paid-to-pro', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage(data.message ?? `Updated ${data.updated ?? 0} to Pro. Refresh the page.`);
      } else {
        setMessage(data.error ?? 'Sync failed.');
      }
    } catch {
      setMessage('Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-3 py-2 text-sm rounded bg-green-600 text-white disabled:opacity-50"
      >
        {loading ? 'Syncing…' : 'Sync all paid users to Pro'}
      </button>
      {message && (
        <span className="text-sm text-slate-600 dark:text-slate-400">{message}</span>
      )}
    </span>
  );
}
