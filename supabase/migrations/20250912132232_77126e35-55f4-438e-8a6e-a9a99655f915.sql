-- Secure function to fetch profile email by phone for login flow
-- Bypasses RLS safely via SECURITY DEFINER and only returns non-sensitive fields
CREATE OR REPLACE FUNCTION public.get_profile_by_phone(phone_number text)
RETURNS TABLE(email text, phone text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := regexp_replace(phone_number, '\\s+', '', 'g');
  without_cc text;
BEGIN
  -- 1) Try exact match
  RETURN QUERY
  SELECT p.email, p.phone
  FROM public.profiles p
  WHERE p.phone = normalized
  LIMIT 1;
  IF FOUND THEN
    RETURN;
  END IF;

  -- 2) If starts with +234, try without and with leading 0
  IF normalized LIKE '+234%' THEN
    without_cc := substring(normalized from 5); -- remove '+234'

    RETURN QUERY
    SELECT p.email, p.phone
    FROM public.profiles p
    WHERE p.phone = without_cc
    LIMIT 1;
    IF FOUND THEN
      RETURN;
    END IF;

    RETURN QUERY
    SELECT p.email, p.phone
    FROM public.profiles p
    WHERE p.phone = '0' || without_cc
    LIMIT 1;
    IF FOUND THEN
      RETURN;
    END IF;

  ELSE
    -- 3) If starts with 0, try +234 variant
    IF normalized LIKE '0%' THEN
      without_cc := substring(normalized from 2);

      RETURN QUERY
      SELECT p.email, p.phone
      FROM public.profiles p
      WHERE p.phone = '+234' || without_cc
      LIMIT 1;
      IF FOUND THEN
        RETURN;
      END IF;

    ELSE
      -- 4) Otherwise try with +234 prefix
      RETURN QUERY
      SELECT p.email, p.phone
      FROM public.profiles p
      WHERE p.phone = '+234' || normalized
      LIMIT 1;
      IF FOUND THEN
        RETURN;
      END IF;

    END IF;
  END IF;
END;
$$;