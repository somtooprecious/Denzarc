import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';
import { AdminSmsSectionWrapper } from '@/components/admin/AdminSmsSectionWrapper';

export default async function AdminSmsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!isAdminUser(userId)) redirect('/');

  const supabase = createAdminClient();
  const { data: profilesForSms } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, plan, subscription_end, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  const profiles = (profilesForSms ?? []).map((p) => ({
    id: String(p.id),
    email: p.email != null ? String(p.email) : null,
    phone: p.phone != null ? String(p.phone) : null,
    full_name: p.full_name != null ? String(p.full_name) : null,
    plan: p.plan != null ? String(p.plan) : null,
    subscription_end: p.subscription_end != null ? String(p.subscription_end) : null,
    created_at: p.created_at != null ? String(p.created_at) : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          ← Back to Admin
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Send SMS</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Send an SMS to a user (by selecting them) or to a custom phone number. Uses Termii.
        </p>
      </div>
      <AdminSmsSectionWrapper profiles={profiles} />
    </div>
  );
}
