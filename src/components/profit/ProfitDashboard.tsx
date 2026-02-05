'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface SaleRow { amount: number; sale_date: string; description?: string | null }
interface ExpenseRow { amount: number; expense_date: string; category: string }
interface InvoiceRow { items?: { description: string; quantity: number; unit_price: number; total: number }[] }

export function ProfitDashboard({ sales, expenses, invoices = [] }: { sales: SaleRow[]; expenses: ExpenseRow[]; invoices?: InvoiceRow[] }) {
  const totalSales = useMemo(() => sales.reduce((a, s) => a + Number(s.amount), 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((a, s) => a + Number(s.amount), 0), [expenses]);
  const netProfit = totalSales - totalExpenses;

  const byDay = useMemo(() => {
    const map: Record<string, { sales: number; expenses: number; date: string }> = {};
    sales.forEach((s) => {
      const d = s.sale_date;
      if (!map[d]) map[d] = { sales: 0, expenses: 0, date: d };
      map[d].sales += Number(s.amount);
    });
    expenses.forEach((s) => {
      const d = s.expense_date;
      if (!map[d]) map[d] = { sales: 0, expenses: 0, date: d };
      map[d].expenses += Number(s.amount);
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [sales, expenses]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((s) => {
      map[s.category] = (map[s.category] ?? 0) + Number(s.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const bestDay = useMemo(() => {
    if (byDay.length === 0) return null;
    return byDay.reduce((best, d) => (d.sales > best.sales ? d : best), byDay[0]);
  }, [byDay]);

  const bestSellingProduct = useMemo(() => {
    const byProduct: Record<string, { qty: number; total: number }> = {};
    (invoices as InvoiceRow[]).forEach((inv) => {
      (inv.items ?? []).forEach((item) => {
        const name = item.description || 'Unknown';
        if (!byProduct[name]) byProduct[name] = { qty: 0, total: 0 };
        byProduct[name].qty += item.quantity;
        byProduct[name].total += Number(item.total);
      });
    });
    const entries = Object.entries(byProduct).map(([name, data]) => ({ name, ...data }));
    return entries.length > 0 ? entries.reduce((a, b) => (b.total > a.total ? b : a)) : null;
  }, [invoices]);

  const worstSellingProduct = useMemo(() => {
    const byProduct: Record<string, { qty: number; total: number }> = {};
    (invoices as InvoiceRow[]).forEach((inv) => {
      (inv.items ?? []).forEach((item) => {
        const name = item.description || 'Unknown';
        if (!byProduct[name]) byProduct[name] = { qty: 0, total: 0 };
        byProduct[name].qty += item.quantity;
        byProduct[name].total += Number(item.total);
      });
    });
    const entries = Object.entries(byProduct).map(([name, data]) => ({ name, ...data }));
    return entries.length > 1 ? entries.reduce((a, b) => (b.total < a.total ? b : a)) : null;
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total sales</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">₦{totalSales.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">₦{totalExpenses.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Net profit</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₦{netProfit.toLocaleString()}</p>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bestDay && bestDay.sales > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Best selling day (last 30 days)</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {new Date(bestDay.date).toLocaleDateString(undefined, { weekday: 'long' })} · ₦{bestDay.sales.toLocaleString()}
            </p>
          </motion.div>
        )}
        {bestSellingProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Best selling product</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white truncate" title={bestSellingProduct.name}>
              {bestSellingProduct.name} · ₦{bestSellingProduct.total.toLocaleString()}
            </p>
          </motion.div>
        )}
        {worstSellingProduct && bestSellingProduct && worstSellingProduct.name !== bestSellingProduct.name && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Lowest selling product</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white truncate" title={worstSellingProduct.name}>
              {worstSellingProduct.name} · ₦{worstSellingProduct.total.toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>

      {byDay.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Sales vs expenses (last 30 days)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, '']} labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Sales" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {byCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Expenses by category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
                <Tooltip formatter={(v: number) => [`₦${v.toLocaleString()}`, '']} />
                <Bar dataKey="value" name="Amount" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {byDay.length === 0 && byCategory.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400 text-center py-12">Add sales and expenses to see your profit dashboard.</p>
      )}
    </div>
  );
}
