import { Link } from 'react-router-dom';
import { Check, Calendar, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MetaSEO from '@/components/MetaSEO';
import SiteFooter from '@/components/SiteFooter';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      type: 'free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 documents (invoices/receipts) per month',
        '9 Invoice Templates and 2 Receipt Templates',
        'Works on PC, Mac and Mobile',
        'Available Android App',
        'Archives for Invoices and Receipt',
        'Customer Contact Management',
        'Revenue Tracking / Usage Dashboard Analytics',
        'Email Support'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Monthly',
      type: 'monthly',
      price: '$5',
      period: 'per month',
      description: 'Great for small businesses',
      features: [
        'Unlimited documents (invoices/receipts) per month',
        '12 Invoice Templates and 2 Receipt Templates',
        'Works on PC, Mac and Mobile',
        'Available Android App',
        'Archives for Invoices and Receipt',
        'Customer Contact Management',
        'Revenue Tracking / Usage Dashboard Analytics',
        'Priority Support'
      ],
      buttonText: 'Choose Monthly',
      popular: true
    },
    {
      name: 'Yearly',
      type: 'yearly',
      price: '$50',
      period: 'per year',
      description: 'Best value for established businesses',
      features: [
        'Unlimited documents (invoices/receipts) per month',
        '2 months free',
        'Everything in monthly',
        '$10 saved yearly'
      ],
      buttonText: 'Choose Yearly',
      popular: false,
      savings: '$10 saved yearly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <MetaSEO
        title="Pricing - Subscription Plans"
        description="Choose the perfect plan for your business. Free, Monthly, and Yearly options available."
        canonicalPath="/pricing"
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="font-poppins font-bold text-foreground text-xl">OmniReceipts</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/pricing" className="text-primary font-medium">Pricing</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.type}
                className={`relative ${
                  plan.popular 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : ''
                } hover:shadow-xl transition-shadow duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    {plan.type === 'monthly' && <Calendar className="h-5 w-5" />}
                    {plan.type === 'yearly' && <Zap className="h-5 w-5" />}
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <div className="text-sm text-green-600 font-medium mt-2">
                      {plan.savings}
                    </div>
                  )}
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Notice */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Secure payment processing coming soon. All plans include a 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">All Plans Include</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium">No Setup Fees</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium">Cancel Anytime</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium">Instant Access</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm">
                We'll soon accept all major credit cards, debit cards, and bank transfers through our secure payment partners.
              </p>
            </div>
            <div className="bg-background rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm">
                Our Free plan gives you 3 documents per month forever. Try it out before upgrading to unlimited access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using OmniReceipts
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-12 px-8 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <SiteFooter />
    </div>
  );
};

export default Pricing;
