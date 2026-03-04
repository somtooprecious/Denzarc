import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasProducts } from '@/lib/plan';
import { ProductsManager } from '@/components/products/ProductsManager';

export default async function ProductsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasProducts((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');
  const { data: products } = await supabase
    .from('products')
    .select('id, user_id, name, description, sku, quantity, unit_price, low_stock_threshold, created_at, updated_at')
    .eq('user_id', profileId)
    .order('name');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
      <p className="text-slate-600 dark:text-slate-400">Add products, set prices, and edit them anytime. Pro feature.</p>
      <ProductsManager products={products ?? []} />
    </div>
  );
}
