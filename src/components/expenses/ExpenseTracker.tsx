'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ExpenseRow {
  id: string;
  expense_date: string;
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
}

const CATEGORIES = ['Supplies', 'Rent', 'Utilities', 'Marketing', 'Payroll', 'Transport', 'Other'];

export function ExpenseTracker({ initialExpenses }: { initialExpenses: ExpenseRow[] }) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const monthStart = new Date();
  monthStart.setDate(1);
  const thisMonth = expenses.filter((s) => new Date(s.expense_date) >= monthStart);
  const monthTotal = thisMonth.reduce((a, s) => a + Number(s.amount), 0);
  const byCategory = thisMonth.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + Number(s.amount);
    return acc;
  }, {});

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense_date: date,
          amount: amt,
          category,
          description: description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add expense');
      setExpenses((prev) => [{ ...data, amount: amt, category, description: description || null, expense_date: date }, ...prev]);
      setAmount('');
      setDescription('');
      toast.success('Expense added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">₦{monthTotal.toLocaleString()}</p>
      </motion.div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Add expense</h2>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Office supplies" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">
            {loading ? 'Adding…' : 'Add expense'}
          </button>
        </form>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">This month by category</h2>
          <div className="space-y-2">
            {Object.entries(byCategory).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{cat}</span>
                <span className="font-medium text-slate-900 dark:text-white">₦{amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <h2 className="font-semibold text-slate-900 dark:text-white p-4 border-b border-slate-200 dark:border-slate-700">Recent expenses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {expenses.slice(0, 50).map((s) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{new Date(s.expense_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">₦{Number(s.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.category}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.description || '—'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {expenses.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No expenses yet. Add one above.</p>}
      </div>
    </div>
  );
}
