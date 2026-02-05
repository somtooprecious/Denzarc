import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasAIInsights } from '@/lib/plan';
import { AIInsightsView } from '@/components/ai/AIInsightsView';

export default async function AIInsightsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasAIInsights((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');
  const [{ data: sales }, { data: expenses }, { data: invoices }] = await Promise.all([
    supabase.from('sales').select('amount, sale_date').eq('user_id', profileId),
    supabase.from('expenses').select('amount, expense_date, category').eq('user_id', profileId),
    supabase.from('invoices').select('items').eq('user_id', profileId),
  ]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Business Intelligence</h1>
      <p className="text-slate-600 dark:text-slate-400">Analyze sales & expenses, profit insights, next month prediction, best/worst products. Pro only.</p>
      <AIInsightsView sales={sales ?? []} expenses={expenses ?? []} invoices={invoices ?? []} />
    </div>
  );
}
