import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/slug';

export async function ensureCatalogSlug(
  profileId: string,
  businessName: string | null,
  email: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('catalog_slug, business_name')
    .eq('id', profileId)
    .single();

  if (profile?.catalog_slug) return profile.catalog_slug;

  const base = slugify(businessName || profile?.business_name || email.split('@')[0] || 'shop');
  let candidate = base;
  let n = 0;

  while (n < 20) {
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('catalog_slug', candidate)
      .neq('id', profileId)
      .maybeSingle();

    if (!taken) {
      const { error } = await supabase
        .from('profiles')
        .update({ catalog_slug: candidate, updated_at: new Date().toISOString() })
        .eq('id', profileId);
      if (!error) return candidate;
    }
    n += 1;
    candidate = `${base}-${n}`;
  }

  return null;
}
