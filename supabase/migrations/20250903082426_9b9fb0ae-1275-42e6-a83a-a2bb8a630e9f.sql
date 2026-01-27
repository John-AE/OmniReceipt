-- Add usage tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN invoice_count integer DEFAULT 0 NOT NULL,
ADD COLUMN receipt_count integer DEFAULT 0 NOT NULL,
ADD COLUMN subscription_type text DEFAULT 'free' NOT NULL,
ADD COLUMN subscription_expires date NULL;

-- Set admin role for johnnybgsu@gmail.com 
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'johnnybgsu@gmail.com';

-- Create function to increment usage counts
CREATE OR REPLACE FUNCTION public.increment_invoice_count(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET invoice_count = invoice_count + 1
  WHERE user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_receipt_count(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET receipt_count = receipt_count + 1
  WHERE user_id = user_uuid;
END;
$$;

-- Create function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid uuid, item_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  -- Check limits for free users
  IF item_type = 'invoice' THEN
    RETURN user_profile.invoice_count < 10;
  ELSIF item_type = 'receipt' THEN
    RETURN user_profile.receipt_count < 10;
  END IF;
  
  RETURN false;
END;
$$;