'use client';

import { useRef } from 'react';

type Props = {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export function ProductImageUpload({ previewUrl, onFileSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Product photo
      </label>
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
          <div className="aspect-[16/10] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/95 text-slate-800 shadow hover:bg-white"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600/95 text-white shadow hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-10 px-4 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition"
        >
          <svg
            className="h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Click to upload a photo
          </span>
          <span className="text-xs text-slate-500">JPEG, PNG, WebP or GIF · max 5 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
