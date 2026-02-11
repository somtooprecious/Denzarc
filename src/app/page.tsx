'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { SignOutButton } from '@clerk/nextjs';
import { useSession } from '@/components/providers/SessionProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  const { user, profile, loading } = useSession();
  const heroPhrases = useMemo(
    () => ['Small Business Tools', 'Run Your Business With Ease', 'Know Your Profit, Every Day'],
    []
  );
  const [heroIndex, setHeroIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const adminId = process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID;
  const isAdmin = Boolean(user?.id && adminId && user.id === adminId);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 3500);
    return () => clearInterval(id);
  }, [heroPhrases.length]);

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
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/denzarc%20logo.png"
                alt="Denzarc logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="text-xl font-bold text-primary-600">Denzarc</span>
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((open) => !open)}
              className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              aria-expanded={navOpen}
              aria-label="Toggle navigation"
            >
              <span className="text-lg">{navOpen ? '×' : '☰'}</span>
            </button>
            <nav className="hidden sm:flex gap-4">
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
              <Link
                href="/about"
                className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
              >
                Contact
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
                >
                  Admin
                </Link>
              )}
              <ThemeToggle className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition" />
              <SignOutButton>
                <button type="button" className="text-slate-600 dark:text-slate-300 hover:text-red-600">
                  Sign out
                </button>
              </SignOutButton>
            </nav>
            </div>
            <AnimatePresence>
              {navOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sm:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
                  onClick={() => setNavOpen(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {navOpen && (
                <motion.nav
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="sm:hidden absolute left-0 right-0 mt-3 z-50 mx-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-4"
                >
                  <div className="flex flex-col gap-3">
                    <Link href="/dashboard" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                      Dashboard
                    </Link>
                    <Link href="/invoices" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                      Invoices
                    </Link>
                    <Link href="/about" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                      About
                    </Link>
                    <Link href="/contact" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                      Contact
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                        Admin
                      </Link>
                    )}
                    <ThemeToggle className="text-left text-slate-700 dark:text-slate-200" />
                    <SignOutButton>
                      <button type="button" onClick={() => setNavOpen(false)} className="text-left text-red-600">
                        Sign out
                      </button>
                    </SignOutButton>
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
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
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-10"
        >
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8">
            <div className="text-left">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                  How to create an invoice
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-5">
                  Follow these quick steps inside Denzarc to create, download, and send a professional invoice.
                </p>
                <ol className="space-y-3 text-slate-700 dark:text-slate-300 list-decimal pl-5">
                  <li>Go to the Invoices page and click Create Invoice.</li>
                  <li>Add your business details and customer information.</li>
                  <li>Add items (qty, price) and apply tax or discount if needed.</li>
                  <li>Review the total and set the payment status.</li>
                  <li>Save, then download the PDF or share by email or WhatsApp.</li>
                </ol>
            </div>
          </div>
        </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/denzarc%20logo.png"
              alt="Denzarc logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-xl font-bold text-primary-600">Denzarc</span>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen((open) => !open)}
            className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            aria-expanded={navOpen}
            aria-label="Toggle navigation"
          >
            <span className="text-lg">{navOpen ? '×' : '☰'}</span>
          </button>
          <nav className="hidden sm:flex gap-4">
            <Link
              href="/about"
              className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 dark:text-slate-300 hover:text-primary-600"
            >
              Contact
            </Link>
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
          <AnimatePresence>
            {navOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
                onClick={() => setNavOpen(false)}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {navOpen && (
              <motion.nav
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="sm:hidden absolute left-0 right-0 mt-3 z-50 mx-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-4"
              >
                <div className="flex flex-col gap-3">
                  <Link href="/about" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                    About
                  </Link>
                  <Link href="/contact" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                    Contact
                  </Link>
                  <Link href="/sign-in" onClick={() => setNavOpen(false)} className="text-slate-700 dark:text-slate-200">
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setNavOpen(false)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center"
                  >
                    Sign up
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
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
            <span className="inline-flex min-h-[3.5rem] sm:min-h-[4rem]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroPhrases[heroIndex]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="inline-block"
                >
                  {heroPhrases[heroIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
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
              View Pricing
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

        <section className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Quick answers about invoices, tracking, and how Denzarc works.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                q: 'What is the difference between an invoice and a receipt?',
                a: 'An invoice requests payment for goods or services, while a receipt confirms payment was received.',
              },
              {
                q: 'Can I customize my invoice with my business details?',
                a: 'Yes. You can add your business name, address, logo, customer details, and line items before sending.',
              },
              {
                q: 'Can I download and share invoices as PDF?',
                a: 'Yes. Generate a PDF and share it by email or WhatsApp directly from your dashboard.',
              },
              {
                q: 'How do I track sales and expenses?',
                a: 'Use the Sales and Expense tools to record entries and view automatic summaries.',
              },
              {
                q: 'What features are included in the Pro plan?',
                a: 'Pro unlocks unlimited invoices, advanced reports, customer and inventory tools, and automation features.',
              },
              {
                q: 'Is my data secure?',
                a: 'We use secure infrastructure and best practices to protect your account and business data.',
              },
              {
                q: 'Can I manage customers and inventory?',
                a: 'Yes. Create customer profiles, track purchase history, and manage product stock levels.',
              },
              {
                q: 'How can I get support?',
                a: 'Use the Contact page or email us anytime and our team will respond as quickly as possible.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
              >
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
