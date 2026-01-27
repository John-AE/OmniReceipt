-- Enable RLS on subscription_plans table
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view subscription plans (needed for pricing display)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete plans
CREATE POLICY "Admin can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());