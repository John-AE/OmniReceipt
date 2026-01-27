-- Create invoice_items table to support multiple items per invoice
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_items
CREATE POLICY "Users can view their own invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own invoice items" 
ON public.invoice_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invoice items" 
ON public.invoice_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own invoice items" 
ON public.invoice_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.user_id = auth.uid()
  )
);

-- Admin can view all invoice items
CREATE POLICY "Admin can view all invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (is_admin());

-- Add template_id to invoices table
ALTER TABLE public.invoices 
ADD COLUMN template_id INTEGER DEFAULT 1,
ADD COLUMN payment_date DATE,
ADD COLUMN tax_rate NUMERIC DEFAULT 0.00,
ADD COLUMN sub_total NUMERIC DEFAULT 0.00;

-- Create function and trigger for automatic timestamp updates on invoice_items
CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();