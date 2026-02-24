import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Denzarc Refund Policy: how we handle refunds for Pro plan subscriptions and payments.',
  openGraph: {
    title: 'Refund Policy | Denzarc',
    description:
      'Refund and cancellation policy for Denzarc Pro subscriptions.',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Refund Policy</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-400">
          Denzarc (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) wants you to be satisfied with your Pro subscription. This Refund
          Policy explains under what circumstances we may issue refunds for payments made for Denzarc Pro plan
          subscriptions and how to request one.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Pro Plan Subscriptions</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Denzarc offers a free tier and a paid &quot;Pro&quot; plan. When you upgrade to Pro, you are charged the fee
            applicable at the time of purchase (e.g. a one-month subscription). Payment is processed through our
            designated payment provider (e.g. Paystack). Your subscription grants you access to Pro features (such as
            Profit dashboard, Customers, Inventory, Notifications, and AI Insights) for the subscription period you
            paid for.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Eligibility for Refunds</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may offer a refund in the following situations, at our discretion:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>
              <strong>Duplicate or erroneous charge:</strong> You were charged in error (e.g. duplicate transaction)
              or the amount charged was incorrect.
            </li>
            <li>
              <strong>Service failure:</strong> You were unable to access Pro features for a significant part of your
              paid period due to a fault on our side (e.g. prolonged outage or a critical bug we failed to fix
              promptly).
            </li>
            <li>
              <strong>Request within a short window:</strong> You contact us within a limited period after the charge
              (e.g. within 7 days) and explain a genuine reason (e.g. accidental purchase, misunderstanding of the
              product). We will consider each request on its merits.
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            We are not obliged to issue a refund merely because you changed your mind, stopped using the Service, or
            did not use Pro features after subscribing, unless we have stated otherwise in a specific offer or
            promotion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. How to Request a Refund</h2>
          <p className="text-slate-600 dark:text-slate-400">
            To request a refund, contact us via our{' '}
            <Link href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Contact
            </Link>{' '}
            page or{' '}
            <Link href="/support" className="text-primary-600 dark:text-primary-400 hover:underline">
              Support
            </Link>
            . Please include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
            <li>The email address associated with your Denzarc account</li>
            <li>The date and amount of the payment (and payment reference if you have it)</li>
            <li>A clear explanation of why you are requesting a refund</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            We will review your request and respond within a reasonable time (typically within 5–10 business days).
            If we approve a refund, it will be processed using the same payment method used for the original
            transaction, subject to our payment provider&apos;s rules. Refunds may take additional time to appear on your
            statement depending on your bank or card issuer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Cancellation and No Future Charges</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Cancelling your Pro subscription (or not renewing) means you will not be charged for the next billing
            period. You will continue to have access to Pro features until the end of the period you have already paid
            for. Cancellation alone does not entitle you to a refund for the current period; refunds are handled
            according to the eligibility criteria above.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Changes to This Policy</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We may update this Refund Policy from time to time. The &quot;Last updated&quot; date at the top of this page
            will be revised when we make changes. Your use of the Service after such changes constitutes acceptance of
            the updated policy. For payments made before a change, the policy in effect at the time of payment may
            apply to any refund request.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Contact Us</h2>
          <p className="text-slate-600 dark:text-slate-400">
            For refund requests or questions about this policy, please use our{' '}
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
