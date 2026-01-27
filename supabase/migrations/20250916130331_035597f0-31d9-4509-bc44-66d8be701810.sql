-- Fix critical security vulnerability in receipt_items table
-- The admin policy was using 'true' condition which exposed all data to any authenticated user
-- This updates it to properly check if the user is actually an admin

DROP POLICY IF EXISTS "Admin can view all receipt items" ON public.receipt_items;

CREATE POLICY "Admin can view all receipt items" 
ON public.receipt_items 
FOR SELECT
USING (is_admin());