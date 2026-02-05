'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface NotificationsPanelProps {
  lowStockProducts: { name: string; quantity: number; low_stock_threshold: number }[];
  unpaidInvoices: { id: string; invoice_number: string; total: number; customer_phone: string | null }[];
  userEmail: string | null;
  userPhone: string | null;
  subscriptionEnd: string | null;
  plan: 'free' | 'pro';
}

export function NotificationsPanel({
  lowStockProducts,
  unpaidInvoices,
  userEmail,
  userPhone,
  subscriptionEnd,
  plan,
}: NotificationsPanelProps) {
  const [sendingLowStock, setSendingLowStock] = useState(false);
  const [sendingExpiry, setSendingExpiry] = useState(false);

  async function handleLowStockAlert() {
    if (!userEmail) { toast.error('Add your email in Settings first'); return; }
    if (lowStockProducts.length === 0) { toast.success('No low stock products'); return; }
    setSendingLowStock(true);
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: 'Low stock alert - Businesstool',
          html: `<p>Low stock products:</p><ul>${lowStockProducts.map((p) => `<li>${p.name}: ${p.quantity} left (alert at ${p.low_stock_threshold})</li>`).join('')}</ul><p><a href="${typeof window !== 'undefined' ? window.location.origin : ''}/inventory">View inventory</a></p>`,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      toast.success('Low stock alert sent to your email');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Email not configured');
    } finally {
      setSendingLowStock(false);
    }
  }

  async function handleSubscriptionExpiryReminder() {
    if (!userPhone) { toast.error('Add your phone in Settings to receive reminders'); return; }
    if (!subscriptionEnd) { toast.success('No active subscription'); return; }
    setSendingExpiry(true);
    try {
      const date = new Date(subscriptionEnd).toLocaleDateString();
      const msg = `Businesstool Pro: Your subscription expires on ${date}. Renew at ${typeof window !== 'undefined' ? window.location.origin : ''}/pricing`;
      const res = await fetch('/api/notifications/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: userPhone, message: msg }) });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      toast.success('Subscription reminder sent to your phone');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'SMS not configured');
    } finally {
      setSendingExpiry(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">Email (Resend) – one service for all email</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <li>• Invoice sent – From invoice detail, click &quot;Send via Email&quot;</li>
            <li>• Payment reminder – From unpaid invoice, click &quot;Payment reminder (email)&quot;</li>
            <li>• Low stock alert – Send alert to your email when products are low</li>
          </ul>
          {lowStockProducts.length > 0 && (
            <button type="button" onClick={handleLowStockAlert} disabled={sendingLowStock || !userEmail} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {sendingLowStock ? 'Sending…' : 'Send low stock alert'}
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-2">WhatsApp / SMS (Termii) – one service for all SMS</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <li>• Invoice link – Share via WhatsApp from invoice detail</li>
            <li>• Payment reminder – From unpaid invoice, click &quot;Payment reminder (SMS)&quot;</li>
            <li>• Subscription expiry reminder – Get reminder before your Pro plan expires</li>
          </ul>
          {plan === 'pro' && subscriptionEnd && (
            <button type="button" onClick={handleSubscriptionExpiryReminder} disabled={sendingExpiry || !userPhone} className="px-3 py-1.5 text-xs border border-amber-500 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50">
              {sendingExpiry ? 'Sending…' : 'Send subscription expiry reminder'}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-2">Quick actions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Send invoice or payment reminder from invoice pages.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices" className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition">View invoices</Link>
          <Link href="/inventory" className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">View inventory</Link>
        </div>
      </div>
      {(!userEmail || !userPhone) && (
        <p className="text-sm text-amber-600 dark:text-amber-400">Add your email and phone in Settings to receive notifications.</p>
      )}
    </div>
  );
}
