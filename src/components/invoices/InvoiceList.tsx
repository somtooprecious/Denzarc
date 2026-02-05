'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  type: string;
  status: string;
  total: number;
  issue_date: string;
  customer_name: string | null;
}

export function InvoiceList({ invoices }: { invoices: InvoiceRow[] }) {
  if (invoices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
      >
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          No invoices or receipts yet.
        </p>
        <Link
          href="/invoices/new"
          className="inline-flex px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
        >
          Create your first invoice
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Number
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Type
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Customer
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Date
              </th>
              <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Total
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                Status
              </th>
              <th className="sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {invoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      #{inv.invoice_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">
                    {inv.type}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {inv.customer_name || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(inv.issue_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">
                    ₦{Number(inv.total).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'paid'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : inv.status === 'partial'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-primary-600 dark:text-primary-400 hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
