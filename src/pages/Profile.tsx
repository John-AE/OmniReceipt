import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { User, Building, Phone, Mail, Crown, CreditCard, Palette } from 'lucide-react';
import SubscriptionDialog from '@/components/SubscriptionDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNavigate } from 'react-router-dom';
import RecentPriceList from '@/components/RecentPriceList';
import MetaSEO from '@/components/MetaSEO';

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [formData, setFormData] = useState({
    artisan_name: '',
    business_name: '',
    business_address: '',
    phone: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFormData({
        artisan_name: profile.artisan_name || '',
        business_name: profile.business_name || '',
        business_address: profile.business_address || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          artisan_name: formData.artisan_name,
          business_name: formData.business_name,
          business_address: formData.business_address,
          phone: formData.phone,
          last_payment_reference: profile?.last_payment_reference || null,
          payment_verified: profile?.payment_verified || false
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const [currentMonthUsage, setCurrentMonthUsage] = useState(0);

  useEffect(() => {
    if (user && profile) {
      fetchCurrentMonthUsage();
    }
  }, [user, profile]);

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
    } catch (error) {
      console.error('Error fetching monthly usage:', error);
    }
  };

  const getUsagePercentage = () => {
    return profile?.subscription_type === 'free' ? (currentMonthUsage / 3) * 100 : 0;
  };

  const getSubscriptionBadgeVariant = () => {
    switch (profile?.subscription_type) {
      case 'monthly': return 'default';
      case 'yearly': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">Loading profile...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MetaSEO 
        title="Profile Settings" 
        description="Manage your OmniReceipts profile, business information, and subscription settings. Update your business name, address, and contact details."
        canonicalPath="/profile"
      />
      {/* Top Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto"
        >
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            // Reset form to original values
            if (profile) {
              setFormData({
                artisan_name: profile.artisan_name || '',
                business_name: profile.business_name || '',
                business_address: profile.business_address || '',
                phone: profile.phone || '',
                email: profile.email || ''
              });
            }
          }}
          className="w-full sm:w-auto"
        >
          Cancel Changes
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#6A4C93] hover:bg-[#5A3E82] w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Profile Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subscription Status */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Subscription Status</span>
                  <Badge variant={getSubscriptionBadgeVariant()}>
                    {profile?.subscription_type === 'free' ? 'Free Plan' :
                      profile?.subscription_type === 'monthly' ? 'Monthly Plan' :
                        profile?.subscription_type === 'yearly' ? 'Yearly Plan' : 'Free Plan'}
                  </Badge>
                </div>

                {profile?.subscription_type === 'free' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Usage</span>
                      <span>
                        {profile?.subscription_type === 'free'
                          ? `${currentMonthUsage} of 3 used this month`
                          : `${currentMonthUsage} used this month (unlimited)`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                      />
                    </div>
                    {profile?.subscription_type === 'free' && getUsagePercentage() > 80 && (
                      <p className="text-sm text-destructive mt-2">
                        You're approaching your monthly limit. Consider upgrading to continue creating invoices and receipts.
                      </p>
                    )}
                  </div>
                )}

                {/* Subscription Management Button */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSubscriptionDialogOpen(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {profile?.subscription_type === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </div>

                {profile?.role === 'admin' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Administrator</span>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="text-sm font-medium">Theme Preference</span>
                  </div>
                  <ThemeToggle />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose your preferred color scheme. System will match your device setting.
                </p>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artisan_name" className="font-bold">Artisan Name *</Label>
                  <Input
                    id="artisan_name"
                    value={formData.artisan_name}
                    onChange={(e) => handleInputChange('artisan_name', e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name" className="font-bold">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Your business name"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="business_address" className="font-bold">Business Address</Label>
                  <Input
                    id="business_address"
                    value={formData.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    placeholder="123 Market Street, Lagos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">Email Address</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>


              {/* Feedback Section */}
              <div className="space-y-2">
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#B4656F20' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Help Us Improve</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have feedback, complaints, or suggestions? We'd love to hear from you!
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://tally.so/r/wzVXq1', '_blank')}
                    className="w-full flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Customer Care
                  </Button>
                </div>
              </div>


            </CardContent>
          </Card>
        </div>

        {/* Right Column: Price List Management */}
        <div className="space-y-6">
          <RecentPriceList />
        </div>
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        currentPlan={profile?.subscription_type || 'free'}
      />
    </div>
  );
};

export default Profile;


