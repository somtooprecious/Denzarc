'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProductRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

const DEBOUNCE_MS = 300;

export function ProductsManager({ products: initialProducts }: { products: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Debounced search (300ms)
  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Product name is required');
      return;
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      toast.error('Enter a valid price (0 or greater)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
          unit_price: numPrice,
          quantity: 0,
          low_stock_threshold: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add product');
      setProducts((prev) => [...prev, data]);
      setName('');
      setDescription('');
      setPrice('');
      toast.success('Product added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p: ProductRow) {
    setEditingId(p.id);
    setEditPrice(String(p.unit_price));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPrice('');
  }

  async function handleSave(p: ProductRow) {
    const newPrice = Number(editPrice);
    if (Number.isNaN(newPrice) || newPrice < 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (newPrice === Number(p.unit_price)) {
      cancelEdit();
      return;
    }
    setSavingId(p.id);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_price: newPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update');
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, unit_price: newPrice } : x)));
      setEditingId(null);
      setEditPrice('');
      toast.success('Price updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update price');
    } finally {
      setSavingId(null);
    }
  }

  const hasPriceChange = (p: ProductRow) =>
    editingId === p.id && Number(editPrice) !== Number(p.unit_price) && !Number.isNaN(Number(editPrice)) && Number(editPrice) >= 0;

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Add product</h2>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              placeholder="e.g. Widget A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Short description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price *</label>
            <input
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {loading ? 'Adding…' : 'Add product'}
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="products-search">Search products</label>
        <input
          id="products-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products by name…"
          className="flex-1 max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
        />
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400">
            {products.length === 0 ? 'No products added yet. Add one above.' : 'No products match your search.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Product name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={p.description ?? ''}>
                      {p.description ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === p.id ? (
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-right"
                        />
                      ) : (
                        <span className="text-slate-900 dark:text-white">₦{Number(p.unit_price).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === p.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSave(p)}
                              disabled={!hasPriceChange(p) || savingId === p.id}
                              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition"
                            >
                              {savingId === p.id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
