-- Add receipt-related columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS receipt_template_id INTEGER,
ADD COLUMN IF NOT EXISTS receipt_generated_at TIMESTAMP WITH TIME ZONE;

-- Add comment for the new columns
COMMENT ON COLUMN public.invoices.receipt_template_id IS 'ID of the receipt template used when generating receipt';
COMMENT ON COLUMN public.invoices.receipt_generated_at IS 'Timestamp when the receipt was generated';