-- Clean up partial_payments table: remove payment_method and notes, rename payment_reference to description
ALTER TABLE public.partial_payments DROP COLUMN IF EXISTS payment_method;
ALTER TABLE public.partial_payments DROP COLUMN IF EXISTS notes;
ALTER TABLE public.partial_payments RENAME COLUMN payment_reference TO description;

-- Drop remaining_balance from invoices as it can be calculated from amount - amount_paid
ALTER TABLE public.invoices DROP COLUMN IF EXISTS remaining_balance;