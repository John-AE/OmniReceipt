import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RecentReceipts from '@/components/RecentReceipts';
import RecentInvoices from '@/components/RecentInvoices';
import RecentQuotations from '@/components/RecentQuotations';
import { BarChart3, FileText, Receipt, TrendingUp, Plus, User, AlertTriangle, LogOut, Users, ClipboardList } from 'lucide-react';
import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import MetaSEO from "@/components/MetaSEO";
import { Link, useNavigate } from 'react-router-dom';

import CreateReceiptDialog from '@/components/CreateReceiptDialog';
import PaywallModal from '@/components/PaywallModal';

const Dashboard = () => {
  const { user, session, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Refs for scroll-to functionality
  const recentInvoicesRef = useRef<HTMLDivElement>(null);
  const recentReceiptsRef = useRef<HTMLDivElement>(null);
  const recentQuotationsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/auth', { replace: true });
    }
  }, [authLoading, session, navigate]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalReceipts: 0,
    totalQuotations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const [showCreateReceiptDialog, setShowCreateReceiptDialog] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, refreshTrigger]);

  const [currentMonthUsage, setCurrentMonthUsage] = useState(0);

  useEffect(() => {
    if (profile && user) {
      fetchCurrentMonthUsage();
    }
  }, [profile, user, refreshTrigger]);

  const fetchCurrentMonthUsage = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

      const [invoicesResponse, receiptsResponse, quotationsResponse] = await Promise.all([
        supabase
          .from('invoices')
          .select('id')
          .eq('user_id', user?.id)
          .gte('created_at', firstDayOfMonth)
          .lt('created_at', firstDayOfNextMonth),
        supabase
          .from('receipts')
          .select('id')
          .eq('user_id', user?.id)
          .gte('created_at', firstDayOfMonth)
          .lt('created_at', firstDayOfNextMonth),
        supabase
          .from('quotations')
          .select('id')
          .eq('user_id', user?.id)
          .gte('created_at', firstDayOfMonth)
          .lt('created_at', firstDayOfNextMonth)
      ]);

      const totalMonthlyUsage = (invoicesResponse.data?.length || 0) + (receiptsResponse.data?.length || 0) + (quotationsResponse.data?.length || 0);
      setCurrentMonthUsage(totalMonthlyUsage);
      const limitReached = profile?.subscription_type === 'free' && totalMonthlyUsage >= 3;
      setUsageLimitReached(limitReached);
      setShowPaywall(limitReached);
    } catch (error) {
      console.error('Error fetching monthly usage:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [invoicesResponse, receiptsResponse, quotationsResponse] = await Promise.all([
        supabase.from('invoices').select('amount, created_at').eq('user_id', user?.id),
        supabase.from('receipts').select('amount, created_at').eq('user_id', user?.id),
        supabase.from('quotations').select('id').eq('user_id', user?.id)
      ]);

      if (invoicesResponse.error) throw invoicesResponse.error;
      if (receiptsResponse.error) throw receiptsResponse.error;
      if (quotationsResponse.error) throw quotationsResponse.error;

      const invoices = invoicesResponse.data || [];
      const receipts = receiptsResponse.data || [];
      const quotations = quotationsResponse.data || [];

      const invoiceRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      const receiptRevenue = receipts.reduce((sum, rec) => sum + Number(rec.amount), 0);

      // Calculate this month's revenue
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const monthlyRevenue = invoices
        .filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear;
        })
        .reduce((sum, inv) => sum + Number(inv.amount), 0) +
        receipts
          .filter(rec => {
            const recDate = new Date(rec.created_at);
            return recDate.getMonth() === thisMonth && recDate.getFullYear() === thisYear;
          })
          .reduce((sum, rec) => sum + Number(rec.amount), 0);

      setStats({
        totalInvoices: invoices.length,
        totalReceipts: receipts.length,
        totalQuotations: quotations.length,
        totalRevenue: invoiceRevenue + receiptRevenue,
        monthlyRevenue: monthlyRevenue
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error loading statistics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const getUsageDisplay = () => {
    if (!profile) return "0 of 3 used this month";
    return profile.subscription_type === 'free'
      ? `${currentMonthUsage} of 3 used this month`
      : `${currentMonthUsage} used this month (unlimited)`;
  };

  // Show loading while auth is being determined or stats are loading
  if (authLoading || loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <MetaSEO title="Dashboard" description="Manage your invoices, receipts and quotations. Track business revenue and customer transactions with OmniReceipts dashboard." canonicalPath="/dashboard" />
      {/* Paywall Overlay */}
      {showPaywall && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
      )}

      <div className={showPaywall ? "pointer-events-none" : ""}>
        {/* Allow specific buttons to work even with paywall */}
        <style>
          {showPaywall ? `
            .paywall-allowed {
              pointer-events: auto !important;
            }
          ` : ''}
        </style>
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <div className="w-8 h-8 bg-primary rounded text-primary-foreground flex items-center justify-center font-bold text-sm">
                    NR
                  </div>
                </div>
                <span className="text-2xl font-poppins font-extrabold tracking-tight">OmniReceipts</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className={`flex items-center gap-1 p-2 h-auto ${showPaywall ? 'paywall-allowed' : ''}`}
              >
                <User className="h-6 w-6" />
                <span className="text-md">Me</span>
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate('/auth', { replace: true });
              }}
              size="sm"
              className={showPaywall ? 'paywall-allowed' : ''}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-['Roboto_Condensed'] mb-2">
              Welcome back, {profile?.artisan_name || 'Artisan'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your business today.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 mt-4 w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-[#EAC435] text-black hover:bg-[#EAC435]/90"
                disabled={usageLimitReached}
                onClick={() => !usageLimitReached && navigate('/create-quotation')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Create Quotation</span>
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={usageLimitReached}
                onClick={() => !usageLimitReached && navigate('/create-invoice')}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Create Invoice</span>
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white text-[#2B4162] border-2 border-[#2B4162] hover:bg-[#2B4162] hover:text-white font-semibold transition-all duration-200"
                disabled={usageLimitReached}
                onClick={() => setShowCreateReceiptDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Create Receipt</span>
              </Button>
              <Button
                className="w-full sm:w-auto bg-[#00A5CF] text-white hover:bg-[#0090B8] font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.open('https://taxestimator.OmniReceipts.com.ng', '_blank')}
              >
                <span className="text-xs sm:text-base leading-tight">Personal Tax Estimator</span>
              </Button>
            </div>
          </div>

          {/* Usage Limit Warning */}
          {usageLimitReached && (
            <div className="mb-6">
              <Card className="border-destructive bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-destructive">Usage limit reached</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You've reached your free plan limit of 3 documents (invoices, receipts, and quotations). Upgrade to continue creating documents.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card
              className="border-2 border-gray-200 shadow-md cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98]"
              onClick={() => scrollToSection(recentInvoicesRef)}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Total Invoices
                </CardTitle>
                <CardDescription>All time · Tap to view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalInvoices}</div>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-gray-200 shadow-md cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98]"
              onClick={() => scrollToSection(recentReceiptsRef)}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-purple-600" />
                  Total Receipts
                </CardTitle>
                <CardDescription>All time · Tap to view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalReceipts}</div>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-gray-200 shadow-md cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98]"
              onClick={() => scrollToSection(recentQuotationsRef)}
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-[#EAC435]" />
                  Total Quotations
                </CardTitle>
                <CardDescription>All time · Tap to view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalQuotations}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Total Revenue
                </CardTitle>
                <CardDescription>All time earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl lg:text-3xl font-semibold sm:font-bold text-primary break-words">₦{Math.floor(stats.totalRevenue).toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-orange-600" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>This month's earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl lg:text-3xl font-semibold sm:font-bold text-primary break-words">₦{Math.floor(stats.monthlyRevenue).toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                  Usage
                </CardTitle>
                <CardDescription>Documents created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{getUsageDisplay()}</div>
                {profile?.subscription_type === 'free' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((currentMonthUsage / 3) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Components */}
          <div className="space-y-6">
            <div ref={recentInvoicesRef} className="scroll-mt-20">
              <RecentInvoices onInvoiceUpdate={handleRefresh} />
            </div>
            <div ref={recentReceiptsRef} className="scroll-mt-20">
              <RecentReceipts onReceiptUpdate={handleRefresh} />
            </div>
            <div ref={recentQuotationsRef} className="scroll-mt-20">
              <RecentQuotations onQuotationUpdate={handleRefresh} />
            </div>

            {/* Customer Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage your customer database with detailed transaction history.
                </p>
                <Button
                  onClick={() => navigate('/customers')}
                  className="w-full sm:w-auto"
                >
                  <Users className="mr-2 h-4 w-4" />
                  View All Customers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div >

      <CreateReceiptDialog
        open={showCreateReceiptDialog}
        onOpenChange={setShowCreateReceiptDialog}
        onReceiptCreated={handleRefresh}
        onReceiptUpdate={handleRefresh}
      />

      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
      />
    </div >
  );
};

export default Dashboard;


