-- Fix the security definer view issue by dropping it and using direct table access instead
DROP VIEW IF EXISTS public.admin_users_view;

-- The admin will access profiles table directly with the existing admin policies