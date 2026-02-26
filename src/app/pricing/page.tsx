import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabaseProfile } from '@/lib/auth';
import { PricingCards } from '@/components/pricing/PricingCards';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Denzarc pricing: start free with invoices, sales & expense tracking. Upgrade to Pro for unlimited invoices, CRM, inventory, AI insights, and more.',
  openGraph: {
    title: 'Pricing | Denzarc Small Business Tools',
    description:
      'Free and Pro plans. Upgrade for unlimited invoices, customer & inventory management, AI insights, and notifications.',
  },
};

export default async function PricingPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const profile = await getSupabaseProfile();
  const user = profile !== null;
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  const subscriptionEnd = profile?.subscription_end ?? null;
  const err = typeof searchParams?.error === 'string' ? searchParams.error : Array.isArray(searchParams?.error) ? searchParams.error[0] : '';
  const isCurrencyMismatch = err === 'currency_mismatch';
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={user ? '/dashboard' : '/'} className="text-xl font-bold text-primary-600">Denzarc</Link>
          <nav className="flex gap-4">
            {user ? <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-primary-600">Dashboard</Link> : <Link href="/sign-in" className="text-slate-600 dark:text-slate-400 hover:text-primary-600">Sign in</Link>}
            <Link href="/sign-up" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Sign up</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-16">
        {isCurrencyMismatch && user && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
            Your payment may have succeeded. Go to your{' '}
            <Link href="/dashboard" className="font-medium underline">Dashboard</Link>
            {' '}and click &quot;Paid but still Free? Sync subscription&quot; to activate Pro—no need to pay again.
          </div>
        )}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">Pricing</h1>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-12">Free to start. Upgrade to Pro for unlimited invoices and more.</p>
        <PricingCards currentPlan={plan} isLoggedIn={!!user} subscriptionEnd={subscriptionEnd} />
      </main>
    </div>
  );
}
