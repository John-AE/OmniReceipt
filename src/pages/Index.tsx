import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Shield, Users, TrendingUp, Check, Calendar, Crown } from 'lucide-react';
import { AndroidDownloadModal } from '@/components/AndroidDownloadModal';
import MetaSEO from '@/components/MetaSEO';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import FAQSection from '@/pages/FAQSection';
import { AuthModal } from '@/components/AuthModal';

const Index = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle download button click - show modal and trigger download
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsDownloadModalOpen(true);

    // Trigger the actual download
    const link = document.createElement('a');
    link.href = 'https://www.OmniReceipts.com.ng/OmniReceipts.apk';
    link.download = 'OmniReceipts.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      ]
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
        'Everything in monthly'
      ],
      savings: '$10 saved yearly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <MetaSEO
        title="Professional Invoices, Receipts & 2025 Tax Calculator"
        description="Create professional invoices and receipts for free. Plus, calculate your 2025 Personal Income Tax (PIT) under the new Tax Act."
        canonicalPath="/"
      />
      <SiteHeader />

      {/* Hero Section */}
      <div id="home" className="relative overflow-hidden pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="p-4 bg-background shadow-lg">
                  <Logo size="3xl" />
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
                <span className="block font-poppins font-extrabold tracking-tight">OmniReceipts</span>
                <span className="text-2xl sm:text-3xl text-primary font-normal block mt-2">
                  Fast professional invoice and receipts app for entrepreneurs, small businesses, freelancers, everyone!
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl lg:max-w-none">
                Create beautiful invoices and receipts in seconds. Share via WhatsApp instantly.
                Perfect for entrepreneurs, craftsmen, and small business owners worldwide.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="https://www.OmniReceipts.com.ng/OmniReceipts.apk"
                  download="OmniReceipts.apk"
                  onClick={handleDownloadClick}
                  className="inline-block"
                >
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    Download Free Android App
                  </Button>
                </a>
                <Link to="/auth">
                  <Button variant="cta" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src="/mockup.png"
                  alt="OmniReceipts Mobile App Preview"
                  className="w-80 sm:w-96 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laptop Showcase Section */}
      <div className="py-24 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Works seamlessly on any device
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access your business dashboard from anywhere - desktop, laptop, tablet, or mobile.
              Track your invoices, receipts, and revenue with our responsive web application.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative max-w-5xl w-full">
              <img
                src="/laptop-mockup.png"
                alt="OmniReceipts Dashboard on Laptop"
                className="w-full h-auto drop-shadow-2xl rounded-lg"
              />
            </div>
          </div>

          {/* New Device Guidance Section */}
          <div className="mt-20">
            <h2 className="text-4xl font-extrabold text-foreground mb-12 text-center tracking-tight">
              Use <span className="text-primary font-poppins font-extrabold tracking-tight">OmniReceipts</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Desktop Option */}
              <div className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 flex flex-col items-center text-center transition-transform hover:scale-[1.02] duration-300">
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">
                  on my laptop / computer / mac / desktop
                </h3>
                <p className="text-muted-foreground mb-8">
                  Register now and start creating professional documents instantly on your big screen.
                </p>
                <div className="relative">
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    size="lg"
                    className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full animate-ripple relative z-10"
                  >
                    Register / Sign In
                  </Button>
                </div>
              </div>

              {/* Mobile Option */}
              <div className="bg-card p-8 rounded-2xl shadow-xl border border-primary/20 flex flex-col items-center text-center transition-transform hover:scale-[1.02] duration-300">
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-4">
                  use on my android phone
                </h3>
                <p className="text-muted-foreground mb-8">
                  Download our specialized Android app for the fastest experience on the go.
                </p>
                <div className="relative">
                  <a
                    href="https://www.OmniReceipts.com.ng/OmniReceipts.apk"
                    download="OmniReceipts.apk"
                    onClick={handleDownloadClick}
                    className="inline-block"
                  >
                    <Button
                      size="lg"
                      className="h-14 px-10 text-lg font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full animate-ripple relative z-10"
                    >
                      Download Android App
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="about" className="py-24 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to manage invoices and receipts
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, fast, and designed for mobile-first entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
              <p className="text-muted-foreground">
                Optimized for mobile devices. Create invoices and receipts on the go with large, easy-to-tap buttons.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create JPEG invoices and receipts, and share in under 1 minute. No complex forms or steps.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Integration</h3>
              <p className="text-muted-foreground">
                Share invoices and receipts instantly via WhatsApp. Perfect for business communication.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Templates</h3>
              <p className="text-muted-foreground">
                Beautiful, professional invoice and receipt templates that make your business stand out.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer History</h3>
              <p className="text-muted-foreground">
                Keep track of all your customers and transactions. For Existing customers, create new receipts or invoices faster anytime.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Insights</h3>
              <p className="text-muted-foreground">
                Track your earnings and see your business grow with simple analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to professionalize your business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of entrepreneurs using OmniReceipts to grow their business
          </p>
          <a
            href="https://www.OmniReceipts.com.ng/OmniReceipts.apk"
            download="OmniReceipts.apk"
            onClick={handleDownloadClick}
            className="inline-block"
          >
            <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              Start Creating Invoices and Receipts Now!
            </Button>
          </a>
        </div>
      </div>


      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Select the perfect plan for your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.type}
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
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
                    <div className="text-sm text-primary font-medium">{plan.savings}</div>
                  )}
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/auth">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.type === 'free' ? 'Get Started Free' : 'Choose Plan'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 space-y-2">
            <p className="text-sm text-muted-foreground">
              All plans include secure payment processing via{' '}
              <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Paystack
              </a>.
              You can change or cancel your subscription at any time.
            </p>
            <p className="text-xs text-muted-foreground">
              Prices are in US Dollars ($). No setup fees or hidden charges.
            </p>
          </div>
        </div>
      </div>

      {/* SEO Content Section - Visible text for crawlers with internal links */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Why Businesses Choose OmniReceipts
          </h2>
          <div className="prose prose-lg text-muted-foreground max-w-none space-y-4">
            <p>
              OmniReceipts is the leading invoice and receipt generator built for businesses worldwide.
              Whether you're an entrepreneur, freelancer, or small business owner, our platform helps you create
              professional documents in seconds. With tax authorities worldwide pushing for digital compliance,
              having proper documentation is more important than ever.
            </p>
            <p>
              Our app integrates with WhatsApp for instant sharing, supports multiple professional templates,
              and helps you track all your business transactions. Create your first{' '}
              <Link to="/create-invoice" className="text-primary hover:underline">invoice</Link> or{' '}
              <Link to="/dashboard" className="text-primary hover:underline">receipt</Link> today and join
              thousands of entrepreneurs already using OmniReceipts.
            </p>
            <p>
              Learn more about digital receipts and invoicing best practices from the{' '}
              <a href="https://www.pwc.com/ng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                PwC Global
              </a>{' '}
              or check the{' '}
              <a href="https://unstats.un.org/ sdgs/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                UN Statistics
              </a>{' '}
              for small business insights.
            </p>
          </div>
        </div>
      </section>

      <div id="faq">
        <FAQSection />
      </div>

      <SiteFooter />

      {/* Android Download Modal */}
      <AndroidDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signup"
      />
    </div>
  );
};

export default Index;


