'use client';

import { useState } from 'react';

export function AdminVerifyPaymentForm() {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim();
    if (!ref) {
      setMessage({ type: 'error', text: 'Enter a payment reference.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage({ type: 'ok', text: data.message ?? 'Updated. Refresh the page to see it in Success and Revenue.' });
        setReference('');
      } else {
        setMessage({ type: 'error', text: data.error ?? data.detail ?? 'Re-verify failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Request failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <label className="sr-only" htmlFor="admin-verify-ref">
        Payment reference
      </label>
      <input
        id="admin-verify-ref"
        type="text"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Payment reference (e.g. pro-xxx-123)"
        className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 min-w-[200px]"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-2 text-sm rounded bg-primary-600 text-white disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Re-verify payment'}
      </button>
      {message && (
        <span
          className={`text-sm ${message.type === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {message.text}
        </span>
      )}
    </form>
  );
}
