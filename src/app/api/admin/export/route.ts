import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdminUser } from '@/lib/admin';

function csvEscape(value: string) {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

function toCsv(rows: Record<string, string | number | null | undefined>[]) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      headers
        .map((key) => csvEscape(row[key] === null || row[key] === undefined ? '' : String(row[key])))
        .join(',')
    );
  }
  return lines.join('\n');
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? '';
  const status = searchParams.get('status') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
  const q = searchParams.get('q') ?? '';
  const plan = searchParams.get('plan') ?? '';

  const supabase = createAdminClient();

  if (type === 'payments') {
    let query = supabase
      .from('payments')
      .select('id, user_id, amount, reference, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    const { data } = await query;
    const csv = toCsv(
      (data ?? []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        amount: p.amount,
        reference: p.reference,
        status: p.status,
        created_at: p.created_at,
      }))
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payments.csv"',
      },
    });
  }

  if (type === 'invoices') {
    let query = supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, status, total, issue_date')
      .order('issue_date', { ascending: false })
      .limit(1000);
    if (status) query = query.eq('status', status);
    if (from) query = query.gte('issue_date', from);
    if (to) query = query.lte('issue_date', to);
    const { data } = await query;
    const csv = toCsv(
      (data ?? []).map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer_name: inv.customer_name,
        status: inv.status,
        total: inv.total,
        issue_date: inv.issue_date,
      }))
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="invoices.csv"',
      },
    });
  }

  if (type === 'users') {
    let query = supabase
      .from('users')
      .select('id, email, plan, subscription_start, subscription_end')
      .order('email', { ascending: true })
      .limit(1000);
    if (q) query = query.ilike('email', `%${q}%`);
    if (plan) query = query.eq('plan', plan);
    const { data } = await query;
    const csv = toCsv(
      (data ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        plan: u.plan,
        subscription_start: u.subscription_start,
        subscription_end: u.subscription_end,
      }))
    );
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users.csv"',
      },
    });
  }

  return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
}
