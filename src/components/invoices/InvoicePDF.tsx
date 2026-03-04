import {
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// POS receipt size: 57mm width, 200mm height (content flows to next page if longer)
const MM_TO_PT = 2.83465;
const RECEIPT_WIDTH_PT = Math.round(57 * MM_TO_PT);   // 57mm
const RECEIPT_HEIGHT_PT = Math.round(200 * MM_TO_PT); // 200mm (~567pt)

const styles = StyleSheet.create({
  page: { padding: 8, fontSize: 7, fontFamily: 'Helvetica' },
  header: { marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  logoWrap: { width: 36, height: 22 },
  logo: { width: 36, height: 22, objectFit: 'contain' },
  headerText: { flex: 1 },
  title: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  meta: { fontSize: 6, color: '#64748b', marginBottom: 1 },
  section: { marginBottom: 6 },
  sectionTitle: { fontSize: 7, fontWeight: 'bold', marginBottom: 3 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 3, fontWeight: 'bold', fontSize: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 3, fontSize: 6 },
  colDesc: { flex: 1, paddingRight: 3, maxWidth: 58 },
  colQty: { width: 16, textAlign: 'right', paddingRight: 3 },
  colPrice: { width: 28, textAlign: 'right', paddingRight: 3 },
  colTotal: { width: 30, textAlign: 'right' },
  totals: { marginTop: 8, width: '100%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 2 },
  totalLabel: { color: '#64748b', fontSize: 6 },
  totalValue: { fontWeight: 'bold', fontSize: 7 },
  footer: { marginTop: 12, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0', fontSize: 5, color: '#94a3b8', textAlign: 'center' },
});

interface InvoicePDFProps {
  invoice: {
    invoice_number: string;
    type: string;
    status: string;
    business_name: string | null;
    business_logo_url: string | null;
    business_address: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    issue_date: string;
    due_date: string | null;
    items: { description: string; quantity: number; unit_price: number; total: number }[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_type: string | null;
    discount_value: number;
    total: number;
    amount_paid: number;
    notes: string | null;
  };
  showBranding?: boolean;
}

export function InvoicePDF({ invoice, showBranding = true }: InvoicePDFProps) {
  const typeLabel = invoice.type === 'receipt' ? 'Receipt' : 'Invoice';
  const logoUrl = invoice.business_logo_url?.trim() || null;

  return (
    <Page size={[RECEIPT_WIDTH_PT, RECEIPT_HEIGHT_PT]} style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {logoUrl ? (
            <View style={styles.logoWrap}>
              <Image src={logoUrl} style={styles.logo} />
            </View>
          ) : null}
          <View style={styles.headerText}>
            <Text style={styles.title}>{invoice.business_name || 'Business'}</Text>
            {invoice.business_address ? (
              <Text style={styles.meta}>{invoice.business_address}</Text>
            ) : null}
            <Text style={styles.meta}>
              {typeLabel} #{invoice.invoice_number} · {invoice.status}
            </Text>
            <Text style={styles.meta}>
              Issue date: {new Date(invoice.issue_date).toLocaleDateString()}
              {invoice.due_date ? ` · Due: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}
            </Text>
          </View>
        </View>
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill to</Text>
          <Text>{invoice.customer_name || '—'}</Text>
          {invoice.customer_email ? <Text style={styles.meta}>{invoice.customer_email}</Text> : null}
          {invoice.customer_phone ? <Text style={styles.meta}>{invoice.customer_phone}</Text> : null}
          {invoice.customer_address ? <Text style={styles.meta}>{invoice.customer_address}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>₦{Number(item.unit_price).toLocaleString()}</Text>
              <Text style={styles.colTotal}>₦{Number(item.total).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₦{Number(invoice.subtotal).toLocaleString()}</Text>
          </View>
          {invoice.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
              <Text style={styles.totalValue}>₦{Number(invoice.tax_amount).toLocaleString()}</Text>
            </View>
          )}
          {invoice.discount_value > 0 && (() => {
            const afterTax = Number(invoice.subtotal) + Number(invoice.tax_amount);
            const discountAmount = invoice.discount_type === 'percent'
              ? (afterTax * Number(invoice.discount_value)) / 100
              : Number(invoice.discount_value);
            return (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount {invoice.discount_type === 'percent' ? `(${invoice.discount_value}%)` : ''}
                </Text>
                <Text style={styles.totalValue}>-₦{discountAmount.toLocaleString()}</Text>
              </View>
            );
          })()}
          <View style={[styles.totalRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{Number(invoice.total).toLocaleString()}</Text>
          </View>
          {(invoice.amount_paid ?? 0) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount paid</Text>
              <Text style={styles.totalValue}>₦{Number(invoice.amount_paid).toLocaleString()}</Text>
            </View>
          )}
        </View>

        {invoice.notes ? (
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

      {showBranding ? (
        <View style={styles.footer} fixed>
          <Text>Generated by Businesstool · Small Business Tools</Text>
        </View>
      ) : null}
    </Page>
  );
}
