-- Add product and customer fields to sales (for product-based sales flow)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS quantity DECIMAL(12,2);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
