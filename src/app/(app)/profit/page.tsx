import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProfitDashboard } from '@/lib/plan';
import { ProfitDashboard } from '@/components/profit/ProfitDashboard';

export default async function ProfitPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  if (!hasProfitDashboard(plan)) {
    redirect('/pricing');
  }

  const [{ data: sales }, { data: expenses }, { data: invoices }] = await Promise.all([
    supabase.from('sales').select('amount, sale_date, description').eq('user_id', profileId),
    supabase.from('expenses').select('amount, expense_date, category').eq('user_id', profileId),
    supabase.from('invoices').select('items').eq('user_id', profileId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profit dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400">Total sales, expenses, net profit, best day, best product, and charts.</p>
      <ProfitDashboard sales={sales ?? []} expenses={expenses ?? []} invoices={invoices ?? []} />
    </div>
  );
}
