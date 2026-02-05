import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasCustomerManagement } from '@/lib/plan';
import { CustomerList } from '@/components/customers/CustomerList';

export default async function CustomersPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasCustomerManagement((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');
  const { data: customers } = await supabase.from('customers').select('*').eq('user_id', profileId).order('name');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
      <p className="text-slate-600 dark:text-slate-400">Manage customers. Pro only.</p>
      <CustomerList customers={customers ?? []} />
    </div>
  );
}
