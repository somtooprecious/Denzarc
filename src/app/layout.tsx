import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers/Providers';
import { SmartsuppWidget } from '@/components/SmartsuppWidget';
import './globals.css';

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://denzarc.com').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Denzarc | Small Business Tools – Invoices, Sales & Profit Tracking',
    template: '%s | Denzarc',
  },
  description:
    'Create invoices & receipts, track sales & expenses, manage customers & inventory. Free and Pro plans. Built for small business owners.',
  keywords: [
    'invoice generator',
    'small business tools',
    'sales tracker',
    'expense tracker',
    'profit tracking',
    'customer management',
    'inventory management',
    'receipt generator',
    'business dashboard',
  ],
  authors: [{ name: 'Denzarc', url: baseUrl }],
  creator: 'Denzarc',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Denzarc',
    title: 'Denzarc | Small Business Tools – Invoices, Sales & Profit Tracking',
    description:
      'Create invoices & receipts, track sales & expenses, manage customers & inventory. Free and Pro plans.',
    images: [
      {
        url: '/denzarc%20logo.png',
        width: 512,
        height: 512,
        alt: 'Denzarc – Small Business Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Denzarc | Small Business Tools – Invoices, Sales & Profit Tracking',
    description:
      'Create invoices & receipts, track sales & expenses, manage customers & inventory. Free and Pro plans.',
  },
  icons: {
    icon: [
      { url: '/denzarc%20logo.png', type: 'image/png' },
    ],
    shortcut: ['/denzarc%20logo.png'],
    apple: [{ url: '/denzarc%20logo.png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: baseUrl },
  verification: {
    // Add when you have them: google: 'google-site-verification-code', yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Denzarc',
        url: baseUrl,
        logo: `${baseUrl}/denzarc%20logo.png`,
        description:
          'Small business tools: invoices, sales & expense tracking, customer and inventory management, AI insights.',
      },
      {
        '@type': 'WebSite',
        name: 'Denzarc',
        url: baseUrl,
        publisher: { '@id': `${baseUrl}#organization` },
        description:
          'Create invoices & receipts, track sales & expenses, manage customers & inventory. Free and Pro plans.',
      },
    ],
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased min-h-screen">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Providers>
            {children}
            <a
              href="/support"
              className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-primary-700 transition"
              aria-label="Open customer support page"
            >
              Support
            </a>
            <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600 dark:text-slate-400">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                      Denzarc
                    </div>
                    <p className="text-sm">
                      Invoices, sales, expenses, customers, inventory, and profit tracking in one place.
                      Built to help small businesses get paid faster and stay organized.
                    </p>
                    <p className="text-xs">© {new Date().getFullYear()} Denzarc. All rights reserved.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Product</div>
                    <ul className="space-y-2 text-sm">
                      <li>Invoices & receipts</li>
                      <li>Sales & expenses</li>
                      <li>Customers & inventory</li>
                      <li>AI insights & notifications</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Business</div>
                    <ul className="space-y-2 text-sm">
                      <li>Pricing</li>
                      <li>
                        <a href="/support" className="hover:text-primary-600 dark:hover:text-primary-400 transition">
                          Support
                        </a>
                      </li>
                      <li>Security & privacy</li>
                      <li>Terms of service</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Follow us</div>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://www.instagram.com/con_fidenc07"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary-900/30 transition"
                        aria-label="Instagram"
                        title="Instagram"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.tiktok.com/@intlc1"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary-900/30 transition"
                        aria-label="TikTok"
                        title="TikTok"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M16.6 5.82c.7.84 1.65 1.4 2.71 1.55v2.37c-1.17.04-2.3-.25-3.27-.85v6.05a5.5 5.5 0 1 1-4.7-5.46v2.54a3 3 0 1 0 2.2 2.9V3.5h2.46c.1.82.4 1.6.9 2.32z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.youtube.com/@Somtoo%20Precious"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary-900/30 transition"
                        aria-label="YouTube"
                        title="YouTube"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.9 12 4.9 12 4.9s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9 28.3 28.3 0 0 0 0 9.6 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9 28.3 28.3 0 0 0 0-9.6zM10.5 15.5v-7l6 3.5-6 3.5z" />
                        </svg>
                      </a>
                      <a
                        href="https://wa.me/23409137117732"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary-900/30 transition"
                        aria-label="WhatsApp"
                        title="WhatsApp"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M20.5 3.5A10 10 0 0 0 3.2 17.7L2 22l4.4-1.2A10 10 0 1 0 20.5 3.5zm-8.6 16.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.6.7.7-2.5-.2-.3a8.1 8.1 0 1 1 6.5 3.4zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.1.2-.6.8-.8 1-.1.2-.2.2-.4.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1-1.3-1.1-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3.1-.1 0-.3 0-.4-.1-.1-.5-1.2-.7-1.6-.2-.4-.3-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.7-.8 1.7s.8 2 1 2.3c.1.2 1.6 2.4 3.9 3.4.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2z" />
                        </svg>
                      </a>
                      <a
                        href="https://x.com/somtoo38353"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary-900/30 transition"
                        aria-label="X (Twitter)"
                        title="X (Twitter)"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="currentColor"
                        >
                          <path d="M18.9 3H22l-7.2 8.2L23 21h-6.4l-5-6.4L5.9 21H3l7.7-8.8L1 3h6.5l4.6 6.1L18.9 3zm-1.1 16h1.9L7.2 5H5.2l12.6 14z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-xs">Built with care for small business owners.</p>
                  </div>
                </div>
              </div>
            </footer>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <SmartsuppWidget />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
