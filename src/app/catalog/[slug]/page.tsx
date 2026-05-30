import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAppUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';

type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  quantity: number;
  image_url: string | null;
  sku: string | null;
};

async function loadCatalog(slug: string) {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, business_name, business_logo_url, business_address, phone, catalog_slug')
    .eq('catalog_slug', slug.trim().toLowerCase())
    .maybeSingle();

  if (!profile) return null;

  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, category, unit_price, quantity, image_url, sku')
    .eq('user_id', profile.id)
    .eq('is_listed', true)
    .order('name');

  return {
    business: {
      name: profile.business_name ?? 'Shop',
      logoUrl: profile.business_logo_url,
      address: profile.business_address,
      phone: profile.phone,
    },
    products: (products ?? []) as CatalogProduct[],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await loadCatalog(slug);
  if (!catalog) return { title: 'Catalog not found' };
  return {
    title: `${catalog.business.name} — Product Catalog`,
    description: `Browse available products from ${catalog.business.name}.`,
  };
}

export default async function PublicCatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await loadCatalog(slug);
  if (!catalog) notFound();

  const { business, products } = catalog;
  const appUrl = getAppUrl();
  const whatsapp = business.phone
    ? `https://wa.me/${business.phone.replace(/\D/g, '').replace(/^0/, '234')}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-xl object-contain border border-slate-200 dark:border-slate-700"
                unoptimized
              />
            ) : (
              <div className="h-[72px] w-[72px] rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600">
                  {(business.name[0] ?? 'S').toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Product catalog
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
                {business.name}
              </h1>
              {business.address && (
                <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl">{business.address}</p>
              )}
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex mt-4 items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                >
                  Contact on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        {products.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">No products listed at the moment. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              {products.length} product{products.length === 1 ? '' : 's'} available
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {p.image_url ? (
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <span className="text-5xl font-bold text-slate-400 dark:text-slate-600">
                        {p.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {p.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                        {p.category}
                      </span>
                    )}
                    <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{p.name}</h2>
                    {p.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₦{Number(p.unit_price).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          p.quantity > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.quantity > 0 ? 'Available' : 'Out of stock'}
                      </span>
                    </div>
                    {whatsapp && p.quantity > 0 && (
                      <a
                        href={`${whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${p.name}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 block w-full text-center py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Inquire
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
        <Link href={appUrl} className="hover:text-primary-600 transition">
          Powered by Denzarc
        </Link>
      </footer>
    </div>
  );
}
