-- Fix storage policies for logo uploads
-- First, ensure the invoices bucket allows logo uploads in logos/ folder

-- Create policy for logo uploads (users can upload logos to their own folder)
CREATE POLICY "Users can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'invoices' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Policy for users to view their own logos
CREATE POLICY "Users can view their own logos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'invoices' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Policy for users to update their own logos
CREATE POLICY "Users can update their own logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'invoices' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]::text
);

-- Policy for users to delete their own logos
CREATE POLICY "Users can delete their own logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'invoices' 
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.foldername(name))[2]::text
);