-- Drop the existing function first to allow return type change
DROP FUNCTION IF EXISTS public.get_all_profiles_admin();

-- Recreate the function with the new referral_source column
CREATE OR REPLACE FUNCTION public.get_all_profiles_admin()
 RETURNS TABLE(id uuid, user_id uuid, business_name text, artisan_name text, phone text, email text, logo_url text, created_at timestamp with time zone, updated_at timestamp with time zone, role text, passcode_hash text, invoice_count integer, receipt_count integer, subscription_type text, subscription_expires timestamp with time zone, referral_source text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN QUERY
    SELECT p.id, p.user_id, p.business_name, p.artisan_name, p.phone, p.email, p.logo_url, p.created_at, p.updated_at, p.role, p.passcode_hash, p.invoice_count, p.receipt_count, p.subscription_type, p.subscription_expires, p.referral_source
    FROM profiles p
    ORDER BY p.created_at DESC;
  ELSE
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
END;
$function$;

-- Update the handle_new_user trigger function to include referral_source
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, artisan_name, business_name, business_address, phone, email, referral_source)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'artisan_name', 'Artisan'),
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'business_address', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'referral_source', '')
  );
  RETURN NEW;
END;
$function$;