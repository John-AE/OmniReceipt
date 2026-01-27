
-- Update the invoices table to use the correct column names
-- The invoice_jpeg_url and receipt_jpeg_url columns already exist based on your schema
-- Just need to create the storage bucket for invoices

-- Create storage bucket for invoices and receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true);

-- Create RLS policies for the invoices bucket
CREATE POLICY "Users can upload their own invoice files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own invoice files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own invoice files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own invoice files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'invoices' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
