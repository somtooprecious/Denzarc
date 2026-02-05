'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface SaleRow {
  id: string;
  sale_date: string;
  amount: number;
  payment_type: 'cash' | 'transfer' | 'other';
  description: string | null;
  created_at: string;
}

export function SalesTracker({ initialSales }: { initialSales: SaleRow[] }) {
  const [sales, setSales] = useState<SaleRow[]>(initialSales);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'transfer' | 'other'>('cash');
  const [description, setDescription] = useState('');

  const byDay = sales.reduce<Record<string, number>>((acc, s) => {
    const d = s.sale_date;
    acc[d] = (acc[d] ?? 0) + Number(s.amount);
    return acc;
  }, {});
  const todayTotal = byDay[date] ?? 0;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekTotal = sales.filter((s) => new Date(s.sale_date) >= weekStart).reduce((a, s) => a + Number(s.amount), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthTotal = sales.filter((s) => new Date(s.sale_date) >= monthStart).reduce((a, s) => a + Number(s.amount), 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_date: date,
          amount: amt,
          payment_type: paymentType,
          description: description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add sale');
      setSales((prev) => [{ ...data, amount: amt, payment_type: paymentType, description: description || null, sale_date: date }, ...prev]);
      setAmount('');
      setDescription('');
      toast.success('Sale added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add sale');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">₦{todayTotal.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Last 7 days</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">₦{weekTotal.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">₦{monthTotal.toLocaleString()}</p>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Add sale</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₦)</label>
            <input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-32" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as 'cash' | 'transfer' | 'other')} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Product sales" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">
            {loading ? 'Adding…' : 'Add sale'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <h2 className="font-semibold text-slate-900 dark:text-white p-4 border-b border-slate-200 dark:border-slate-700">Recent sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sales.slice(0, 50).map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{new Date(s.sale_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">₦{Number(s.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">{s.payment_type}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.description || '—'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {sales.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No sales yet. Add one above.</p>}
      </div>
    </div>
  );
}
