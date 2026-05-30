'use client';

import { useEffect } from 'react';

type Props = {
  url: string;
  open: boolean;
  onClose: () => void;
};

function shareMessage(url: string) {
  return `Browse my product catalog:\n${url}`;
}

export function CatalogShareDialog({ url, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const text = shareMessage(url);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const channels = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}`,
      className: 'bg-[#25D366] text-white hover:opacity-90',
    },
    {
      id: 'email',
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('My product catalog')}&body=${encodedText}`,
      className: 'bg-slate-700 text-white hover:bg-slate-800',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: 'bg-[#1877F2] text-white hover:opacity-90',
    },
    {
      id: 'x',
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Browse my product catalog')}&url=${encodedUrl}`,
      className: 'bg-slate-900 text-white hover:bg-slate-800',
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      onClose();
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="share-catalog-title"
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 id="share-catalog-title" className="text-lg font-bold text-slate-900 dark:text-white">
          Share your catalog
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Pick how you want to send your shop link to customers.
        </p>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 break-all rounded-lg bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-600">
          {url}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {channels.map((ch) => (
            <a
              key={ch.id}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold transition ${ch.className}`}
            >
              {ch.label}
            </a>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
