'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 max-w-md w-full text-center">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          We couldn’t load this page. This can happen if sign-in isn’t fully configured yet.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition inline-center"
          >
            Back to home
          </Link>
          <Link
            href="/sign-in"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition inline-center"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          If this keeps happening, check that <strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</strong> and <strong>CLERK_SECRET_KEY</strong> are set in your Vercel project environment variables.
        </p>
      </div>
    </div>
  );
}
