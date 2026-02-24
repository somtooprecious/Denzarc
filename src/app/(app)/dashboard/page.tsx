import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProfitDashboard, isPro } from '@/lib/plan';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UpgradeSuccessRefresh } from '@/components/dashboard/UpgradeSuccessRefresh';
import { SyncSubscriptionButton } from '@/components/dashboard/SyncSubscriptionButton';

export default async function DashboardPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, subscription_end')
    .eq('id', profileId)
    .single();

  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  const subscriptionEnd = (profile as { subscription_end?: string | null })?.subscription_end;
  const showProfit = hasProfitDashboard(plan);

  const [{ data: invoices }, { data: sales }, { data: expenses }] = await Promise.all([
    supabase.from('invoices').select('id, invoice_number, total, status, issue_date').eq('user_id', profileId).order('issue_date', { ascending: false }).limit(50),
    showProfit ? supabase.from('sales').select('amount, sale_date').eq('user_id', profileId) : { data: null },
    showProfit ? supabase.from('expenses').select('amount, expense_date').eq('user_id', profileId) : { data: null },
  ]);

  const totalSales = (sales ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = (expenses ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const netProfit = totalSales - totalExpenses;

  return (
    <div className="space-y-8">
      <UpgradeSuccessRefresh searchParams={searchParams ?? null} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Plan: {plan === 'pro' ? 'Pro' : 'Free'}
          {plan === 'pro' && subscriptionEnd && (
            <> · Renews: {new Date(subscriptionEnd).toLocaleDateString()} · <Link href="/notifications" className="text-primary-600 hover:underline">Subscription reminder</Link></>
          )}
          {!isPro(plan) && (
            <>
              {' '}
              · <Link href="/pricing" className="text-primary-600 hover:underline">Upgrade to Pro</Link>
              {' · '}
              <SyncSubscriptionButton />
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set Pro in Supabase? Edit the <strong>profiles</strong> row with ID <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{profileId}</code> (or where <code>clerk_user_id</code> matches your account), then refresh this page.
              </span>
            </>
          )}
        </p>
      </div>

      <DashboardStats
        invoices={invoices ?? []}
        totalSales={showProfit ? totalSales : undefined}
        totalExpenses={showProfit ? totalExpenses : undefined}
        netProfit={showProfit ? netProfit : undefined}
        isPro={isPro(plan)}
      />

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
            Quick actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/invoices/new"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
            >
              New invoice
            </Link>
            <Link
              href="/sales"
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Add sale
            </Link>
            <Link
              href="/expenses"
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Add expense
            </Link>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
            Recent invoices
          </h2>
          {invoices && invoices.length > 0 ? (
            <ul className="space-y-2">
              {(invoices as { id: string; invoice_number: string; total: number; status: string }[]).slice(0, 5).map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:underline">
                    #{inv.invoice_number}
                  </Link>
                  <span className="text-slate-600 dark:text-slate-400">
                    {Number(inv.total).toLocaleString()} · {inv.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No invoices yet.{' '}
              <Link href="/invoices/new" className="text-primary-600 hover:underline">
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
