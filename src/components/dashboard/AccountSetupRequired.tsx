import Link from 'next/link';
import { ProfileSyncRetry } from './ProfileSyncRetry';

export function AccountSetupRequired() {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
        Almost there — finish setup
      </h2>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        You signed in with Clerk successfully. We need to link your account to the database once.
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

      <ol className="mt-6 list-decimal list-inside space-y-2 text-sm text-amber-900 dark:text-amber-100">
        <li>
          <strong>Vercel → Environment Variables</strong> (Production):
          <code className="block mt-1 text-xs bg-amber-100 dark:bg-amber-950/50 p-2 rounded break-all">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL=https://denzarc.com
          </code>
        </li>
        <li>
          <strong>Clerk Dashboard</strong>: add domain <strong>denzarc.com</strong>; Paths → sign-in{' '}
          <code className="text-xs">/sign-in</code>, sign-up <code className="text-xs">/sign-up</code>.
        </li>
        <li>
          <strong>Clerk Webhooks</strong> (recommended): endpoint{' '}
          <code className="text-xs break-all">https://denzarc.com/api/webhooks/clerk</code> — events{' '}
          <code className="text-xs">user.created</code>, <code className="text-xs">user.updated</code>.
          Copy signing secret to <code className="text-xs">CLERK_WEBHOOK_SECRET</code> in Vercel.
        </li>
        <li>
          <strong>Supabase SQL Editor</strong>: run <code className="text-xs">005_clerk_auth.sql</code>{' '}
          (after 001–004).
        </li>
        <li>Redeploy on Vercel, then click &quot;Link my account now&quot; above.</li>
      </ol>
    </div>
  );
}
