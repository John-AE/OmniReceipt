-- Update the handle_new_user function to include business_name and business_address
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, artisan_name, business_name, business_address, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'artisan_name', 'Artisan'),
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'business_address', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;