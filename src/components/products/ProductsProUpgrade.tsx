import Link from 'next/link';

export function ProductsProUpgrade() {
  return (
    <div className="rounded-2xl border border-primary-200 dark:border-primary-800 bg-white dark:bg-slate-800 p-8 max-w-xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product catalog is a Pro feature</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Upgrade to post products with photos, prices, and a shareable catalog link for your customers.
      </p>
      <Link
        href="/pricing"
        className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
      >
        View Pro plans
      </Link>
    </div>
  );
}
