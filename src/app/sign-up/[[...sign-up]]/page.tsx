import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <SignUp
        appearance={{
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
  );
}
