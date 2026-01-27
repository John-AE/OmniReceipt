-- Create a demo artisan user for testing
-- Note: This inserts directly into auth.users which is normally managed by Supabase
-- but this is for demo/testing purposes

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'artisan@demo.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated',
  '{"artisan_name": "Emeka Okonkwo", "phone": "+234 803 123 4567"}'::jsonb
);

-- Also insert a sample profile (this should be handled by the trigger, but just in case)
-- First get the user ID we just created
WITH demo_user AS (
  SELECT id FROM auth.users WHERE email = 'artisan@demo.com' LIMIT 1
)
INSERT INTO public.profiles (
  user_id,
  artisan_name,
  business_name,
  phone,
  email
) 
SELECT 
  demo_user.id,
  'Emeka Okonkwo',
  'Emeka''s Woodcraft',
  '+234 803 123 4567',
  'artisan@demo.com'
FROM demo_user
ON CONFLICT (user_id) DO NOTHING;

-- Create some sample invoices for the demo account
WITH demo_user AS (
  SELECT id FROM auth.users WHERE email = 'artisan@demo.com' LIMIT 1
)
INSERT INTO public.invoices (
  user_id,
  customer_name,
  customer_phone,
  customer_email,
  service_description,
  amount,
  invoice_date,
  status
)
SELECT 
  demo_user.id,
  customer_name,
  customer_phone,
  customer_email,
  service_description,
  amount,
  invoice_date,
  status
FROM demo_user,
(VALUES 
  ('Adunni Fashola', '+234 701 234 5678', 'adunni@email.com', 'Custom wooden dining table', 85000.00, '2024-01-15'::date, 'paid'),
  ('Chidi Amara', '+234 802 345 6789', 'chidi@email.com', 'Bedroom wardrobe set', 120000.00, '2024-01-18'::date, 'sent'),
  ('Fatima Ibrahim', '+234 805 456 7890', 'fatima@email.com', 'Kitchen cabinet installation', 95000.00, '2024-01-20'::date, 'paid'),
  ('Kemi Johnson', '+234 703 567 8901', 'kemi@email.com', 'Custom coffee table', 45000.00, '2024-01-22'::date, 'sent'),
  ('Tunde Bakare', '+234 806 678 9012', 'tunde@email.com', 'Office desk and chair', 75000.00, '2024-01-25'::date, 'paid')
) AS sample_data(customer_name, customer_phone, customer_email, service_description, amount, invoice_date, status);