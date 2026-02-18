'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface InvoiceActionsProps {
  invoice: {
    id: string;
    invoice_number: string;
    type: string;
    status?: string;
    total: number;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
  };
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<'email' | 'sms' | null>(null);
  const needsPayment = invoice.status === 'unpaid' || invoice.status === 'partial';
  const invoiceUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/invoices/${invoice.id}`
    : `${APP_URL}/invoices/${invoice.id}`;
  const shareText = `Invoice #${invoice.invoice_number} – Total: ₦${Number(invoice.total).toLocaleString()}. View: ${invoiceUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailSubject = `Invoice #${invoice.invoice_number}`;
  const mailBody = `Hi${invoice.customer_name ? ` ${invoice.customer_name}` : ''},\n\nPlease find your invoice #${invoice.invoice_number} (₦${Number(invoice.total).toLocaleString()}) here:\n${invoiceUrl}\n\nThank you.`;

  async function handleDownloadPdf() {
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (e) {
      toast.error('Could not generate PDF. Use Print → Save as PDF instead.');
    } finally {
      setLoadingPdf(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handlePaymentReminder(channel: 'email' | 'sms') {
    const to = channel === 'email' ? invoice.customer_email : invoice.customer_phone;
    if (!to) { toast.error(channel === 'email' ? 'Add customer email first' : 'Add customer phone for SMS'); return; }
    setSendingReminder(channel);
    try {
      const invoiceUrl = typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoice.id}` : '';
      if (channel === 'email') {
        const res = await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            subject: `Payment reminder: Invoice #${invoice.invoice_number}`,
            html: `<p>Hi${invoice.customer_name ? ` ${invoice.customer_name}` : ''},</p><p>This is a friendly reminder that invoice #${invoice.invoice_number} (₦${Number(invoice.total).toLocaleString()}) is ${invoice.status === 'partial' ? 'partially paid' : 'outstanding'}.</p><p><a href="${invoiceUrl}">View & pay invoice</a></p><p>Thank you.</p>`,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
        toast.success('Payment reminder sent via email');
      } else {
        const msg = `Payment reminder: Invoice #${invoice.invoice_number} - ₦${Number(invoice.total).toLocaleString()} outstanding. Pay: ${invoiceUrl}`;
        const res = await fetch('/api/notifications/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: invoice.customer_phone, message: msg }) });
        if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
        toast.success('Payment reminder sent via SMS');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Notification not configured');
    } finally {
      setSendingReminder(null);
    }
  }

  async function handleSendEmail() {
    const to = invoice.customer_email;
    if (!to) { toast.error('Add customer email first'); return; }
    setSendingEmail(true);
    try {
      const res = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: `Invoice #${invoice.invoice_number} from Businesstool`,
          html: `<p>Hi${invoice.customer_name ? ` ${invoice.customer_name}` : ''},</p><p>Your invoice #${invoice.invoice_number} (Total: ₦${Number(invoice.total).toLocaleString()}) is ready.</p><p><a href="${invoiceUrl}">View invoice</a></p><p>Thank you.</p>`,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to send');
      toast.success('Invoice sent via email');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Email not configured. Use Share via Email instead.');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handlePrint}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Print / Save as PDF
      </button>
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={loadingPdf}
        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
      >
        {loadingPdf ? 'Generating…' : 'Download PDF'}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 border border-green-600 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
      >
        Share via WhatsApp
      </a>
      <button
        type="button"
        onClick={handleSendEmail}
        disabled={sendingEmail || !invoice.customer_email}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
        title={!invoice.customer_email ? 'Add customer email to send' : 'Send invoice by email'}
      >
        {sendingEmail ? 'Sending…' : 'Send via Email'}
      </button>
      <a
        href={`mailto:${invoice.customer_email || ''}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        title="Open your email client"
      >
        Open Email Client
      </a>
      {needsPayment && (
        <>
          <button type="button" onClick={() => handlePaymentReminder('email')} disabled={sendingReminder !== null || !invoice.customer_email} className="px-4 py-2 border border-amber-500 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50" title="Send payment reminder via email">
            {sendingReminder === 'email' ? 'Sending…' : 'Payment reminder (email)'}
          </button>
          <button type="button" onClick={() => handlePaymentReminder('sms')} disabled={sendingReminder !== null || !invoice.customer_phone} className="px-4 py-2 border border-amber-500 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50" title="Send payment reminder via SMS">
            {sendingReminder === 'sms' ? 'Sending…' : 'Payment reminder (SMS)'}
          </button>
        </>
      )}
    </div>
  );
}
