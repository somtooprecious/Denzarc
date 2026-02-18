import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

export default async function NotificationsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan, email, phone, subscription_end').eq('id', profileId).single();
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  if (plan !== 'pro') redirect('/pricing');

  const [{ data: products }, { data: invoices }] = await Promise.all([
    supabase.from('products').select('name, quantity, low_stock_threshold').eq('user_id', profileId),
    supabase.from('invoices').select('id, invoice_number, total, customer_phone').eq('user_id', profileId).in('status', ['unpaid', 'partial']),
  ]);

  const lowStock = (products ?? []).filter((p) => p.quantity <= p.low_stock_threshold);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Email notifications: Invoice sent, payment reminder, low stock alert. One WhatsApp/SMS service (Termii): Invoice link, payment reminder, subscription expiry reminder.
      </p>
      <NotificationsPanel
        lowStockProducts={lowStock}
        unpaidInvoices={invoices ?? []}
        userEmail={profile?.email ?? null}
        userPhone={(profile as { phone?: string | null })?.phone ?? null}
        subscriptionEnd={(profile as { subscription_end?: string | null })?.subscription_end ?? null}
        plan={plan}
      />
    </div>
  );
}
