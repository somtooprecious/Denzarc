import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasInventory } from '@/lib/plan';
import { InventoryList } from '@/components/inventory/InventoryList';

export default async function InventoryPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasInventory((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');
  const { data: products } = await supabase.from('products').select('*').eq('user_id', profileId).order('name');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
      <p className="text-slate-600 dark:text-slate-400">Products and stock. Pro only.</p>
      <InventoryList products={products ?? []} />
    </div>
  );
}
