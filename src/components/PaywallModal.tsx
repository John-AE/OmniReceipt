import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Calendar, Zap, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();

  const initiatePaystackPayment = async (planType: string, amount: number) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call our secure edge function instead of making direct API calls
      const { data, error } = await supabase.functions.invoke('initialize-payment', {
        body: {
          email: user.email,
          amount: amount,
          planType: planType
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to initialize payment');
      }

      if (data?.status && data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data?.error || 'Failed to get payment URL');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || 'Failed to initialize payment',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Monthly',
      type: 'monthly',
      price: '₦2,000',
      period: 'per month',
      description: 'Great for small businesses',
      features: [
        'Unlimited documents (invoices, receipts, and quotations) per month',
        '12 Invoice Templates and 2 Receipt Templates',
        'Works on PC, Mac and Mobile',
        'Available Android App',
        'Archives for Invoices and Receipt',
        'Customer Contact Management',
        'Revenue Tracking / Usage Dashboard Analytics',
        'Priority Support'
      ],
      popular: true
    },
    {
      name: 'Yearly',
      type: 'yearly',
      price: '₦20,000',
      period: 'per year',
      description: 'Best value for established businesses',
      features: [
        'Unlimited documents (invoices, receipts, and quotations) per month',
        '2 months free',
        'Everything in monthly'
      ],
      savings: '₦4,000 saved yearly'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Usage Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've reached your free plan limit of 3 documents this month. Choose a paid plan to continue creating invoices and receipts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {plans.map((plan) => (
            <Card 
              key={plan.type}
              className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.type === 'monthly' && <Calendar className="h-4 w-4" />}
                  {plan.type === 'yearly' && <Zap className="h-4 w-4" />}
                  {plan.name}
                </CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="text-sm text-green-600 font-medium">{plan.savings}</div>
                )}
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    const amount = plan.type === 'monthly' ? 2000 : 20000;
                    initiatePaystackPayment(plan.type, amount);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            All plans include secure payment processing via Paystack. 
            You can change or cancel your subscription at any time.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Prices are in Nigerian Naira (₦). No setup fees or hidden charges.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaywallModal;


