import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { BusinessSettingsForm } from '@/components/settings/BusinessSettingsForm';

export default async function SettingsPage() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) redirect('/sign-in');
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, business_address, business_logo_url, phone')
    .eq('id', profileId)
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business settings</h1>
      <p className="text-slate-600 dark:text-slate-400">Update your business name, address, and logo URL. Logo appears on invoices.</p>
      <BusinessSettingsForm profile={profile} />
    </div>
  );
}
