import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Denzarc for support, billing, and technical questions. We respond within 24–48 hours.',
  openGraph: {
    title: 'Contact Denzarc | Support & Inquiries',
    description:
      'Contact Denzarc for customer support, account and billing questions, and technical assistance.',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Professional Support for Your Business
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            We are committed to providing reliable support to help you manage invoices, track business
            performance, and maximize the value of our platform.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If you have questions regarding your account, billing, subscriptions, AI insights, or technical
            functionality, our team is ready to assist.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Customer Support</h2>
          <p className="text-slate-600 dark:text-slate-400">
            For general inquiries, technical assistance, or feature-related questions, please contact us
            via email or through the support form in your dashboard.
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>
              Support Email:{' '}
              <a
                href="mailto:somtooprecious1@gmail.com"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                somtooprecious1@gmail.com
              </a>
            </li>
            <li>Standard Response Time: 24–48 business hours</li>
            <li>Priority Support (Pro Plan): 12–24 business hours</li>
            <li>Business Hours: Monday – Friday | 9:00 AM – 5:00 PM (WAT)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Billing &amp; Subscription Assistance</h2>
          <p className="text-slate-600 dark:text-slate-400">For matters relating to:</p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>Pro plan upgrades</li>
            <li>Subscription renewals</li>
            <li>Payment confirmations</li>
            <li>Billing inquiries</li>
            <li>Refund requests</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            Please include your registered email address and plan type to help us resolve your request
            efficiently.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Partnerships &amp; Business Inquiries</h2>
          <p className="text-slate-600 dark:text-slate-400">
            <a
              href="mailto:somtooprecious1@gmail.com"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              somtooprecious1@gmail.com
            </a>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Data Security &amp; Confidentiality</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Protecting your business data is our priority. All communications and account information are
            handled with strict confidentiality and secured using industry-standard protection measures.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            We do not sell or share customer data with third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-slate-600 dark:text-slate-400">
            You may find quick answers in our Help Center regarding:
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5">
            <li>Creating and downloading invoices</li>
            <li>Managing sales and expenses</li>
            <li>Understanding AI profit insights</li>
            <li>Upgrading to Pro</li>
            <li>Managing notifications</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Build with Confidence</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Our mission is to empower small businesses with simple, powerful tools that support growth and
            financial clarity.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Start using the platform today or upgrade to Pro for advanced features and priority support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/sign-up"
              className="px-5 py-3 rounded-lg bg-primary-600 text-white font-medium text-center hover:bg-primary-700 transition"
            >
              Get Started Free
            </a>
            <a
              href="/pricing"
              className="px-5 py-3 rounded-lg border border-primary-500 text-primary-600 dark:text-primary-400 text-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            >
              Upgrade to Pro
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
