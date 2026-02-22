import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { createInvoiceSchema } from '@/lib/validations/invoice';
import { nextInvoiceNumber } from '@/lib/invoice-number';
import { canCreateInvoice, FREE_INVOICE_LIMIT } from '@/lib/plan';
import { sendEmail } from '@/lib/email';

import { getAppUrl } from '@/lib/url';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ? getAppUrl() : 'http://localhost:3000'.replace(/\/$/, '');

function computeTotals(
  items: { quantity: number; unit_price: number; total: number }[],
  taxRate: number,
  discountType: 'fixed' | 'percent' | null,
  discountValue: number
) {
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const afterTax = subtotal + taxAmount;
  const discount =
    discountType === 'percent'
      ? (afterTax * discountValue) / 100
      : discountType === 'fixed'
        ? discountValue
        : 0;
  const total = Math.max(0, afterTax - discount);
  return { subtotal, taxAmount, total };
}

export async function GET() {
  const profileId = await getSupabaseProfileId();
  if (!profileId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', profileId)
    .order('issue_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const profileId = await getSupabaseProfileId();
  if (!profileId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, invoice_count_this_month, invoice_count_reset_at')
    .eq('id', profileId)
    .single();

  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  let count = Number(profile?.invoice_count_this_month ?? 0);
  let resetAt = profile?.invoice_count_reset_at;

  if (resetAt && new Date(resetAt) <= new Date()) {
    count = 0;
    resetAt = new Date(Date.now());
    resetAt.setMonth(resetAt.getMonth() + 1);
    resetAt.setDate(1);
    await supabase
      .from('profiles')
      .update({
        invoice_count_this_month: 0,
        invoice_count_reset_at: resetAt.toISOString(),
      })
      .eq('id', profileId);
  }

  if (!canCreateInvoice(plan, count)) {
    return NextResponse.json(
      { error: `Free plan limited to ${FREE_INVOICE_LIMIT} invoices per month. Upgrade to Pro for unlimited.` },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const items = input.items.map((i) => {
    const total = i.total ?? i.quantity * i.unit_price;
    return { ...i, total };
  });
  const { subtotal, taxAmount, total } = computeTotals(
    items,
    input.tax_rate,
    input.discount_type ?? null,
    input.discount_value
  );

  const { data: existing } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', profileId);
  const existingNumbers = (existing ?? []).map((r) => r.invoice_number);
  const invoiceNumber = nextInvoiceNumber(
    existingNumbers,
    input.type === 'receipt' ? 'RCP' : 'INV'
  );

  const { data: inserted, error } = await supabase
    .from('invoices')
    .insert({
      user_id: profileId,
      invoice_number: invoiceNumber,
      type: input.type,
      status: input.status,
      customer_id: input.customer_id || null,
      customer_name: input.customer_name || null,
      customer_email: input.customer_email || null,
      customer_phone: input.customer_phone || null,
      customer_address: input.customer_address || null,
      business_name: input.business_name || null,
      business_logo_url: input.business_logo_url || null,
      business_address: input.business_address || null,
      issue_date: input.issue_date,
      due_date: input.due_date || null,
      items,
      subtotal,
      tax_rate: input.tax_rate,
      tax_amount: taxAmount,
      discount_type: input.discount_type ?? null,
      discount_value: input.discount_value,
      total,
      amount_paid: input.amount_paid,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from('profiles')
    .update({
      invoice_count_this_month: count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (inserted?.customer_email) {
    const invoiceUrl = `${APP_URL}/invoices/${inserted.id}`;
    const subject = `Invoice #${inserted.invoice_number} is ready`;
    const emailResult = await sendEmail({
      to: inserted.customer_email,
      subject,
      html: `<p>Hi${inserted.customer_name ? ` ${inserted.customer_name}` : ''},</p><p>Your invoice <strong>#${inserted.invoice_number}</strong> (${Number(inserted.total).toLocaleString()} NGN) is ready.</p><p>View invoice: <a href="${invoiceUrl}">${invoiceUrl}</a></p>`,
      text: `Hi${inserted.customer_name ? ` ${inserted.customer_name}` : ''}, your invoice #${inserted.invoice_number} (${Number(inserted.total).toLocaleString()} NGN) is ready. View invoice: ${invoiceUrl}`,
    });
    if (!emailResult.ok) {
      console.error('Auto invoice email failed', {
        invoiceId: inserted.id,
        customerEmail: inserted.customer_email,
        error: emailResult.error,
      });
    }
  }

  return NextResponse.json(inserted);
}
