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
  webhook: boolean;
  appUrl: string | null;
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
          toast.error(data.error, { duration: 6000 });
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
        <div className="mt-4 p-3 rounded-lg bg-amber-100/80 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-100 space-y-1">
          {!status.supabase && (
            <p>
              <strong>Missing on server:</strong> NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
              Vercel → Settings → Environment Variables.
            </p>
          )}
          {!status.clerk && (
            <p>
              <strong>Missing on server:</strong> Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
              CLERK_SECRET_KEY).
            </p>
          )}
        </div>
      )}

      <ol className="mt-6 list-decimal list-inside space-y-2 text-sm text-amber-900 dark:text-amber-100">
        <li>
          Click <strong>Link my account now</strong> above.
        </li>
        <li>
          If it still fails, run this in <strong>Supabase → SQL Editor</strong> (new query → Run):
          <code className="block mt-1 text-xs bg-amber-100 dark:bg-amber-950/50 p-2 rounded break-all whitespace-pre-wrap">
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT UNIQUE;
            {'\n'}
            DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE
            table_name = &apos;profiles&apos; AND constraint_name = &apos;profiles_id_fkey&apos;) THEN ALTER
            TABLE public.profiles DROP CONSTRAINT profiles_id_fkey; END IF; END $$;
            {'\n'}
            NOTIFY pgrst, &apos;reload schema&apos;;
          </code>
        </li>
        <li>Redeploy on Vercel if you changed environment variables, then refresh this page.</li>
      </ol>
    </div>
  );
}
