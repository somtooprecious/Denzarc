'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function BusinessSettingsForm({ profile }: { profile: { business_name: string | null; business_address: string | null; business_logo_url: string | null; phone: string | null } | null }) {
  const [name, setName] = useState(profile?.business_name ?? '');
  const [address, setAddress] = useState(profile?.business_address ?? '');
  const [logoUrl, setLogoUrl] = useState(profile?.business_logo_url ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: name || null, business_address: address || null, business_logo_url: logoUrl || null, phone: phone || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      toast.success('Settings saved');
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Your business name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Full address" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business logo URL</label>
        <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="https://example.com/logo.png" />
        <p className="mt-1 text-xs text-slate-500">Paste a direct image URL. Use a service like imgbb.com to host your logo.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your phone (for SMS reminders)</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="e.g. 08012345678" />
        <p className="mt-1 text-xs text-slate-500">For subscription expiry & low stock SMS alerts.</p>
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">{loading ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}
