'use client';

import { motion } from 'framer-motion';

interface DashboardStatsProps {
  invoices: { id: string; total: number; status: string }[];
  totalSales?: number;
  totalExpenses?: number;
  netProfit?: number;
  isPro: boolean;
}

export function DashboardStats({
  invoices,
  totalSales = 0,
  totalExpenses = 0,
  netProfit = 0,
  isPro,
}: DashboardStatsProps) {
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const paid = invoices.filter((i) => i.status === 'paid').length;

  const cards = [
    { label: 'Invoices', value: invoices.length, sub: `${paid} paid` },
    { label: 'Total invoiced', value: `₦${totalInvoiced.toLocaleString()}`, sub: '' },
  ];
  if (isPro) {
    cards.push(
      { label: 'Total sales', value: `₦${totalSales.toLocaleString()}`, sub: '' },
      { label: 'Total expenses', value: `₦${totalExpenses.toLocaleString()}`, sub: '' },
      { label: 'Net profit', value: `₦${netProfit.toLocaleString()}`, sub: '' }
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {typeof card.value === 'number' ? card.value : card.value}
          </p>
          {card.sub && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.sub}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
