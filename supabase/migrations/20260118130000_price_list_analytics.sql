-- Add views column to price_lists and ensure it has a default of 0
ALTER TABLE public.price_lists 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Ensure existing rows have 0 instead of NULL
UPDATE public.price_lists SET views = 0 WHERE views IS NULL;

-- Function to increment views
CREATE OR REPLACE FUNCTION public.increment_price_list_views(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.price_lists
  SET views = COALESCE(views, 0) + 1
  WHERE slug = p_slug;
END;
$$;

-- Grant execution permissions to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_price_list_views(text) TO anon, authenticated, service_role;
