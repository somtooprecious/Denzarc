-- Link invoices to customers for purchase history
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
