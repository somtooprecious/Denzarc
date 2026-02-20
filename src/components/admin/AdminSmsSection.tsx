'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const WELCOME_MSG = 'Welcome to Denzarc! Manage invoices, inventory & more in one place. Log in to get started.';

export type ProfileForSms = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  plan: string | null;
  subscription_end: string | null;
  created_at: string | null;
};

export function AdminSmsSection({ profiles }: { profiles?: ProfileForSms[] | null }) {
  const [recipient, setRecipient] = useState<string>('');
  const [customPhone, setCustomPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const profilesList = Array.isArray(profiles) ? profiles : [];
  const withPhone = profilesList
    .filter((p) => p && p.phone && String(p.phone).trim())
    .sort((a, b) => (isNewUser(b) ? 1 : 0) - (isNewUser(a) ? 1 : 0));
  const useCustom = recipient === '__custom__';
  function isNewUser(p: ProfileForSms) {
    if (!p || !p.created_at) return false;
    try {
      const created = new Date(String(p.created_at)).getTime();
      if (Number.isNaN(created)) return false;
      return Date.now() - created < 14 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }
  function safeDate(value: string | null | undefined): string {
    if (value == null || value === '') return '—';
    try {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch {
      return '—';
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const to = useCustom ? customPhone.trim() : recipient;
    if (!to || !message.trim()) {
      toast.error('Select a recipient and enter a message.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send SMS');
        return;
      }
      toast.success('SMS sent');
      setMessage('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
        User contacts &amp; SMS (Termii)
      </div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Users add their phone in Settings. You can send any SMS (e.g. welcome to new users). Subscription reminders and low-stock alerts are sent by email and SMS when a phone is set.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Plan</th>
                <th className="py-2 px-3">Subscription end</th>
                <th className="py-2 px-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profilesList.map((u, i) => (
                <tr key={u?.id ?? `row-${i}`} className="border-t border-slate-100 dark:border-slate-700/60">
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1">
                      {u?.email ?? '—'}
                      {u && isNewUser(u) && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                          New
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2 px-3">{u?.phone ? String(u.phone) : '—'}</td>
                  <td className="py-2 px-3">{u?.full_name ?? '—'}</td>
                  <td className="py-2 px-3">{u?.plan ?? '—'}</td>
                  <td className="py-2 px-3">{safeDate(u?.subscription_end)}</td>
                  <td className="py-2 px-3">{safeDate(u?.created_at)}</td>
                </tr>
              ))}
              {profilesList.length === 0 && (
                <tr>
                  <td className="py-3 px-3 text-slate-500" colSpan={6}>
                    No profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 max-w-xl">
          <h4 className="font-medium text-slate-900 dark:text-white">Send SMS</h4>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Recipient</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">Select user or use custom number below</option>
              {withPhone.map((p) => (
                <option key={p.id} value={p.id}>
                  {isNewUser(p) ? '[New] ' : ''}{p.email ?? p.id} — {p.phone}
                </option>
              ))}
              <option value="__custom__">Custom phone number</option>
            </select>
          </div>
          {useCustom && (
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Phone number</label>
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="SMS content..."
              className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              maxLength={160}
            />
            <p className="text-xs text-slate-500 mt-1">{message.length}/160 characters</p>
            <button
              type="button"
              onClick={() => setMessage(WELCOME_MSG)}
              className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Use welcome message for new users
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send SMS'}
          </button>
        </form>
      </div>
    </div>
  );
}
