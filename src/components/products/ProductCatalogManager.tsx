'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Product } from '@/types';
import { ProductImageUpload } from '@/components/products/ProductImageUpload';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CATEGORIES = [
  'General',
  'Electronics',
  'Fashion & Apparel',
  'Food & Beverage',
  'Health & Beauty',
  'Home & Garden',
  'Services',
  'Other',
];

type ProductInput = {
  name: string;
  description: string;
  category: string;
  sku: string;
  unit_price: string;
  quantity: string;
  is_listed: boolean;
};

const emptyForm = (): ProductInput => ({
  name: '',
  description: '',
  category: 'General',
  sku: '',
  unit_price: '',
  quantity: '0',
  is_listed: true,
});

function revokeBlobPreview(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

function ProductImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  const letter = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-primary-500/20 to-primary-700/30">
      <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">{letter}</span>
    </div>
  );
}

export function ProductCatalogManager({
  products: initialProducts,
  catalogUrl,
}: {
  products: Product[];
  catalogUrl: string | null;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(catalogUrl);
  const [loadingShareUrl, setLoadingShareUrl] = useState(!catalogUrl);

  useEffect(() => {
    setShareUrl(catalogUrl);
    if (catalogUrl) {
      setLoadingShareUrl(false);
      return;
    }
    let cancelled = false;
    setLoadingShareUrl(true);
    fetch('/api/catalog/me')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.url) setShareUrl(data.url);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingShareUrl(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogUrl]);

  const stats = useMemo(() => {
    const listed = products.filter((p) => p.is_listed !== false).length;
    const inStock = products.filter((p) => p.quantity > 0).length;
    return { total: products.length, listed, inStock };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.toLowerCase().includes(q) ?? false) ||
        (p.description?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    revokeBlobPreview(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setImageRemoved(false);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      category: p.category ?? 'General',
      sku: p.sku ?? '',
      unit_price: String(p.unit_price),
      quantity: String(p.quantity),
      is_listed: p.is_listed !== false,
    });
    revokeBlobPreview(imagePreview);
    setImagePreview(p.image_url ?? null);
    setImageFile(null);
    setImageRemoved(false);
    setShowForm(true);
  }

  function closeForm() {
    revokeBlobPreview(imagePreview);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm());
    setImagePreview(null);
    setImageFile(null);
    setImageRemoved(false);
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }
    revokeBlobPreview(imagePreview);
    setImageFile(file);
    setImageRemoved(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleImageRemove() {
    revokeBlobPreview(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
  }

  async function resolveImageUrl(): Promise<string | null> {
    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      const res = await fetch('/api/products/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Image upload failed');
      return data.url as string;
    }
    if (imageRemoved) return null;
    return editing?.image_url ?? null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error('Product name is required');
      return;
    }
    const unitPrice = Number(form.unit_price);
    const quantity = Number(form.quantity);
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Enter a valid price');
      return;
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      toast.error('Enter a valid quantity');
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await resolveImageUrl();
      const payload = {
        name: trimmedName,
        description: form.description.trim() || null,
        category: form.category || null,
        image_url: imageUrl,
        sku: form.sku.trim() || null,
        unit_price: unitPrice,
        quantity,
        is_listed: form.is_listed,
        low_stock_threshold: 5,
      };

      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Update failed');
        setProducts((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...data } : x)));
        toast.success('Product updated');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to add product');
        setProducts((prev) => [data, ...prev]);
        toast.success('Product published to your catalog');
      }
      closeForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function toggleListed(p: Product) {
    const next = !(p.is_listed !== false);
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_listed: !next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_listed: !next } : x)));
      toast.success(!next ? 'Visible on public catalog' : 'Hidden from catalog');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Remove "${p.name}" from your catalog?`)) return;
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Delete failed');
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success('Product removed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function copyCatalogLink() {
    let url = shareUrl;
    if (!url) {
      setLoadingShareUrl(true);
      try {
        const res = await fetch('/api/catalog/me');
        const data = await res.json();
        if (!res.ok || !data.url) {
          toast.error(data.error ?? 'Could not create catalog link');
          return;
        }
        url = data.url;
        setShareUrl(url);
      } catch {
        toast.error('Could not create catalog link');
        return;
      } finally {
        setLoadingShareUrl(false);
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Catalog link copied');
  }

  return (
    <div className="space-y-8">
      {/* Stats & catalog link */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total products', value: stats.total },
          { label: 'Listed publicly', value: stats.listed },
          { label: 'In stock', value: stats.inStock },
          { label: 'Public catalog', value: null, action: true },
        ].map((s) =>
          s.action ? (
            <button
              key={s.label}
              type="button"
              onClick={copyCatalogLink}
              disabled={loadingShareUrl}
              className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20 p-4 text-left hover:bg-primary-50 dark:hover:bg-primary-900/30 transition disabled:opacity-60"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
                {s.label}
              </p>
              <p className="mt-1 text-lg font-bold text-primary-700 dark:text-primary-300">
                {loadingShareUrl ? 'Loading…' : shareUrl ? 'Copy link →' : 'Get share link →'}
              </p>
            </button>
          ) : (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          )
        )}
      </div>

      {shareUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/80 dark:bg-primary-900/20 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-900 dark:text-primary-100">Public catalog</p>
            <p className="text-sm text-primary-800/80 dark:text-primary-200/80 truncate">{shareUrl}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={copyCatalogLink}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
            >
              Copy link
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-primary-600 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition"
            >
              Preview
            </a>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full sm:max-w-xs px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow-sm transition"
        >
          <span className="text-lg leading-none">+</span> Add product
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editing ? 'Edit product' : 'Add product to catalog'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Customers will see listed products on your public catalog page.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Product name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    placeholder="e.g. Premium Widget"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    placeholder="What makes this product great?"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      SKU (optional)
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={form.unit_price}
                      onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Quantity in stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <ProductImageUpload
                  previewUrl={imagePreview}
                  onFileSelect={handleFileSelect}
                  onRemove={handleImageRemove}
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_listed}
                    onChange={(e) => setForm((f) => ({ ...f, is_listed: e.target.checked }))}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Show on public catalog
                  </span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {products.length === 0
              ? 'No products yet. Add your first product to build your catalog.'
              : 'No products match your search.'}
          </p>
          {products.length === 0 && (
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.article
              key={p.id}
              layout
              className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <ProductImage name={p.name} imageUrl={p.image_url} />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {p.category && (
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
                        {p.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</h3>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      p.quantity > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.quantity > 0 ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{p.description}</p>
                )}
                <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                  ₦{Number(p.unit_price).toLocaleString()}
                </p>
                {p.is_listed === false && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Hidden from public catalog</p>
                )}
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="flex-1 min-w-[4rem] py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleListed(p)}
                    className="py-1.5 px-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title={p.is_listed !== false ? 'Hide from catalog' : 'Show on catalog'}
                  >
                    {p.is_listed !== false ? 'Hide' : 'List'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="py-1.5 px-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
