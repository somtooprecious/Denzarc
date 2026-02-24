import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Denzarc Terms of Service: rules and agreement for using our invoicing, sales, expense, and business management platform.',
  openGraph: {
    title: 'Terms of Service | Denzarc',
    description:
      'Terms and conditions for using the Denzarc small business tools platform.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-400">
          Welcome to Denzarc. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Denzarc website,
          platform, and related services (the &quot;Service&quot;), including invoicing, sales and expense tracking, customer
          and inventory management, AI insights, notifications, and any Pro or paid features. By creating an account or
          using the Service, you agree to these Terms. If you do not agree, do not use the Service.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Eligibility and Account</h2>
          <p className="text-slate-600 dark:text-slate-400">
            You must be at least 18 years old and able to form a binding contract to use the Service. You are
            responsible for maintaining the confidentiality of your account credentials and for all activity under your
            account. You must provide accurate and complete information when registering and keep it up to date. You
            must notify us promptly of any unauthorised use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Use of the Service</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We grant you a limited, non-exclusive, non-transferable licence to use the Service for your own business or
            personal use in accordance with these Terms and our published policies. You agree not to: (a) use the
            Service for any illegal or unauthorised purpose; (b) attempt to gain unauthorised access to our systems or
            other users&apos; accounts or data; (c) interfere with or disrupt the Service or its security; (d) scrape,
            copy, or resell the Service or its content except as permitted (e.g. your own invoices and data); (e)
            use the Service in a way that could harm, disable, or overburden our infrastructure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Your Data and Content</h2>
          <p className="text-slate-600 dark:text-slate-400">
            You retain ownership of the data and content you upload or create using the Service (e.g. invoices,
            customer lists, product data). You grant us the rights necessary to operate the Service, such as storing,
            processing, and displaying your data, and to send notifications (e.g. subscription reminders, low-stock
            alerts). Our use of your data is further described in our{' '}
            <Link href="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </Link>
            . You are responsible for ensuring that your content does not infringe any third-party rights or violate
            any law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Subscriptions and Payment</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Some features are available only on a paid &quot;Pro&quot; subscription. Fees, billing cycles, and payment methods
            are described on our Pricing page. By subscribing, you agree to pay all applicable fees. Fees are generally
            charged in advance (e.g. monthly). Refunds are handled according to our{' '}
            <Link href="/refund-policy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Refund Policy
            </Link>
            . We may change fees or plans with reasonable notice; continued use after changes constitutes acceptance.
            You may cancel your subscription in accordance with our cancellation process; access to Pro features
            continues until the end of the current billing period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Disclaimers</h2>
          <p className="text-slate-600 dark:text-slate-400">
            The Service is provided &quot;as is&quot; and &quot;as available&quot;. We do not warrant that the Service will be
            uninterrupted, error-free, or secure. We disclaim all warranties to the fullest extent permitted by law.
            Our AI insights and automated features are for assistance only and do not constitute legal, tax, or
            financial advice. You are responsible for your business decisions and for verifying the accuracy of any
            data or reports you rely on.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Limitation of Liability</h2>
          <p className="text-slate-600 dark:text-slate-400">
            To the maximum extent permitted by law, Denzarc and its affiliates, officers, and employees shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits,
            data, or business opportunity, arising from your use of or inability to use the Service. Our total
            liability for any claims arising from or related to the Service shall not exceed the amount you paid us in
            the twelve (12) months preceding the claim (or, if no payment, zero).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Termination</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may suspend or terminate your access to the Service at any time for breach of these Terms, fraud, or
            other conduct we deem harmful. You may stop using the Service at any time. Upon termination, your right
            to use the Service ceases immediately. Provisions that by their nature should survive (e.g. disclaimers,
            limitation of liability, dispute resolution) will survive termination.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">8. Changes to the Terms</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may modify these Terms from time to time. We will notify you of material changes by posting the updated
            Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after such
            changes constitutes acceptance of the new Terms. If you do not agree, you must stop using the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">9. General</h2>
          <p className="text-slate-600 dark:text-slate-400">
            These Terms constitute the entire agreement between you and Denzarc regarding the Service. If any provision
            is found unenforceable, the remaining provisions remain in effect. Our failure to enforce any right does
            not waive that right. These Terms are governed by the laws of the jurisdiction in which we operate, without
            regard to conflict-of-law principles.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">10. Contact</h2>
          <p className="text-slate-600 dark:text-slate-400">
            For questions about these Terms, please contact us via our{' '}
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Contact
            </Link>{' '}
            or{' '}
            <Link href="/support" className="text-primary-600 dark:text-primary-400 hover:underline">
              Support
            </Link>{' '}
            page.
          </p>
        </section>

        <p className="text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          © {new Date().getFullYear()} Denzarc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
