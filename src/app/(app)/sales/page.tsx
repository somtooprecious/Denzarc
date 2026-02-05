import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { SalesTracker } from '@/components/sales/SalesTracker';

export default async function SalesPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('user_id', profileId)
    .order('sale_date', { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales tracker</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Record daily sales (cash vs transfer). Totals update automatically.
      </p>
      <SalesTracker initialSales={sales ?? []} />
    </div>
  );
}
