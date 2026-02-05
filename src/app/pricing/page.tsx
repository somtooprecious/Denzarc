import Link from 'next/link';
import { getSupabaseProfile } from '@/lib/auth';
import { PricingCards } from '@/components/pricing/PricingCards';

export default async function PricingPage() {
  const profile = await getSupabaseProfile();
  const user = profile !== null;
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  const subscriptionEnd = profile?.subscription_end ?? null;
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">Pricing</h1>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-12">Free to start. Upgrade to Pro for unlimited invoices and more.</p>
        <PricingCards currentPlan={plan} isLoggedIn={!!user} subscriptionEnd={subscriptionEnd} />
      </main>
    </div>
  );
}
