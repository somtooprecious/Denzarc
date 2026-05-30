import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { ensureCatalogSlug } from '@/lib/catalog';
import { hasProducts } from '@/lib/plan';
import { getAppUrl } from '@/lib/url';
import { ProductCatalogManager } from '@/components/products/ProductCatalogManager';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, business_name, email, catalog_slug')
    .eq('id', profileId)
    .single();

  if (!hasProducts((profile?.plan as 'free' | 'pro') ?? 'free')) redirect('/pricing');

  const catalogSlug =
    profile?.catalog_slug ??
    (await ensureCatalogSlug(profileId, profile?.business_name ?? null, profile?.email ?? ''));

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  const appUrl = getAppUrl();
  const catalogUrl = catalogSlug ? `${appUrl}/catalog/${catalogSlug}` : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product catalog</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Post your available products with photos, prices, and descriptions. Share your public catalog link with customers.
          </p>
        </div>
        <Link
          href="/settings"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 shrink-0"
        >
          Edit business profile →
        </Link>
      </div>
      <ProductCatalogManager
        products={(products ?? []) as Product[]}
        catalogUrl={catalogUrl}
      />
    </div>
  );
}
