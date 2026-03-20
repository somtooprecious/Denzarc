import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  const hasClerkPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerkPublishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center max-w-md w-full">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Authentication is not configured</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable sign-up.
          </p>
          <Link href="/" className="mt-4 inline-flex text-primary-600 hover:text-primary-700 font-medium">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <Image
            src="/denzarc%20logo.png"
            alt="Denzarc logo"
            width={64}
            height={64}
            className="mx-auto h-16 w-16 object-contain"
            priority
          />
        </div>
        <SignUp
          appearance={{
            layout: { logoPlacement: 'none' },
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg border border-slate-200 dark:border-slate-700',
              footer: 'hidden',
            },
          }}
          afterSignUpUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
