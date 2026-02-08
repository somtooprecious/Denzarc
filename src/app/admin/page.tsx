import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';

function formatMoney(amount: number) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

export default async function AdminPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  if (!isAdminUser(userId)) redirect('/');

  const supabase = createAdminClient();

  const [
    { data: users },
    { data: payments },
    { data: invoices },
    { data: sales },
    { data: expenses },
  ] = await Promise.all([
    supabase.from('users').select('id, email, plan, subscription_start, subscription_end'),
    supabase
      .from('payments')
      .select('id, user_id, amount, reference, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
    supabase.from('sales').select('id', { count: 'exact', head: true }),
    supabase.from('expenses').select('id', { count: 'exact', head: true }),
  ]);

  const userCount = users?.length ?? 0;
  const paymentCount = payments?.length ?? 0;
  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Overview of users, payments, and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Users</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{userCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Revenue (payments)</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Invoices</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{invoices?.count ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Sales / Expenses</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {sales?.count ?? 0} / {expenses?.count ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            Recent Payments
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                  <th className="py-2 px-4">Reference</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700/60">
                    <td className="py-2 px-4">{p.reference ?? '—'}</td>
                    <td className="py-2 px-4">{formatMoney(p.amount)}</td>
                    <td className="py-2 px-4">{p.status ?? '—'}</td>
                    <td className="py-2 px-4">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {paymentCount === 0 && (
                  <tr>
                    <td className="py-4 px-4 text-slate-500" colSpan={4}>
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            Users
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Plan</th>
                  <th className="py-2 px-4">Subscription end</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).slice(0, 10).map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 dark:border-slate-700/60">
                    <td className="py-2 px-4">{u.email ?? '—'}</td>
                    <td className="py-2 px-4">{u.plan ?? '—'}</td>
                    <td className="py-2 px-4">
                      {u.subscription_end ? new Date(u.subscription_end).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {userCount === 0 && (
                  <tr>
                    <td className="py-4 px-4 text-slate-500" colSpan={3}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
