'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  low_stock_threshold: number;
}

function ProductRow({ product: p, onUpdate }: { product: Product; onUpdate: (p: Product) => void }) {
  const [stockQty, setStockQty] = useState('');
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [stockNote, setStockNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [editingRow, setEditingRow] = useState(false);
  const [editName, setEditName] = useState(p.name);
  const [editSku, setEditSku] = useState(p.sku ?? '');
  const [editQuantity, setEditQuantity] = useState(p.quantity);
  const [editUnitPrice, setEditUnitPrice] = useState(p.unit_price);
  const [editLowStock, setEditLowStock] = useState(p.low_stock_threshold);
  const [savingRow, setSavingRow] = useState(false);

  async function handleStock(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(stockQty, 10);
    if (!qty || qty <= 0) { toast.error('Enter valid quantity'); return; }
    if (stockType === 'out' && qty > p.quantity) { toast.error('Insufficient stock'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: p.id, type: stockType, quantity: qty, notes: stockNote.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onUpdate(data);
      setStockQty('');
      setStockNote('');
      setShowStock(false);
      toast.success(`Stock ${stockType === 'in' ? 'added' : 'removed'}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    setEditName(p.name);
    setEditSku(p.sku ?? '');
    setEditQuantity(p.quantity);
    setEditUnitPrice(p.unit_price);
    setEditLowStock(p.low_stock_threshold);
    setEditingRow(true);
  }

  async function saveRow() {
    if (!editName.trim()) { toast.error('Name required'); return; }
    setSavingRow(true);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          sku: editSku.trim() || null,
          quantity: editQuantity,
          unit_price: editUnitPrice,
          low_stock_threshold: editLowStock,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      onUpdate(data);
      setEditingRow(false);
      toast.success('Saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSavingRow(false);
    }
  }

  const inputClass = 'w-full max-w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white';

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700/50">
      <td className="py-3 px-4">
        {editingRow ? (
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="Name" />
        ) : (
          <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
        )}
      </td>
      <td className="py-3 px-4">
        {editingRow ? (
          <input type="text" value={editSku} onChange={(e) => setEditSku(e.target.value)} className={inputClass} placeholder="SKU" />
        ) : (
          <span className="text-slate-600 dark:text-slate-400">{p.sku ?? '—'}</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {editingRow ? (
          <input type="number" min={0} value={editQuantity} onChange={(e) => setEditQuantity(parseInt(e.target.value, 10) || 0)} className={inputClass} />
        ) : (
          <span className="text-slate-900 dark:text-white">{p.quantity}</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {editingRow ? (
          <input type="number" min={0} step={0.01} value={editUnitPrice} onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)} className={inputClass} />
        ) : (
          <span className="text-slate-600 dark:text-slate-400">₦{Number(p.unit_price).toLocaleString()}</span>
        )}
      </td>
      <td className="py-3 px-4">
        {editingRow ? (
          <input type="number" min={0} value={editLowStock} onChange={(e) => setEditLowStock(parseInt(e.target.value, 10) || 0)} className={`${inputClass} w-16`} title="Low stock alert at" />
        ) : p.quantity <= p.low_stock_threshold ? (
          <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Low stock</span>
        ) : (
          <span className="text-slate-500 text-xs">OK</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap items-center gap-2">
          {editingRow ? (
            <>
              <button type="button" onClick={saveRow} disabled={savingRow} className="text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
                {savingRow ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingRow(false)} className="text-xs text-slate-500 hover:underline">Cancel</button>
            </>
          ) : (
            <>
              {showStock ? (
                <form onSubmit={handleStock} className="flex flex-wrap items-center gap-1">
                  <select value={stockType} onChange={(e) => setStockType(e.target.value as 'in' | 'out')} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    <option value="in">In</option>
                    <option value="out">Out</option>
                  </select>
                  <input type="number" min={1} value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="Qty" className="w-14 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                  <input type="text" value={stockNote} onChange={(e) => setStockNote(e.target.value)} placeholder="Note (optional)" className="w-24 min-w-0 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" title="Note for this movement" />
                  <button type="submit" disabled={loading} className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">Go</button>
                  <button type="button" onClick={() => setShowStock(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs">✕</button>
                </form>
              ) : (
                <button type="button" onClick={() => setShowStock(true)} className="text-xs text-primary-600 hover:underline">Stock in/out</button>
              )}
              <button type="button" onClick={startEdit} className="text-xs text-primary-600 hover:underline">Edit</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function InventoryList({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [lowStock, setLowStock] = useState(5);
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), sku: sku || null, quantity, unit_price: unitPrice, low_stock_threshold: lowStock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add product');
      setProducts((prev) => [...prev, data]);
      setName(''); setSku(''); setQuantity(0); setUnitPrice(0); setLowStock(5);
      setShowForm(false);
      toast.success('Product added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  }

  const lowStockProducts = products.filter((p) => p.quantity <= p.low_stock_threshold);

  return (
    <div className="space-y-6">
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Low stock alert</h2>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
            {lowStockProducts.length} product(s) below threshold. Restock soon.
          </p>
          <ul className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            {lowStockProducts.map((p) => (
              <li key={p.id}>• {p.name}: {p.quantity} left (alert at {p.low_stock_threshold})</li>
            ))}
          </ul>
          <Link href="/notifications" className="text-sm text-primary-600 hover:underline font-medium">Send low stock alert (email) →</Link>
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Add product</h2>
          <button type="button" onClick={() => setShowForm(!showForm)} className="text-sm text-primary-600 hover:underline">
            {showForm ? 'Cancel' : '+ Add product'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Product name" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label><input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="SKU (optional)" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label><input type="number" min={0} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit price (₦)</label><input type="number" min={0} step={0.01} value={unitPrice} onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Low stock alert at</label><input type="number" min={0} value={lowStock} onChange={(e) => setLowStock(parseInt(e.target.value, 10) || 0)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" /></div>
            <div className="flex items-end"><button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">{loading ? 'Adding…' : 'Add product'}</button></div>
          </form>
        )}
      </div>
      {products.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No products yet. Click &quot;Add product&quot; above to get started.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">SKU</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Unit price</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Stock In/Out</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <ProductRow key={p.id} product={p} onUpdate={(updated) => setProducts((prev) => prev.map((x) => x.id === updated.id ? updated : x))} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
