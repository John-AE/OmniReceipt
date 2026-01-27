-- Fix admin authorization inconsistency
-- Update is_admin function to use the correct admin email consistently
-- Currently there's inconsistency between 'admin@demo.com' and 'johnnybgsu@gmail.com'

DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'johnnybgsu@gmail.com'
  );
END;
$function$;

-- Update all RLS policies to use consistent admin check
-- Fix profiles admin policy to use the function instead of direct JWT check
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT
USING (is_admin());

-- Fix invoices admin policy to use the function
DROP POLICY IF EXISTS "Admin can view all invoices" ON public.invoices;

CREATE POLICY "Admin can view all invoices" 
ON public.invoices 
FOR SELECT
USING (is_admin());

-- Fix receipts admin policy to use the function  
DROP POLICY IF EXISTS "Admin can view all receipts" ON public.receipts;

CREATE POLICY "Admin can view all receipts" 
ON public.receipts 
FOR SELECT
USING (is_admin());