import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Calendar, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
}

const SubscriptionDialog = ({ open, onOpenChange, currentPlan }: SubscriptionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateReference = () => {
    return 'ref_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  };

  const updateSubscriptionInDatabase = async (planType: string, transactionRef?: string) => {
    if (!user) return;

    const subscriptionExpiry = planType === 'free' ? null : 
      planType === 'monthly' ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: planType,
        subscription_expires: subscriptionExpiry,
        last_payment_reference: transactionRef || null,
        payment_verified: transactionRef ? true : false
      })
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const handleFreeDowngrade = async () => {
    setLoading(true);
    try {
      await updateSubscriptionInDatabase('free');
      
      toast({
        title: "Plan Updated",
        description: "You've been downgraded to the Free plan.",
      });

      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error downgrading plan:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const initiatePaystackPayment = async (planType: string, amount: number) => {
    // Paystack removed - Chargebee integration coming soon
    toast({
      title: "Payment Integration Coming Soon",
      description: "We're currently updating our payment system. Please check back soon.",
    });
  };

  const plans = [
    {
      name: 'Free',
      type: 'free',
      price: '₦0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 documents (invoices/receipts) per month',
        'Works on PC, Mac and Mobile',
        'Available Android App',
        'Archives for Invoices and Receipt',
        'Customer Contact Management',
        'Revenue Tracking / Usage Dashboard Analytics',
        '9 Invoice Templates and 2 Receipt Templates',
        'Email Support'
      ],
      current: currentPlan === 'free'
    },
    {
      name: 'Monthly',
      type: 'monthly',
      price: '₦2,000',
      period: 'per month',
      description: 'Great for small businesses',
      features: [
        'Unlimited documents (invoices/receipts) per month',
        'Works on PC, Mac and Mobile',
        'Available Android App',
        'Archives for Invoices and Receipt',
        'Customer Contact Management',
        'Revenue Tracking / Usage Dashboard Analytics',
        '12 Invoice Templates and 2 Receipt Templates',
        'Priority Support'
      ],
      current: currentPlan === 'monthly',
      popular: true
    },
    {
      name: 'Yearly',
      type: 'yearly',
      price: '₦20,000',
      period: 'per year',
      description: 'Best value for established businesses',
      features: [
        'Unlimited documents (invoices/receipts) per month',
        '2 months free',
        'Everything in monthly'
      ],
      current: currentPlan === 'yearly',
      savings: '₦4,000 saved yearly'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Subscription Plans
          </DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your business needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {plans.map((plan) => (
            <Card 
              key={plan.type}
              className={`relative ${plan.current ? 'ring-2 ring-primary' : ''} ${plan.popular ? 'border-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-3">
                  <Badge variant="secondary">Current Plan</Badge>
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

                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => {
                      if (plan.type === 'free') {
                        handleFreeDowngrade();
                      } else {
                        const amount = plan.type === 'monthly' ? 2000 : 20000;
                        initiatePaystackPayment(plan.type, amount);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 
                     plan.type === 'free' ? 'Downgrade' : 
                     currentPlan === 'free' ? 'Upgrade Now' : 'Switch Plan'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex-col space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            All plans include secure payment processing. Payment integration coming soon.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Prices are in Naira (₦). No setup fees or hidden charges.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;


