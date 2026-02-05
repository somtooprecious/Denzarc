'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Sale { amount: number; sale_date: string }
interface Expense { amount: number; expense_date: string; category: string }
interface Invoice { items?: { description: string; quantity: number; total: number }[] }

export function AIInsightsView({ sales, expenses, invoices = [] }: { sales: Sale[]; expenses: Expense[]; invoices?: Invoice[] }) {
  const [insights, setInsights] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setInsights(null);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales, expenses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch insights');
      setInsights(Array.isArray(data.insights) ? data.insights : [data.insights ?? 'No insights generated.']);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI insights failed');
    } finally {
      setLoading(false);
    }
  }

  const hasData = sales.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Generate insights</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          AI analyzes sales & expenses, generates profit insights, predicts next month sales, and highlights best & worst products. Example: &quot;Your expenses increased by 18% this week&quot;, &quot;You sell more on Fridays&quot;, &quot;Product A has the highest profit margin&quot;.
        </p>
        <button
          onClick={handleFetch}
          disabled={loading || !hasData}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {loading ? 'Generating…' : 'Get AI insights'}
        </button>
        {!hasData && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Add sales and expenses first.</p>}
      </motion.div>
      {insights && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Insights</h2>
          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            {insights.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary-500">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
