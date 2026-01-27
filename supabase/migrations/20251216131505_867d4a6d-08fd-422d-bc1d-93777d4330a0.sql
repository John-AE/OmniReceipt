-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quotation_number TEXT NOT NULL DEFAULT (('QUO-' || to_char(now(), 'YYYYMMDD') || '-') || lpad((floor((random() * 10000)))::text, 4, '0')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '5 days'),
  template_id INTEGER DEFAULT 1,
  sub_total NUMERIC DEFAULT 0.00,
  tax_rate NUMERIC DEFAULT 0.00,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  service_description TEXT NOT NULL,
  quotation_jpeg_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Users can view their own quotations" 
ON public.quotations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotations" 
ON public.quotations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations" 
ON public.quotations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations" 
ON public.quotations 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all quotations" 
ON public.quotations 
FOR SELECT 
USING ((auth.jwt() ->> 'email') = 'johnnybgsu@gmail.com');

-- RLS Policies for quotation_items
CREATE POLICY "Users can view their own quotation items" 
ON public.quotation_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM quotations 
  WHERE quotations.id = quotation_items.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can create their own quotation items" 
ON public.quotation_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM quotations 
  WHERE quotations.id = quotation_items.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can update their own quotation items" 
ON public.quotation_items 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM quotations 
  WHERE quotations.id = quotation_items.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own quotation items" 
ON public.quotation_items 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM quotations 
  WHERE quotations.id = quotation_items.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Admin can view all quotation items" 
ON public.quotation_items 
FOR SELECT 
USING (is_admin());

-- Update the check_usage_limit function to include quotations
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid uuid, item_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
  current_month_start DATE;
  monthly_invoice_count INTEGER;
  monthly_receipt_count INTEGER;
  monthly_quotation_count INTEGER;
  total_monthly_docs INTEGER;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- If paid subscription, no limits
  IF user_profile.subscription_type != 'free' THEN
    RETURN true;
  END IF;
  
  -- Calculate current month's start
  current_month_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  -- Count documents for current month
  SELECT COUNT(*) INTO monthly_invoice_count
  FROM public.invoices
  WHERE user_id = user_uuid AND created_at >= current_month_start;
  
  SELECT COUNT(*) INTO monthly_receipt_count
  FROM public.receipts
  WHERE user_id = user_uuid AND created_at >= current_month_start;
  
  SELECT COUNT(*) INTO monthly_quotation_count
  FROM public.quotations
  WHERE user_id = user_uuid AND created_at >= current_month_start;
  
  total_monthly_docs := monthly_invoice_count + monthly_receipt_count + monthly_quotation_count;
  
  -- Check limits for free users (3 documents per month total)
  RETURN total_monthly_docs < 3;
END;
$$;

-- Create trigger for automatic timestamp updates on quotations
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on quotation_items
CREATE TRIGGER update_quotation_items_updated_at
BEFORE UPDATE ON public.quotation_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();