import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Send, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import QuotationTemplateSelection from '@/components/QuotationTemplateSelection';
import { QuotationData, QuotationItem } from '@/utils/quotationRegistry';
import { PhoneInput } from '@/components/ui/phone-input';
import MetaSEO from '@/components/MetaSEO';
import { supportedCurrencies, Currency } from '@/utils/currencyConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuotationFormItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuotationForm {
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  taxRate: number;
  items: QuotationFormItem[];
  currency: string;
}

interface Profile {
  artisan_name: string;
  business_name: string;
  business_address: string;
  phone: string;
  subscription_type: string;
}

const CreateQuotation = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState<'form' | 'template'>('form');
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);

  // Calculate default valid until date (5 days from today)
  const getDefaultValidUntil = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().split('T')[0];
  };

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm<QuotationForm>({
    defaultValues: {
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: getDefaultValidUntil(),
      taxRate: 0,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      currency: 'USD'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");

  // Calculate totals
  const subTotal = watchedItems?.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0) || 0;

  const taxAmount = (subTotal * (watchedTaxRate || 0)) / 100;
  const totalAmount = subTotal + taxAmount;

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle pre-filled customer data from URL params
  useEffect(() => {
    const customerName = searchParams.get('customerName');
    const customerPhone = searchParams.get('customerPhone');
    const customerEmail = searchParams.get('customerEmail');
    
    if (customerName || customerPhone) {
      setValue('customerName', customerName || '');
      setValue('customerPhone', customerPhone || '');
      setValue('customerEmail', customerEmail || '');
    }
  }, [searchParams, setValue]);

  // Set default values from profile when available
  useEffect(() => {
    if (profile) {
      setValue('companyName', profile.business_name || profile.artisan_name);
      setValue('companyPhone', profile.phone || '');
      setValue('companyAddress', profile.business_address || '');
    }
  }, [profile, setValue]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('artisan_name, business_name, business_address, phone, subscription_type')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Profile error:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const onSubmit = async (data: QuotationForm) => {
    if (!user) return;

    // Generate quotation number if not provided
    const quotationNumber = data.quotationNumber || `QUO-${Date.now()}`;

    // Create quotation data for template preview
    const quotationData: QuotationData = {
      quotationNumber,
      quotationDate: data.quotationDate,
      validUntil: data.validUntil,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      companyName: data.companyName,
      companyPhone: data.companyPhone,
      companyAddress: data.companyAddress || undefined,
      items: data.items.map((item, index): QuotationItem => ({
        id: `item-${index}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      })),
      subTotal,
      taxRate: data.taxRate,
      totalAmount,
      currency: data.currency,
      locale: supportedCurrencies.find(c => c.code === data.currency)?.locale || 'en-US'
    };

    setQuotationData(quotationData);
    setCurrentStep('template');
  };

  const handleTemplateSelection = async (templateId: number) => {
    if (!user || !quotationData) return;

    setIsCreating(true);
    try {
      // Create the quotation record
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          user_id: user.id,
          customer_name: quotationData.customerName,
          customer_phone: quotationData.customerPhone,
          customer_email: quotationData.customerEmail || null,
          quotation_date: quotationData.quotationDate,
          valid_until: quotationData.validUntil,
          template_id: templateId,
          tax_rate: quotationData.taxRate,
          sub_total: quotationData.subTotal,
          amount: quotationData.totalAmount,
          status: 'created',
          service_description: 'Multiple items'
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const itemsToInsert = quotationData.items.map(item => ({
        quotation_id: quotation.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Quotation created successfully!",
        description: "Your quotation has been saved with the selected template",
      });
      
      reset();
      navigate('/dashboard');
    } catch (error) {
      console.error('Create quotation error:', error);
      toast({
        title: "Error creating quotation",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addItem = () => {
    append({ description: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setQuotationData(null);
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (currentStep === 'template' && quotationData) {
    return (
      <QuotationTemplateSelection
        quotationData={quotationData}
        onBack={handleBackToForm}
        onSelectTemplate={handleTemplateSelection}
        userSubscriptionType={profile?.subscription_type || 'free'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAC435]/5 via-background to-accent/5">
      <MetaSEO 
        title="Create Quotation" 
        description="Create professional quotations and estimates for your business. Set validity dates and share with customers via WhatsApp."
        canonicalPath="/create-quotation"
      />
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="p-2 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#EAC435]/20">
                <Logo size="md" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground">Create New Quotation</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {profile?.business_name || profile?.artisan_name || 'Your Business'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border-[#EAC435]/30">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Logo size="md" className="mr-2" />
              Quotation Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a professional quotation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Quotation Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-[#EAC435]/50 pb-2">
                  Quotation Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quotationNumber">Quotation Number</Label>
                    <Input
                      id="quotationNumber"
                      type="text"
                      placeholder="Auto-generated"
                      className="h-12 text-base"
                      {...register('quotationNumber')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quotationDate">Quotation Date *</Label>
                    <Input
                      id="quotationDate"
                      type="date"
                      className="h-12 text-base"
                      {...register('quotationDate', { required: 'Quotation date is required' })}
                    />
                    {errors.quotationDate && (
                      <p className="text-sm text-destructive">{errors.quotationDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      className="h-12 text-base"
                      {...register('validUntil', { required: 'Valid until date is required' })}
                    />
                    {errors.validUntil && (
                      <p className="text-sm text-destructive">{errors.validUntil.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select onValueChange={(value) => setValue('currency', value)} defaultValue="USD">
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency: Currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Your Company */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-[#EAC435]/50 pb-2">
                  Your Company
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Name *</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Company or artisan name"
                      className="h-12 text-base"
                      defaultValue={profile?.business_name || profile?.artisan_name || ''}
                      {...register('companyName', { required: 'Company name is required' })}
                    />
                    {errors.companyName && (
                      <p className="text-sm text-destructive">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <PhoneInput
                      label="Company Phone"
                      required
                      value={watch('companyPhone')}
                      onChange={(value) => setValue('companyPhone', value)}
                      currency={watch('currency')}
                    />
                    {errors.companyPhone && (
                      <p className="text-sm text-destructive">{errors.companyPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    type="text"
                    placeholder="Company address"
                    className="h-12 text-base"
                    {...register('companyAddress')}
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-[#EAC435]/50 pb-2">
                  Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      placeholder="Enter customer's full name"
                      className="h-12 text-base"
                      {...register('customerName', { required: 'Customer name is required' })}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <PhoneInput
                      label="Customer Phone"
                      required
                      value={watch('customerPhone')}
                      onChange={(value) => setValue('customerPhone', value)}
                      currency={watch('currency')}
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@email.com"
                    className="h-12 text-base"
                    {...register('customerEmail')}
                  />
                </div>
              </div>

              {/* Item Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Item Details
                  </h3>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={addItem}
                    className="flex items-center gap-2 bg-[#EAC435] text-black font-bold hover:bg-[#EAC435]/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-[#EAC435]/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor={`items.${index}.description`}>Description *</Label>
                          <Input
                            placeholder="Item description"
                            className="h-12 text-base"
                            {...register(`items.${index}.description` as const, { required: true })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            className="h-12 text-base"
                            {...register(`items.${index}.quantity` as const, { 
                              required: true, 
                              valueAsNumber: true,
                              min: 1 
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.unitPrice`}>
                            Unit Price ({supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}) *
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-12 text-base"
                            {...register(`items.${index}.unitPrice` as const, { 
                              required: true, 
                              valueAsNumber: true,
                              min: 0 
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Rate */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-[#EAC435]/50 pb-2">
                  Tax Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="h-12 text-base"
                      {...register('taxRate', { valueAsNumber: true, min: 0, max: 100 })}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#EAC435]/10 border border-[#EAC435]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{subTotal.toLocaleString()}</span>
                  </div>
                  {watchedTaxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({watchedTaxRate}%):</span>
                      <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-[#EAC435]/50">
                    <span>Total:</span>
                    <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-[#EAC435] text-black hover:bg-[#EAC435]/90 font-bold"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Continue to Template Selection
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateQuotation;


