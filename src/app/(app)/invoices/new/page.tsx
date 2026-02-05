import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { canCreateInvoice, FREE_INVOICE_LIMIT, hasCustomerManagement } from '@/lib/plan';

export default async function NewInvoicePage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single();
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  const count = Number(profile?.invoice_count_this_month ?? 0);
  const allowed = canCreateInvoice(plan, count);

  const customers = hasCustomerManagement(plan)
    ? (await supabase.from('customers').select('id, name, email, phone, address').eq('user_id', profileId).order('name')).data ?? []
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/invoices"
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 mb-2 inline-block"
        >
          ← Back to invoices
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          New invoice / receipt
        </h1>
        {!allowed && (
          <p className="mt-2 text-amber-600 dark:text-amber-400 text-sm">
            Free plan limit: {FREE_INVOICE_LIMIT} invoices per month. You&apos;ve used {count}.
            <Link href="/pricing" className="ml-1 underline">Upgrade to Pro</Link> for unlimited.
          </p>
        )}
      </div>
      {allowed ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <InvoiceForm profile={profile} customers={customers} />
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200">
            You&apos;ve reached your free invoice limit. Upgrade to Pro to create more.
          </p>
          <Link
            href="/pricing"
            className="inline-flex mt-4 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
