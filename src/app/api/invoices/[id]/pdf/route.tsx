import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSupabaseProfileId } from '@/lib/auth';
import { canRemoveBranding } from '@/lib/plan';
import { InvoicePDF } from '@/components/invoices/InvoicePDF';
import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profileId = await getSupabaseProfileId();
  if (!profileId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', profileId)
    .single();

  if (error || !invoice) {
    return NextResponse.json(
      { error: error?.message ?? 'Not found' },
      { status: error?.code === 'PGRST116' ? 404 : 500 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', profileId)
    .single();
  const plan = (profile?.plan as 'free' | 'pro') ?? 'free';
  const showBranding = !canRemoveBranding(plan);

  try {
    const doc = (
      <Document>
        <InvoicePDF
          invoice={invoice as Parameters<typeof InvoicePDF>[0]['invoice']}
          showBranding={showBranding}
        />
      </Document>
    );
    const buffer = await renderToBuffer(doc);
    const pdfBytes = new Uint8Array(buffer);
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (e) {
    console.error('PDF render error:', e);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
