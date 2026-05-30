import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, business_name, business_logo_url, business_address, phone, catalog_slug')
    .eq('catalog_slug', slug.trim().toLowerCase())
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, description, category, unit_price, quantity, image_url, sku')
    .eq('user_id', profile.id)
    .eq('is_listed', true)
    .order('name');

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  return NextResponse.json({
    business: {
      name: profile.business_name ?? 'Shop',
      logoUrl: profile.business_logo_url,
      address: profile.business_address,
      phone: profile.phone,
      slug: profile.catalog_slug,
    },
    products: products ?? [],
  });
}
