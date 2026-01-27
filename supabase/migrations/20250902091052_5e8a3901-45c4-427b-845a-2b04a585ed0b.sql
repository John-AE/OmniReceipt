-- Add roles and passcode to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('artisan', 'admin')) DEFAULT 'artisan',
ADD COLUMN IF NOT EXISTS passcode_hash TEXT;

-- Update existing users with roles based on email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'johnnybgsu@gmail.com';

UPDATE public.profiles 
SET role = 'artisan' 
WHERE email = 'artisan@demo.com';

-- Create function to authenticate with phone and passcode
CREATE OR REPLACE FUNCTION public.authenticate_with_phone_passcode(
  phone_number TEXT,
  passcode TEXT
)
RETURNS TABLE(user_id UUID, profile JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
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
  
  -- In a real implementation, you'd use a proper hash comparison
  -- For now, we'll store hashed passcodes using a simple method
  IF profile_record.passcode_hash = encode(digest(passcode, 'sha256'), 'hex') THEN
    RETURN QUERY SELECT 
      profile_record.user_id,
      to_jsonb(profile_record) - 'passcode_hash';
  END IF;
END;
$$;

-- Create function to set passcode (hashed)
CREATE OR REPLACE FUNCTION public.set_user_passcode(
  user_uuid UUID,
  passcode TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET passcode_hash = encode(digest(passcode, 'sha256'), 'hex')
  WHERE user_id = user_uuid;
  
  RETURN FOUND;
END;
$$;