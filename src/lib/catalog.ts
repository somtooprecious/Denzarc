import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/slug';

/** Unique slug tied to profile id (always works when catalog_slug column exists). */
export function guaranteedCatalogSlug(
  profileId: string,
  businessName: string | null,
  email: string
): string {
  const base = slugify(businessName || email.split('@')[0] || 'shop');
  const suffix = profileId.replace(/-/g, '').slice(0, 8);
  return `${base}-${suffix}`;
}

/**
 * Returns an existing catalog slug or creates and saves one on the profile.
 */
export async function ensureCatalogSlug(
  profileId: string,
  businessName: string | null,
  email: string
): Promise<string | null> {
  const supabase = createAdminClient();

  let existingSlug: string | null = null;
  let nameForSlug = businessName;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('catalog_slug, business_name')
    .eq('id', profileId)
    .single();

  if (profileError) {
    if (profileError.message.toLowerCase().includes('catalog_slug')) {
      return null;
    }
  } else if (profile) {
    existingSlug = profile.catalog_slug ?? null;
    if (profile.business_name) nameForSlug = profile.business_name;
  }

  if (existingSlug) return existingSlug;

  const base = slugify(nameForSlug || email.split('@')[0] || 'shop');
  const candidates = [base];
  for (let n = 1; n < 20; n++) {
    candidates.push(`${base}-${n}`);
  }
  candidates.push(guaranteedCatalogSlug(profileId, nameForSlug, email));

  for (const candidate of candidates) {
    const slug = candidate.toLowerCase();
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .eq('catalog_slug', slug)
      .neq('id', profileId)
      .maybeSingle();

    if (taken) continue;

    const { error } = await supabase
      .from('profiles')
      .update({ catalog_slug: slug, updated_at: new Date().toISOString() })
      .eq('id', profileId);

    if (!error) return slug;
    if (error.message.toLowerCase().includes('catalog_slug')) return null;
  }

  return null;
}
