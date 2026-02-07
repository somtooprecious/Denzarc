'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SignOutButton } from '@clerk/nextjs';
import { useSession } from '@/components/providers/SessionProvider';

export default function HomePage() {
  const { user, profile, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-pulse text-slate-500">Loading…</div>
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Denzarc logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="text-xl font-bold text-primary-600">Denzarc</span>
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
              >
                Invoices
              </Link>
              <SignOutButton>
                <button type="button" className="text-slate-600 dark:text-slate-300 hover:text-red-600">
                  Sign out
                </button>
              </SignOutButton>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back{profile.full_name ? `, ${profile.full_name}` : ''}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Plan: {profile.plan === 'pro' ? 'Pro' : 'Free'}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Denzarc logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold text-primary-600">Denzarc</span>
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/sign-in"
              className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Small Business Tools
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Create invoices & receipts, track sales & expenses, manage customers & inventory.
            Free and Pro plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              Get started free
            </Link>
            <Link
              href="/sign-in"
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 border border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            >
              View Pricing (Paystack)
            </Link>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { title: '1. Invoice & Receipt Generator', desc: 'Create invoices & receipts, auto-generate numbers, business name & logo, customer details, line items (qty, price, total), tax & discount, payment status (paid/unpaid/partial), PDF download, share via WhatsApp & email.', href: '/sign-up', pro: false },
            { title: '2. Sales Tracker', desc: 'Daily sales entry, cash vs transfer, automatic totals (daily, weekly, monthly).', href: '/sign-up', pro: false },
            { title: '3. Expense Tracker', desc: 'Categorized expenses, monthly summaries.', href: '/sign-up', pro: false },
            { title: '4. Profit Dashboard', desc: 'Total sales, total expenses, net profit, best selling day/product, animated charts.', href: '/sign-up', pro: true },
            { title: '5. Customer Management (CRM Lite)', desc: 'Customer profiles, purchase history, outstanding balances, notes (VIP, frequent buyer).', href: '/sign-up', pro: true },
            { title: '6. Inventory Management', desc: 'Products, stock in/out, low stock alerts (email & WhatsApp).', href: '/sign-up', pro: true },
            { title: '7. Notifications', desc: 'One email (Resend): Invoice sent, payment reminder, low stock alert. One WhatsApp/SMS (Termii): Invoice link, payment reminder, subscription expiry reminder.', href: '/sign-up', pro: true },
            { title: '8. AI Business Intelligence', desc: 'Analyze sales & expenses, profit insights, predict next month sales, highlight best & worst products. E.g. "Expenses +18%", "You sell more on Fridays", "Product A highest margin".', href: '/sign-up', pro: true },
            { title: '9. Subscription & Payments (Paystack)', desc: 'Upgrade to Pro: Initialize Paystack, verify payment, upgrade plan. Subscription start/end, renew/expires display.', href: '/sign-up', pro: true },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-lg transition relative"
            >
              {card.pro && <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Pro</span>}
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 pr-12">{card.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{card.desc}</p>
            </Link>
          ))}
        </motion.section>
      </main>
    </div>
  );
}
