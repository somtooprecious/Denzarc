'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  description?: string | null;
}

interface Customer {
  id: string;
  name: string;
}

interface SaleRow {
  id: string;
  sale_date: string;
  amount: number;
  payment_type: string;
  description: string | null;
  product_id: string | null;
  customer_name: string | null;
  quantity: number | null;
  unit_price: number | null;
  created_at: string;
}

const today = new Date().toISOString().slice(0, 10);

export function SalesTracker({ initialSales }: { initialSales: SaleRow[] }) {
  const [sales, setSales] = useState<SaleRow[]>(initialSales);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  // Row state for the sale form: product + customer + quantity + description per row
  const [rows, setRows] = useState<{ product: Product; customerName: string; quantity: string; description: string }[]>([]);

  useEffect(() => {
    Promise.all([fetch('/api/products').then((r) => (r.ok ? r.json() : [])), fetch('/api/customers').then((r) => (r.ok ? r.json() : []))])
      .then(([prods, custs]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setCustomers(Array.isArray(custs) ? custs : []);
      })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const addProductToTable = (product: Product) => {
    setRows((prev) => [...prev, { product, customerName: '', quantity: '1', description: '' }]);
    setSearchQuery('');
  };

  const updateRow = (index: number, field: 'customerName' | 'quantity' | 'description', value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = useMemo(() => rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0), [rows]);
  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0) * Number(r.product.unit_price || 0), 0),
    [rows]
  );

  async function handleRecordSale() {
    const toRecord = rows.filter((r) => (parseFloat(r.quantity) || 0) > 0);
    if (toRecord.length === 0) {
      toast.error('Add at least one product and set quantity');
      return;
    }
    setRecording(true);
    try {
      for (const row of toRecord) {
        const qty = parseFloat(row.quantity) || 0;
        if (qty <= 0) continue;
        const res = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sale_date: today,
            amount: qty * Number(row.product.unit_price || 0),
            payment_type: 'cash',
            description: row.description.trim() || null,
            product_id: row.product.id,
            customer_name: row.customerName.trim() || null,
            quantity: qty,
            unit_price: Number(row.product.unit_price || 0),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to record sale');
        setSales((prev) => [{ ...data, sale_date: today, amount: qty * Number(row.product.unit_price || 0), payment_type: 'cash', description: row.description.trim() || null, product_id: row.product.id, customer_name: row.customerName.trim() || null, quantity: qty, unit_price: row.product.unit_price }, ...prev]);
      }
      setRows([]);
      toast.success('Sale(s) recorded');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to record sale');
    } finally {
      setRecording(false);
    }
  }

  const byDay = sales.reduce<Record<string, number>>((acc, s) => {
    const d = s.sale_date;
    acc[d] = (acc[d] ?? 0) + Number(s.amount);
    return acc;
  }, {});
  const todayTotal = byDay[today] ?? 0;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekTotal = sales.filter((s) => new Date(s.sale_date) >= weekStart).reduce((a, s) => a + Number(s.amount), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthTotal = sales.filter((s) => new Date(s.sale_date) >= monthStart).reduce((a, s) => a + Number(s.amount), 0);

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
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">New sale</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search products</label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type product name to search…"
            className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          {filteredProducts.length > 0 && (
            <ul className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-w-md bg-white dark:bg-slate-900">
              {filteredProducts.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addProductToTable(p)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white flex justify-between"
                  >
                    <span>{p.name}</span>
                    <span className="text-slate-500">₦{Number(p.unit_price).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Customer</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Unit price</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Description / note</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const qty = parseFloat(row.quantity) || 0;
                    const lineTotal = qty * Number(row.product.unit_price || 0);
                    return (
                      <tr key={index} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="py-2 px-4 font-medium text-slate-900 dark:text-white">{row.product.name}</td>
                        <td className="py-2 px-4">
                          <input
                            list={`customers-${index}`}
                            type="text"
                            value={row.customerName}
                            onChange={(e) => updateRow(index, 'customerName', e.target.value)}
                            placeholder="Customer name"
                            className="w-full min-w-[120px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          />
                          <datalist id={`customers-${index}`}>
                            {customers.map((c) => (
                              <option key={c.id} value={c.name} />
                            ))}
                          </datalist>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={row.quantity}
                            onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right text-sm"
                          />
                        </td>
                        <td className="py-2 px-4 text-right text-slate-600 dark:text-slate-400">₦{Number(row.product.unit_price).toLocaleString()}</td>
                        <td className="py-2 px-4 text-right font-medium text-slate-900 dark:text-white">₦{lineTotal.toLocaleString()}</td>
                        <td className="py-2 px-4 text-slate-600 dark:text-slate-400">{new Date(today).toLocaleDateString()}</td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => updateRow(index, 'description', e.target.value)}
                            placeholder="Note"
                            className="w-full min-w-[100px] px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <button type="button" onClick={() => removeRow(index)} className="text-red-600 hover:underline text-xs">
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total quantity: <strong>{totalQuantity}</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total amount: <strong className="text-slate-900 dark:text-white">₦{totalAmount.toLocaleString()}</strong>
              </p>
              <button
                type="button"
                onClick={handleRecordSale}
                disabled={recording}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {recording ? 'Recording…' : 'Record sale'}
              </button>
            </div>
          </>
        )}

        {rows.length === 0 && products.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Add products (Pro) to sell from the Products page. Then search above.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <h2 className="font-semibold text-slate-900 dark:text-white p-4 border-b border-slate-200 dark:border-slate-700">Recent sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Product / Customer</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sales.slice(0, 50).map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{new Date(s.sale_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {[s.customer_name || null, s.product_id ? (products.find((p) => p.id === s.product_id)?.name ?? 'Product') : null].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">{s.quantity != null ? s.quantity : '—'}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 dark:text-white">₦{Number(s.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{s.description || '—'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {sales.length === 0 && <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">No sales yet. Search for a product above and record a sale.</p>}
      </div>
    </div>
  );
}
