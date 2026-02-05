import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { ExpenseTracker } from '@/components/expenses/ExpenseTracker';

export default async function ExpensesPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: expenses } = await supabase.from('expenses').select('*').eq('user_id', profileId).order('expense_date', { ascending: false }).limit(200);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expense tracker</h1>
      <p className="text-slate-600 dark:text-slate-400">Categorized expenses with monthly summaries.</p>
      <ExpenseTracker initialExpenses={expenses ?? []} />
    </div>
  );
}
