import { NextResponse } from 'next/server';
import { getSupabaseProfile, getSupabaseProfileId } from '@/lib/auth';
import { ensureCatalogSlug } from '@/lib/catalog';
import { getAppUrl } from '@/lib/url';

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getSupabaseProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  let slug = profile.catalog_slug ?? null;
  if (!slug) {
    slug = await ensureCatalogSlug(profileId, profile.business_name, profile.email);
  }

  if (!slug) {
    return NextResponse.json(
      {
        error:
          'Could not create catalog link. Add catalog_slug to profiles in Supabase (run RUN_PRODUCT_CATALOG_SETUP.sql).',
      },
      { status: 503 }
    );
  }

  const url = `${getAppUrl()}/catalog/${slug}`;
  return NextResponse.json({ slug, url });
}
