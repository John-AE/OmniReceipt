-- Update the check_usage_limit function to use 3 documents per month for free tier
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid uuid, item_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- If paid subscription, no limits
  IF user_profile.subscription_type != 'free' THEN
    RETURN true;
  END IF;
  
  -- Check limits for free users (3 documents per month)
  IF item_type = 'invoice' THEN
    RETURN user_profile.invoice_count < 3;
  ELSIF item_type = 'receipt' THEN
    RETURN user_profile.receipt_count < 3;
  END IF;
  
  RETURN false;
END;
$$;