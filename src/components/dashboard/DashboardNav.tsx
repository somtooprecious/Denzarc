'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/providers/SessionProvider';
import {
  hasProfitDashboard,
  hasCustomerManagement,
  hasInventory,
  hasAIInsights,
} from '@/lib/plan';

const allLinks = [
  { href: '/dashboard', label: 'Dashboard', pro: false },
  { href: '/invoices', label: 'Invoices', pro: false },
  { href: '/sales', label: 'Sales', pro: false },
  { href: '/expenses', label: 'Expenses', pro: false },
  { href: '/profit', label: 'Profit', pro: true },
  { href: '/customers', label: 'Customers', pro: true },
  { href: '/inventory', label: 'Inventory', pro: true },
  { href: '/notifications', label: 'Notifications', pro: true },
  { href: '/ai-insights', label: 'AI Insights', pro: true },
  { href: '/support', label: 'Support', pro: false },
  { href: '/settings', label: 'Settings', pro: false },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { profile } = useSession();
  const plan = profile?.plan;
  const isPro = plan === 'pro';

  return (
    <nav className="flex flex-wrap gap-2">
      {allLinks.map(({ href, label, pro }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
              isActive
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {label}
            {pro && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-normal">Pro</span>}
          </Link>
        );
      })}
      <Link
        href="/pricing"
        className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
      >
        Pricing
      </Link>
    </nav>
  );
}
