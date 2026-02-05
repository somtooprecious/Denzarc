import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { InvoiceList } from '@/components/invoices/InvoiceList';

export default async function InvoicesPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, type, status, total, issue_date, customer_name')
    .eq('user_id', profileId)
    .order('issue_date', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Invoices & receipts
        </h1>
        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
        >
          New invoice / receipt
        </Link>
      </div>
      <InvoiceList invoices={invoices ?? []} />
    </div>
  );
}
