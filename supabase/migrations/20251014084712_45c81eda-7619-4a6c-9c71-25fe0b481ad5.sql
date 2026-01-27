-- Create payment transactions table with UNIQUE reference constraint
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  paystack_response JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create subscription plans table for amount validation
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  plan_type TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT
);

-- Insert valid plan amounts
INSERT INTO public.subscription_plans (plan_type, amount, duration_days, description) VALUES
  ('monthly', 2000, 30, 'Monthly subscription'),
  ('yearly', 20000, 365, 'Yearly subscription')
ON CONFLICT (plan_type) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();