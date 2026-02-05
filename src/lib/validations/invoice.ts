import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(0.001, 'Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price must be ≥ 0'),
  total: z.number().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  type: z.enum(['invoice', 'receipt']),
  customer_id: z.string().uuid().optional().nullable(),
  customer_name: z.string().optional().nullable(),
  customer_email: z.string().email().optional().nullable().or(z.literal('')),
  customer_phone: z.string().optional().nullable(),
  customer_address: z.string().optional().nullable(),
  business_name: z.string().optional().nullable(),
  business_logo_url: z.string().url().optional().nullable().or(z.literal('')),
  business_address: z.string().optional().nullable(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'At least one item required'),
  tax_rate: z.number().min(0).max(100).default(0),
  discount_type: z.enum(['fixed', 'percent']).optional().nullable(),
  discount_value: z.number().min(0).default(0),
  status: z.enum(['unpaid', 'partial', 'paid']).default('unpaid'),
  amount_paid: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
