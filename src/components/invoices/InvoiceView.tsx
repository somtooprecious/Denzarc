'use client';

import { motion } from 'framer-motion';

interface InvoiceViewProps {
  invoice: {
    invoice_number: string;
    type: string;
    status: string;
    business_name: string | null;
    business_address: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    issue_date: string;
    due_date: string | null;
    items: { description: string; quantity: number; unit_price: number; total: number }[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_type: string | null;
    discount_value: number;
    total: number;
    amount_paid: number;
    notes: string | null;
  };
  hideBranding?: boolean;
}

export function InvoiceView({ invoice, hideBranding = false }: InvoiceViewProps) {
  const typeLabel = invoice.type === 'receipt' ? 'Receipt' : 'Invoice';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 print:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {invoice.business_name || 'Business'}
          </h2>
          {invoice.business_address ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line">
              {invoice.business_address}
            </p>
          ) : null}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {typeLabel} #{invoice.invoice_number}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.status}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Issue: {new Date(invoice.issue_date).toLocaleDateString()}
            {invoice.due_date ? ` · Due: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bill to</h3>
        <p className="text-slate-900 dark:text-white">{invoice.customer_name || '—'}</p>
        {invoice.customer_email ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.customer_email}</p>
        ) : null}
        {invoice.customer_phone ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.customer_phone}</p>
        ) : null}
        {invoice.customer_address ? (
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
            {invoice.customer_address}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto -mx-6 sm:-mx-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-300">Description</th>
              <th className="text-right py-3 px-4 sm:px-6 w-20 font-medium text-slate-700 dark:text-slate-300">Qty</th>
              <th className="text-right py-3 px-4 sm:px-6 w-28 font-medium text-slate-700 dark:text-slate-300">Unit price</th>
              <th className="text-right py-3 px-4 sm:px-6 w-28 font-medium text-slate-700 dark:text-slate-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-3 px-4 sm:px-6 text-slate-900 dark:text-white">{item.description}</td>
                <td className="py-3 px-4 sm:px-6 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                <td className="py-3 px-4 sm:px-6 text-right text-slate-600 dark:text-slate-400">
                  ₦{Number(item.unit_price).toLocaleString()}
                </td>
                <td className="py-3 px-4 sm:px-6 text-right font-medium text-slate-900 dark:text-white">
                  ₦{Number(item.total).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
            <span className="text-slate-900 dark:text-white">₦{Number(invoice.subtotal).toLocaleString()}</span>
          </div>
          {invoice.tax_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Tax ({invoice.tax_rate}%)</span>
              <span className="text-slate-900 dark:text-white">₦{Number(invoice.tax_amount).toLocaleString()}</span>
            </div>
          )}
          {invoice.discount_value > 0 && (() => {
            const afterTax = Number(invoice.subtotal) + Number(invoice.tax_amount);
            const discountAmount = invoice.discount_type === 'percent'
              ? (afterTax * Number(invoice.discount_value)) / 100
              : Number(invoice.discount_value);
            return (
              <div key="discount" className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Discount{invoice.discount_type === 'percent' ? ` (${invoice.discount_value}%)` : ''}
                </span>
                <span className="text-slate-900 dark:text-white">-₦{discountAmount.toLocaleString()}</span>
              </div>
            );
          })()}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>Total</span>
            <span>₦{Number(invoice.total).toLocaleString()}</span>
          </div>
          {(invoice.amount_paid ?? 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Amount paid</span>
              <span className="text-slate-900 dark:text-white">₦{Number(invoice.amount_paid).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {invoice.notes ? (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{invoice.notes}</p>
        </div>
      ) : null}

      {!hideBranding ? (
        <p className="mt-8 pt-4 text-center text-xs text-slate-400 dark:text-slate-500 print:text-slate-400">
          Generated by Businesstool · Small Business Tools
        </p>
      ) : null}
    </motion.div>
  );
}
