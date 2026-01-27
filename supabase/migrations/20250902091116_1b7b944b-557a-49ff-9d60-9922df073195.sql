-- Fix function search path security issues
DROP FUNCTION IF EXISTS public.authenticate_with_phone_passcode(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.set_user_passcode(UUID, TEXT);

-- Recreate function to authenticate with phone and passcode with proper search path
CREATE OR REPLACE FUNCTION public.authenticate_with_phone_passcode(
  phone_number TEXT,
  passcode TEXT
)
RETURNS TABLE(user_id UUID, profile JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Find profile with matching phone and verify passcode
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE phone = phone_number 
  AND passcode_hash IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Verify passcode hash
  IF profile_record.passcode_hash = encode(digest(passcode, 'sha256'), 'hex') THEN
    RETURN QUERY SELECT 
      profile_record.user_id,
      to_jsonb(profile_record) - 'passcode_hash';
  END IF;
END;
$$;

-- Recreate function to set passcode with proper search path
CREATE OR REPLACE FUNCTION public.set_user_passcode(
  user_uuid UUID,
  passcode TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET passcode_hash = encode(digest(passcode, 'sha256'), 'hex')
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;