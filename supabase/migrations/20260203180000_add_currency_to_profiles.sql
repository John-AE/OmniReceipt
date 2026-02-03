-- Add currency column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
-- Update existing records to have USD as default currency
UPDATE public.profiles
SET currency = 'USD'
WHERE currency IS NULL;
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON public.profiles(currency);