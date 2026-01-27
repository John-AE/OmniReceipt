-- Update the status check constraint to allow 'created', 'sent', and 'paid' statuses
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('created', 'sent', 'paid'));

-- Create admin user profiles view for the admin dashboard
-- First, let's create a view to see all user profiles with their auth info
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    p.id,
    p.user_id,
    p.artisan_name,
    p.business_name,
    p.phone,
    p.email,
    p.created_at,
    p.updated_at
FROM public.profiles p;

-- Create policy for admin access to view all users (we'll create an admin role system)
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND email = 'admin@demo.com'
    )
);

-- Allow admin to view all invoices
CREATE POLICY "Admin can view all invoices" 
ON public.invoices 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND email = 'admin@demo.com'
    )
);