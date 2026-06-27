'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProfileSyncRetry } from './ProfileSyncRetry';

type SetupStatus = {
  ready: boolean;
  clerk: boolean;
  supabase: boolean;
  database: boolean;
  clerkColumnReady: boolean;
  missingSupabase: string[];
  databaseError: string | null;
  hints: string[];
};

export function AccountSetupRequired() {
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const statusRes = await fetch('/api/setup/status');
        if (statusRes.ok) {
          const data = await statusRes.json();
          if (!cancelled) setStatus(data);
        }
      } catch {
        /* ignore */
      }

      try {
        const syncRes = await fetch('/api/auth/sync-profile', { method: 'POST' });
        if (syncRes.ok) {
          router.refresh();
          return;
        }
        const data = await syncRes.json().catch(() => ({}));
        if (!cancelled && data.error) {
          toast.error(data.error, { duration: 8000 });
        }
      } catch {
        /* show manual retry */
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
        Almost there — finish setup
      </h2>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        {syncing
          ? 'Linking your account to your business data…'
          : 'You signed in successfully. Click below to finish linking your account once.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <ProfileSyncRetry />
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-amber-300 dark:border-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40"
        >
          Refresh page
        </Link>
      </div>

      {status && !status.ready && (
        <div className="mt-4 p-3 rounded-lg bg-amber-100/80 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-100 space-y-2">
          <p className="font-semibold">What to fix in Vercel → Environment Variables:</p>
          <p>
            Use the <strong>Production</strong> environment (denzarc.com does not use Development-only
            vars).
          </p>
          {status.missingSupabase?.length > 0 && (
            <p>
              <strong>Missing:</strong> {status.missingSupabase.join(', ')}
            </p>
          )}
          {!status.clerk && (
            <p>
              <strong>Missing Clerk keys:</strong> NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
            </p>
          )}
          {status.databaseError && (
            <p>
              <strong>Database:</strong> {status.databaseError}
            </p>
          )}
          {status.hints?.slice(0, 3).map((h) => (
            <p key={h}>{h}</p>
          ))}
        </div>
      )}

      <ol className="mt-6 list-decimal list-inside space-y-2 text-sm text-amber-900 dark:text-amber-100">
        <li>
          Vercel → Settings → Environment Variables → enable for <strong>Production</strong>:
          <code className="block mt-1 text-xs bg-amber-100 dark:bg-amber-950/50 p-2 rounded break-all">
            NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_APP_URL=https://denzarc.com
          </code>
        </li>
        <li>
          Supabase → SQL Editor → run <code className="text-xs">supabase/RUN_CLERK_SETUP.sql</code>
        </li>
        <li>Redeploy on Vercel, then click <strong>Link my account now</strong>.</li>
      </ol>
    </div>
  );
}
