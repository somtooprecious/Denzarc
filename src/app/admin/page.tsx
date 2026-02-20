import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';
import { AdminSmsSection } from '@/components/admin/AdminSmsSection';

function formatMoney(amount: number) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

type SearchParams = { [key: string]: string | string[] | undefined };

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toDateInput(value: string | undefined) {
  if (!value) return '';
  return value;
}

function daysUntil(date: string | null | undefined) {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((target.getTime() - now.getTime()) / msPerDay);
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!isAdminUser(userId)) redirect('/');

  const supabase = createAdminClient();

  const usersQuery = firstParam(searchParams.users_q)?.trim() ?? '';
  const usersPlan = firstParam(searchParams.users_plan) ?? '';
  const paymentsStatus = firstParam(searchParams.payments_status) ?? '';
  const paymentsFrom = firstParam(searchParams.payments_from) ?? '';
  const paymentsTo = firstParam(searchParams.payments_to) ?? '';
  const invoicesStatus = firstParam(searchParams.invoices_status) ?? '';
  const invoicesFrom = firstParam(searchParams.invoices_from) ?? '';
  const invoicesTo = firstParam(searchParams.invoices_to) ?? '';

  let usersReq = supabase.from('users').select('id, email, plan, subscription_start, subscription_end');
  if (usersQuery) usersReq = usersReq.ilike('email', `%${usersQuery}%`);
  if (usersPlan) usersReq = usersReq.eq('plan', usersPlan);

  const proExpiringReq = supabase
    .from('users')
    .select('id, email, plan, subscription_start, subscription_end')
    .eq('plan', 'pro')
    .not('subscription_end', 'is', null)
    .order('subscription_end', { ascending: true })
    .limit(25);

  const newProReq = supabase
    .from('users')
    .select('id, email, plan, subscription_start, subscription_end')
    .eq('plan', 'pro')
    .not('subscription_start', 'is', null)
    .order('subscription_start', { ascending: false })
    .limit(25);

  let paymentsReq = supabase
    .from('payments')
    .select('id, user_id, amount, reference, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(25);
  if (paymentsStatus) paymentsReq = paymentsReq.eq('status', paymentsStatus);
  if (paymentsFrom) paymentsReq = paymentsReq.gte('created_at', paymentsFrom);
  if (paymentsTo) paymentsReq = paymentsReq.lte('created_at', paymentsTo);

  let invoicesReq = supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, status, total, issue_date', { count: 'exact' })
    .order('issue_date', { ascending: false })
    .limit(25);
  if (invoicesStatus) invoicesReq = invoicesReq.eq('status', invoicesStatus);
  if (invoicesFrom) invoicesReq = invoicesReq.gte('issue_date', invoicesFrom);
  if (invoicesTo) invoicesReq = invoicesReq.lte('issue_date', invoicesTo);

  const profilesForSmsReq = supabase
    .from('profiles')
    .select('id, email, phone, full_name, plan, subscription_end, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const productsReq = supabase
    .from('products')
    .select('id, user_id, name, quantity, low_stock_threshold')
    .not('low_stock_threshold', 'is', null)
    .limit(1000);

  const [
    { data: users },
    { data: payments, count: paymentsCount },
    { data: invoices, count: invoicesCount },
    { count: salesCount },
    { count: expensesCount },
    { count: customersCount },
    { count: productsCount },
    { count: stockMovementsCount },
    { data: proExpiringUsers },
    { data: newProUsers },
    { data: profilesForSms },
    { data: products },
  ] = await Promise.all([
    usersReq,
    paymentsReq,
    invoicesReq,
    supabase.from('sales').select('id', { count: 'exact', head: true }),
    supabase.from('expenses').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('stock_movements').select('id', { count: 'exact', head: true }),
    proExpiringReq,
    newProReq,
    profilesForSmsReq,
    productsReq,
  ]);

  const lowStockProducts = (products ?? []).filter((p) => {
    const qty = Number(p.quantity ?? 0);
    const threshold = Number(p.low_stock_threshold ?? 0);
    return threshold > 0 && qty <= threshold;
  });
  const lowStockUserIds = Array.from(new Set(lowStockProducts.map((p) => String(p.user_id))));
  const { data: lowStockProfiles } =
    lowStockUserIds.length > 0
      ? await supabase.from('profiles').select('id, email, full_name').in('id', lowStockUserIds)
      : { data: [] as { id: string; email: string | null; full_name: string | null }[] };
  const profileById = new Map((lowStockProfiles ?? []).map((r) => [r.id, r]));

  const userCount = users?.length ?? 0;
  const paymentCount = paymentsCount ?? 0;
  const totalRevenue = (payments ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const expiringSoon = (proExpiringUsers ?? []).filter((u) => {
    const days = daysUntil(u.subscription_end);
    return days !== null && days >= 0 && days <= 7;
  });
  const justSubscribed = (newProUsers ?? []).filter((u) => {
    if (!u.subscription_start) return false;
    const start = new Date(u.subscription_start).getTime();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return start >= dayAgo;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Overview of users, payments, and activity.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          Admin access is restricted to your Clerk user id via ADMIN_CLERK_USER_ID.
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
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{invoicesCount ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Sales / Expenses</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {salesCount ?? 0} / {expensesCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Customers</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{customersCount ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Products / Stock</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            {productsCount ?? 0} / {stockMovementsCount ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Users with low stock</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{lowStockUserIds.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            Pro Subscription Watch
          </div>
          <div className="p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">New Pro (last 24h)</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{justSubscribed.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Expiring in 7 days</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{expiringSoon.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use this section to follow up with Pro users before expiry.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Ends</th>
                    <th className="py-2 px-3">Days left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.slice(0, 10).map((u) => (
                    <tr key={u.id} className="border-t border-slate-100 dark:border-slate-700/60">
                      <td className="py-2 px-3">{u.email ?? '—'}</td>
                      <td className="py-2 px-3">{u.subscription_end ? new Date(u.subscription_end).toLocaleDateString() : '—'}</td>
                      <td className="py-2 px-3">{daysUntil(u.subscription_end) ?? '—'}</td>
                    </tr>
                  ))}
                  {expiringSoon.length === 0 && (
                    <tr>
                      <td className="py-3 px-3 text-slate-500" colSpan={3}>
                        No Pro subscriptions expiring in the next 7 days.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AdminSmsSection
          profiles={(profilesForSms ?? []).map((p) => ({
            id: String(p.id),
            email: p.email != null ? String(p.email) : null,
            phone: p.phone != null ? String(p.phone) : null,
            full_name: p.full_name != null ? String(p.full_name) : null,
            plan: p.plan != null ? String(p.plan) : null,
            subscription_end: p.subscription_end != null ? String(p.subscription_end) : null,
            created_at: p.created_at != null ? String(p.created_at) : null,
          }))}
        />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            Low stock across users
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Users who have at least one product with quantity ≤ their low-stock threshold. These users receive email and SMS alerts from the daily cron.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                    <th className="py-2 px-3">User (email)</th>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Low-stock threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => {
                    const profile = profileById.get(String(p.user_id));
                    return (
                      <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700/60">
                        <td className="py-2 px-3">{profile?.email ?? profile?.full_name ?? p.user_id}</td>
                        <td className="py-2 px-3">{p.name ?? '—'}</td>
                        <td className="py-2 px-3">{Number(p.quantity ?? 0)}</td>
                        <td className="py-2 px-3">{Number(p.low_stock_threshold ?? 0)}</td>
                      </tr>
                    );
                  })}
                  {lowStockProducts.length === 0 && (
                    <tr>
                      <td className="py-3 px-3 text-slate-500" colSpan={4}>
                        No low-stock products across any user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
            Payments
          </div>
          <form className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 grid gap-2 sm:grid-cols-4">
            <input
              name="payments_from"
              type="date"
              defaultValue={toDateInput(paymentsFrom)}
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <input
              name="payments_to"
              type="date"
              defaultValue={toDateInput(paymentsTo)}
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <select
              name="payments_status"
              defaultValue={paymentsStatus}
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-sm rounded bg-primary-600 text-white"
              >
                Filter
              </button>
              <a
                className="flex-1 px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-center"
                href={`/api/admin/export?type=payments&status=${paymentsStatus}&from=${paymentsFrom}&to=${paymentsTo}`}
              >
                Export CSV
              </a>
            </div>
          </form>
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
          <form className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 grid gap-2 sm:grid-cols-3">
            <input
              name="users_q"
              placeholder="Search email"
              defaultValue={usersQuery}
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            />
            <select
              name="users_plan"
              defaultValue={usersPlan}
              className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 text-sm rounded bg-primary-600 text-white"
              >
                Filter
              </button>
              <a
                className="flex-1 px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-center"
                href={`/api/admin/export?type=users&q=${encodeURIComponent(usersQuery)}&plan=${usersPlan}`}
              >
                Export CSV
              </a>
            </div>
          </form>
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

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white">
          Invoices
        </div>
        <form className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 grid gap-2 sm:grid-cols-4">
          <input
            name="invoices_from"
            type="date"
            defaultValue={toDateInput(invoicesFrom)}
            className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <input
            name="invoices_to"
            type="date"
            defaultValue={toDateInput(invoicesTo)}
            className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          />
          <select
            name="invoices_status"
            defaultValue={invoicesStatus}
            className="px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          >
            <option value="">All statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-3 py-2 text-sm rounded bg-primary-600 text-white">
              Filter
            </button>
            <a
              className="flex-1 px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 text-center"
              href={`/api/admin/export?type=invoices&status=${invoicesStatus}&from=${invoicesFrom}&to=${invoicesTo}`}
            >
              Export CSV
            </a>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-left">
                <th className="py-2 px-4">Invoice</th>
                <th className="py-2 px-4">Customer</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Issue date</th>
              </tr>
            </thead>
            <tbody>
              {(invoices ?? []).map((inv) => (
                <tr key={inv.id} className="border-t border-slate-100 dark:border-slate-700/60">
                  <td className="py-2 px-4">#{inv.invoice_number}</td>
                  <td className="py-2 px-4">{inv.customer_name ?? '—'}</td>
                  <td className="py-2 px-4">{inv.status ?? '—'}</td>
                  <td className="py-2 px-4">{formatMoney(inv.total)}</td>
                  <td className="py-2 px-4">
                    {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {(invoices ?? []).length === 0 && (
                <tr>
                  <td className="py-4 px-4 text-slate-500" colSpan={5}>
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
