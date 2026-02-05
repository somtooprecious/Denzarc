'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function PricingCards({ currentPlan, isLoggedIn, subscriptionEnd }: { currentPlan: 'free' | 'pro'; isLoggedIn: boolean; subscriptionEnd?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!isLoggedIn) {
      router.push('/sign-up');
      return;
    }
    if (currentPlan === 'pro') {
      toast.success('You already have Pro');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to initiate payment');
      if (data.authorization_url) window.location.href = data.authorization_url;
      else throw new Error('No payment URL');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h2>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          NGN 0 <span className="text-base font-normal text-slate-500">/month</span>
        </p>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
          <li>5 invoices per month</li>
          <li>Platform branding</li>
          <li>Basic sales tracking</li>
          <li>PDF download and share</li>
        </ul>
        {isLoggedIn && currentPlan === 'free' ? (
          <Link href="/dashboard" className="block w-full py-3 px-4 text-center border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">Current plan</Link>
        ) : !isLoggedIn ? (
          <Link href="/sign-up" className="block w-full py-3 px-4 text-center bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition">Get started</Link>
        ) : null}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary-500 p-8 relative">
        <span className="absolute top-4 right-4 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">Popular</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pro</h2>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          NGN 2,999 <span className="text-base font-normal text-slate-500">/month</span>
        </p>
        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
          <li>Unlimited invoices and receipts</li>
          <li>Remove branding</li>
          <li>Sales and expense tracking</li>
          <li>Profit dashboard and reports</li>
          <li>Customer management</li>
          <li>Inventory tracking</li>
          <li>AI insights and predictions</li>
          <li>Email and WhatsApp notifications</li>
        </ul>
        {currentPlan === 'pro' ? (
          <div>
            <div className="w-full py-3 px-4 text-center border border-primary-500 text-primary-600 rounded-lg font-medium">Current plan</div>
            {subscriptionEnd && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                Renews / expires: {new Date(subscriptionEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            )}
          </div>
        ) : (
          <button onClick={handleUpgrade} disabled={loading} className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">
            {loading ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
        )}
      </motion.div>
    </div>
  );
}
