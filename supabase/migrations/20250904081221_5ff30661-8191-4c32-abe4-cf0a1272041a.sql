-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.user_id = auth.uid() 
    AND p2.role = 'admin'
  )
);

-- Allow admins to view all invoices  
DROP POLICY IF EXISTS "Admin can view all invoices" ON public.invoices;
CREATE POLICY "Admin can view all invoices" 
ON public.invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Allow admins to view all receipts
DROP POLICY IF EXISTS "Admin can view all receipts" ON public.receipts;
CREATE POLICY "Admin can view all receipts" 
ON public.receipts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);