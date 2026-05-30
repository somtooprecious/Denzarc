import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfile, getSupabaseProfileId } from '@/lib/auth';
import { ensureCatalogSlug } from '@/lib/catalog';
import { hasProducts } from '@/lib/plan';
import { getAppUrl } from '@/lib/url';
import { ProductCatalogManager } from '@/components/products/ProductCatalogManager';
import { ProductsProUpgrade } from '@/components/products/ProductsProUpgrade';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');

  const profile = await getSupabaseProfile();
  if (!profile) redirect('/sign-in');

  const plan = (profile.plan as 'free' | 'pro') ?? 'free';

  if (!hasProducts(plan)) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product catalog</h1>
        <ProductsProUpgrade />
      </div>
    );
  }

  const supabase = createAdminClient();

  let catalogSlug = profile.catalog_slug ?? null;
  if (!catalogSlug) {
    catalogSlug = await ensureCatalogSlug(profileId, profile.business_name, profile.email);
  }

  const { data: products, error: productsError } = await supabase
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
      {productsError && (
        <p className="text-sm text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          Could not load products: {productsError.message}
        </p>
      )}
      <ProductCatalogManager
        products={(products ?? []) as Product[]}
        catalogUrl={catalogUrl}
      />
    </div>
  );
}
