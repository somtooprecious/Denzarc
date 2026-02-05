import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { canRemoveBranding } from '@/lib/plan';
import { InvoiceView } from '@/components/invoices/InvoiceView';
import { InvoiceActions } from '@/components/invoices/InvoiceActions';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', profileId)
    .single();

  if (error || !invoice) notFound();

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  const hideBranding = canRemoveBranding((profile?.plan as 'free' | 'pro') ?? 'free');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <Link href="/invoices" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 mb-2 inline-block">
            Back to invoices
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            #{invoice.invoice_number} · {invoice.type === 'receipt' ? 'Receipt' : 'Invoice'}
          </h1>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>
      <div id="invoice-print" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <InvoiceView invoice={invoice} hideBranding={hideBranding} />
      </div>
    </div>
  );
}
