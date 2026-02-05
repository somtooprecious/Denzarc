'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
}

export function CustomerList({ customers: initialCustomers }: { customers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email || null, phone: phone || null, address: address || null, notes: notes || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add customer');
      setCustomers((prev) => [...prev, data]);
      setName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('');
      setShowForm(false);
      toast.success('Customer added');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Add customer</h2>
          <button type="button" onClick={() => setShowForm(!showForm)} className="text-sm text-primary-600 hover:underline">
            {showForm ? 'Cancel' : '+ Add customer'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Customer name" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="email@example.com" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Phone" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Address" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (VIP, frequent buyer, etc.)</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Notes" /></div>
            <div><button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition">{loading ? 'Adding…' : 'Add customer'}</button></div>
          </form>
        )}
      </div>
      {customers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No customers yet. Click &quot;Add customer&quot; above to get started.</p>
        </motion.div>
      ) : (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Name</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Email</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Phone</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Notes</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-white"><Link href={`/customers/${c.id}`} className="text-primary-600 hover:underline">{c.name}</Link></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.email ?? '—'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.phone ?? '—'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.notes ?? '—'}</td>
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
