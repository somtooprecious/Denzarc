import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Denzarc Privacy Policy: how we collect, use, and protect your data when you use our invoicing, sales, expense, and business management tools.',
  openGraph: {
    title: 'Privacy Policy | Denzarc',
    description:
      'Learn how Denzarc collects, uses, and protects your business and personal data.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-400">
          Denzarc (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Denzarc platform and website. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our services, including
          our invoicing, sales tracking, expense management, customer and inventory tools, AI insights, and related
          features (collectively, the &quot;Service&quot;). Please read this policy carefully. By using Denzarc, you agree to the
          practices described below.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We collect information that you provide directly (e.g. when you sign up, create invoices, add customers or
            products, or contact support) and information we obtain automatically (e.g. device and usage data when you
            use our website or app). This may include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>Account and profile data (email, name, business name, address, phone, logo)</li>
            <li>Business data you enter (invoices, sales, expenses, customers, inventory, products)</li>
            <li>Payment and subscription information (e.g. for Pro plan upgrades via our payment provider)</li>
            <li>Log and usage data (IP address, browser type, pages visited, features used)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We use the information we collect to provide, maintain, and improve the Service; to process payments and
            subscriptions; to send you important notices (e.g. subscription reminders, low-stock alerts); to respond to
            support requests; to enforce our terms and policies; and to comply with applicable law. We do not sell your
            personal information to third parties for marketing purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Data Security</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We implement appropriate technical and organisational measures to protect your data against unauthorised
            access, alteration, disclosure, or destruction. Your data is stored and processed using industry-standard
            infrastructure and access is restricted to those who need it to operate the Service. Payment processing
            is handled by trusted third-party providers and we do not store your full payment card details on our
            servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Data Sharing and Third Parties</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may share your information with service providers that help us run the Service (e.g. hosting, analytics,
            authentication, payment processing, email delivery). These providers are contractually required to protect
            your data and use it only for the purposes we specify. We may also disclose information where required by
            law or to protect our rights, users, or the public.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Your Rights and Choices</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Depending on your location, you may have rights to access, correct, delete, or export your personal data, or
            to object to or restrict certain processing. You can update much of your profile and business information
            in your account settings. For other requests or questions about your data, contact us via our{' '}
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Contact
            </Link>{' '}
            or Support page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Retention and Deletion</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We retain your information for as long as your account is active or as needed to provide the Service and
            fulfil the purposes described in this policy. You may request deletion of your account and associated
            data; we will process such requests in accordance with our Terms of Service and applicable law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Changes to This Policy</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the
            updated policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Denzarc after
            such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">8. Contact Us</h2>
          <p className="text-slate-600 dark:text-slate-400">
            If you have questions about this Privacy Policy or our data practices, please contact us through our{' '}
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Contact
            </Link>{' '}
            page or{' '}
            <Link href="/support" className="text-primary-600 dark:text-primary-400 hover:underline">
              Support
            </Link>
            .
          </p>
        </section>

        <p className="text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          © {new Date().getFullYear()} Denzarc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
