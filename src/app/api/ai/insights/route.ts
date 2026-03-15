import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { hasAIInsights } from '@/lib/plan';

function buildFallbackInsights(
  sales: { amount: number; sale_date: string }[],
  expenses: { amount: number; expense_date: string }[],
  invoices: { items?: { description: string; quantity: number; unit_price: number; total: number }[] }[]
): string[] {
  const totalSales = sales.reduce((a, s) => a + Number(s.amount), 0);
  const totalExpenses = expenses.reduce((a, s) => a + Number(s.amount), 0);
  const net = totalSales - totalExpenses;
  const insights: string[] = [];
  insights.push(`Your total sales are ₦${Number(totalSales).toLocaleString()} from ${sales.length} sale(s).`);
  insights.push(`Your total expenses are ₦${Number(totalExpenses).toLocaleString()} from ${expenses.length} expense(s).`);
  insights.push(`Net profit so far: ₦${Number(net).toLocaleString()}.`);
  const salesByDay = sales.reduce((acc, s) => {
    const d = s.sale_date ? new Date(s.sale_date).toLocaleDateString('en-US', { weekday: 'long' }) : '';
    if (d) acc[d] = (acc[d] ?? 0) + Number(s.amount);
    return acc;
  }, {} as Record<string, number>);
  const bestDay = Object.entries(salesByDay).sort((a, b) => b[1] - a[1])[0];
  if (bestDay) insights.push(`Your best selling day is ${bestDay[0]} with ₦${Number(bestDay[1]).toLocaleString()} in sales.`);
  const expensesByWeek = expenses.slice(-14);
  const thisWeekExp = expensesByWeek.slice(-7).reduce((a, e) => a + Number(e.amount), 0);
  const lastWeekExp = expensesByWeek.slice(0, 7).reduce((a, e) => a + Number(e.amount), 0);
  if (lastWeekExp > 0 && expensesByWeek.length >= 7) {
    const pct = (((thisWeekExp - lastWeekExp) / lastWeekExp) * 100).toFixed(1);
    insights.push(`Expenses this week: ₦${Number(thisWeekExp).toLocaleString()} (${Number(pct) >= 0 ? '+' : ''}${pct}% vs last week).`);
  }
  const byProduct: Record<string, number> = {};
  (invoices ?? []).forEach((inv) => (inv.items ?? []).forEach((i) => {
    const n = (i.description || 'Unknown').trim();
    if (!n) return;
    byProduct[n] = (byProduct[n] ?? 0) + Number(i.total);
  }));
  const productEntries = Object.entries(byProduct).sort((a, b) => b[1] - a[1]);
  if (productEntries.length > 0) {
    insights.push(`Best product by revenue: ${productEntries[0][0]} (₦${Number(productEntries[0][1]).toLocaleString()}).`);
    if (productEntries.length > 1) insights.push(`Consider promoting ${productEntries[0][0]} — it leads your revenue.`);
  }
  return insights;
}

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  const profileId = await getSupabaseProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', profileId).single();
  if (!hasAIInsights((profile?.plan as 'free' | 'pro') ?? 'free')) return NextResponse.json({ error: 'Pro only' }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { sales = [], expenses = [], invoices = [] } = body as {
    sales?: { amount: number; sale_date: string }[];
    expenses?: { amount: number; expense_date: string; category: string }[];
    invoices?: { items?: { description: string; quantity: number; unit_price: number; total: number }[] }[];
  };
  const salesArr = sales as { amount: number; sale_date: string }[];
  const expensesArr = expenses as { amount: number; expense_date: string }[];
  const invoicesArr = invoices as { items?: { description: string; quantity: number; unit_price: number; total: number }[] }[];

  if (!key) {
    const insights = buildFallbackInsights(salesArr, expensesArr, invoicesArr);
    return NextResponse.json({ insights });
  }

  const totalSales = salesArr.reduce((a, s) => a + Number(s.amount), 0);
  const totalExpenses = expensesArr.reduce((a, s) => a + Number(s.amount), 0);
  const net = totalSales - totalExpenses;
  const byProduct: Record<string, { total: number }> = {};
  (invoicesArr ?? []).forEach((inv) => (inv.items ?? []).forEach((i) => {
    const n = i.description || 'Unknown';
    if (!byProduct[n]) byProduct[n] = { total: 0 };
    byProduct[n].total += Number(i.total);
  }));
  const productStr = Object.entries(byProduct).map(([n, d]) => `${n}: ₦${d.total}`).join('; ') || 'none';
  const salesByDay = salesArr.reduce((acc, s) => {
    const d = s.sale_date ? new Date(s.sale_date).toLocaleDateString('en-US', { weekday: 'long' }) : '';
    if (d) acc[d] = (acc[d] ?? 0) + Number(s.amount);
    return acc;
  }, {} as Record<string, number>);
  const expensesByWeek = expensesArr.slice(-14);
  const thisWeekExp = expensesByWeek.slice(-7).reduce((a, e) => a + Number(e.amount), 0);
  const lastWeekExp = expensesByWeek.slice(0, 7).reduce((a, e) => a + Number(e.amount), 0);
  const expChange = lastWeekExp > 0 ? ((thisWeekExp - lastWeekExp) / lastWeekExp * 100).toFixed(1) : 'N/A';
  const summary = `Sales: ${salesArr.length} entries, total ₦${totalSales}. By day: ${JSON.stringify(salesByDay)}. Expenses: ${expensesArr.length} entries, total ₦${totalExpenses}. This week: ₦${thisWeekExp}, last week: ₦${lastWeekExp} (change: ${expChange}%). Net: ₦${net}. Products: ${productStr}.`;
  const systemPrompt = `You are a business analyst. Analyze the data and return a JSON array of 5-7 short, specific insights. Format each as a complete sentence. Include: (1) Expense trend - e.g. "Your expenses increased/decreased by X% this week compared to last week" if data allows; (2) Best selling day - e.g. "You sell more on Fridays" based on sales by day; (3) Best product - e.g. "Product A has the highest revenue"; (4) Worst product if multiple; (5) Next month sales prediction based on trend; (6) Profit margin or cost-saving tip. Be specific with numbers. Return ONLY a valid JSON array of strings, no markdown.`;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: summary },
        ],
        max_tokens: 600,
        temperature: 0.5,
      }),
    });
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      const fallback = buildFallbackInsights(salesArr, expensesArr, invoicesArr);
      return NextResponse.json({ insights: fallback });
    }
    let insights: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      insights = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
    } catch {
      insights = raw.split(/\n+/).map((s: string) => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
    }
    return NextResponse.json({ insights });
  } catch (e) {
    console.error('OpenAI error:', e);
    const fallback = buildFallbackInsights(salesArr, expensesArr, invoicesArr);
    return NextResponse.json({ insights: fallback });
  }
}
