import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

function toDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDateOnly(input: string): Date {
  const [year, month, day] = input.split('-').map((x) => Number(x));
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

function daysBetween(today: Date, date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date.getTime() - today.getTime()) / msPerDay);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = toDateOnly(new Date());
  const sent: string[] = [];
  const failed: { target: string; reason: string }[] = [];

  const { data: proProfiles } = await supabase
    .from('profiles')
    .select('id, email, subscription_end')
    .eq('plan', 'pro')
    .not('subscription_end', 'is', null);

  for (const profile of proProfiles ?? []) {
    const subscriptionEnd = new Date(profile.subscription_end as string);
    const endDate = toDateOnly(subscriptionEnd);
    const daysLeft = daysBetween(today, endDate);
    if (![7, 3, 1].includes(daysLeft)) continue;

    if (profile.email) {
      const emailResult = await sendEmail({
        to: String(profile.email),
        subject: `Subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        html: `<p>Reminder: Your Denzarc Pro subscription expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p><p>Renew here: <a href="${APP_URL}/pricing">${APP_URL}/pricing</a></p>`,
        text: `Reminder: Your Denzarc Pro subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew here: ${APP_URL}/pricing`,
      });
      if (emailResult.ok) {
        sent.push(`subscription:email:${profile.id}:${daysLeft}d`);
      } else {
        failed.push({ target: `subscription:email:${profile.id}`, reason: emailResult.error ?? 'unknown' });
      }
    }
  }

  const todayIso = today.toISOString().slice(0, 10);
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, due_date, status, customer_email, customer_name')
    .in('status', ['unpaid', 'partial'])
    .not('due_date', 'is', null)
    .lte('due_date', todayIso);

  for (const invoice of invoices ?? []) {
    const due = parseDateOnly(String(invoice.due_date));
    const overdueDays = -daysBetween(today, due);
    if (![0, 3, 7].includes(overdueDays)) continue;

    const invoiceUrl = `${APP_URL}/invoices/${invoice.id}`;
    if (invoice.customer_email) {
      const name = invoice.customer_name ? ` ${invoice.customer_name}` : '';
      const emailSubject = overdueDays === 0
        ? `Payment due today: Invoice #${invoice.invoice_number}`
        : `Payment reminder: Invoice #${invoice.invoice_number}`;
      const emailHtml = overdueDays === 0
        ? `<p>Hi${name},</p><p>This is a reminder that invoice <strong>#${invoice.invoice_number}</strong> (${Number(invoice.total).toLocaleString()} NGN) is due today.</p><p>View invoice: <a href="${invoiceUrl}">${invoiceUrl}</a></p>`
        : `<p>Hi${name},</p><p>Invoice <strong>#${invoice.invoice_number}</strong> is <strong>${overdueDays} day${overdueDays > 1 ? 's' : ''}</strong> overdue.</p><p>Amount: ${Number(invoice.total).toLocaleString()} NGN</p><p>View invoice: <a href="${invoiceUrl}">${invoiceUrl}</a></p>`;
      const emailText = overdueDays === 0
        ? `Hi${name}, invoice #${invoice.invoice_number} (${Number(invoice.total).toLocaleString()} NGN) is due today. View invoice: ${invoiceUrl}`
        : `Hi${name}, invoice #${invoice.invoice_number} is ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue. Amount: ${Number(invoice.total).toLocaleString()} NGN. View invoice: ${invoiceUrl}`;

      const emailResult = await sendEmail({
        to: String(invoice.customer_email),
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      if (emailResult.ok) {
        sent.push(`invoice:email:${invoice.id}:${overdueDays}d`);
      } else {
        failed.push({ target: `invoice:email:${invoice.id}`, reason: emailResult.error ?? 'unknown' });
      }
    }
  }

  const { data: products } = await supabase
    .from('products')
    .select('user_id, name, quantity, low_stock_threshold');

  const lowStockByUser = new Map<string, { name: string; quantity: number; low_stock_threshold: number }[]>();
  for (const product of products ?? []) {
    const qty = Number(product.quantity ?? 0);
    const threshold = Number(product.low_stock_threshold ?? 0);
    if (threshold <= 0 || qty > threshold) continue;
    const userId = String(product.user_id);
    const existing = lowStockByUser.get(userId) ?? [];
    existing.push({
      name: String(product.name ?? 'Unnamed product'),
      quantity: qty,
      low_stock_threshold: threshold,
    });
    lowStockByUser.set(userId, existing);
  }

  const lowStockUserIds = Array.from(lowStockByUser.keys());
  if (lowStockUserIds.length > 0) {
    const { data: stockUsers } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', lowStockUserIds)
      .not('email', 'is', null);

    for (const user of stockUsers ?? []) {
      const items = lowStockByUser.get(String(user.id)) ?? [];
      if (!user.email || items.length === 0) continue;
      const htmlRows = items
        .slice(0, 20)
        .map((item) => `<li>${item.name}: ${item.quantity} left (threshold ${item.low_stock_threshold})</li>`)
        .join('');
      const textRows = items
        .slice(0, 20)
        .map((item) => `- ${item.name}: ${item.quantity} left (threshold ${item.low_stock_threshold})`)
        .join('\n');

      const emailResult = await sendEmail({
        to: String(user.email),
        subject: `Low stock alert (${items.length} item${items.length > 1 ? 's' : ''})`,
        html: `<p>The following products are low in stock:</p><ul>${htmlRows}</ul><p>View inventory: <a href="${APP_URL}/inventory">${APP_URL}/inventory</a></p>`,
        text: `The following products are low in stock:\n${textRows}\n\nView inventory: ${APP_URL}/inventory`,
      });
      if (emailResult.ok) {
        sent.push(`low-stock:email:${user.id}:${items.length}`);
      } else {
        failed.push({ target: `low-stock:email:${user.id}`, reason: emailResult.error ?? 'unknown' });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sentCount: sent.length,
    failedCount: failed.length,
    sent,
    failed,
  });
}
