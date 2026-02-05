import type { Plan } from '@/lib/plan';

export interface Profile {
  id: string;
  clerk_user_id?: string | null;
  email: string;
  full_name: string | null;
  business_name: string | null;
  business_address: string | null;
  business_logo_url: string | null;
  phone?: string | null;
  plan: Plan;
  subscription_start: string | null;
  subscription_end: string | null;
  invoice_count_this_month: number;
  invoice_count_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  type: 'invoice' | 'receipt';
  status: 'unpaid' | 'partial' | 'paid';
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  business_name: string | null;
  business_logo_url: string | null;
  business_address: string | null;
  issue_date: string;
  due_date: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: 'fixed' | 'percent' | null;
  discount_value: number;
  total: number;
  amount_paid: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  sale_date: string;
  amount: number;
  payment_type: 'cash' | 'transfer' | 'other';
  description: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  expense_date: string;
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}
