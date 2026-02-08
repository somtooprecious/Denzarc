import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/denzarc%20logo.png"
                alt="Denzarc logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="text-xl font-bold text-primary-600">Denzarc</span>
            </Link>
            <DashboardNav />
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
