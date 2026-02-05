import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasCustomerManagement } from '@/lib/plan';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasCustomerManagement((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');

  const { data: customer, error } = await supabase.from('customers').select('*').eq('id', id).eq('user_id', profileId).single();
  if (error || !customer) notFound();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, status, amount_paid, issue_date')
    .or(`customer_id.eq.${id},customer_email.eq.${customer.email}`)
    .eq('user_id', profileId)
    .order('issue_date', { ascending: false });

  const purchaseHistory = invoices ?? [];
  const outstanding = purchaseHistory
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.amount_paid || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/customers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 mb-2 inline-block">← Back to customers</Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
        <p className="text-slate-600 dark:text-slate-400">{customer.email ?? '—'}</p>
        <p className="text-slate-600 dark:text-slate-400">{customer.phone ?? '—'}</p>
        {customer.notes && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Notes: {customer.notes}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Outstanding balance</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">₦{outstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total purchases</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{purchaseHistory.length} invoice(s)</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <h2 className="font-semibold text-slate-900 dark:text-white p-4 border-b border-slate-200 dark:border-slate-700">Purchase history</h2>
        {purchaseHistory.length === 0 ? (
          <p className="p-6 text-slate-500 dark:text-slate-400 text-sm">No invoices yet. Link this customer when creating invoices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">#{inv.invoice_number}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white">₦{Number(inv.total).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : inv.status === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>{inv.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
