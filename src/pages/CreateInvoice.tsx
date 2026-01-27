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
import TemplateSelection from '@/components/TemplateSelection';
import { InvoiceData, InvoiceItem } from '@/utils/templateRegistry';
import { PhoneInput } from '@/components/ui/phone-input';
import MetaSEO from '@/components/MetaSEO';
import { supportedCurrencies, Currency } from '@/utils/currencyConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceFormItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceForm {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  taxRate: number;
  items: InvoiceFormItem[];
  currency: string;
}

interface Profile {
  artisan_name: string;
  business_name: string;
  business_address: string;
  phone: string;
  subscription_type: string;
}

const CreateInvoice = () => {
  // All hooks must be called before any early returns
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState<'form' | 'template'>('form');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm<InvoiceForm>({
    defaultValues: {
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentDate: '',
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

  // ALL useEffect hooks must be before any early returns
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle pre-filled customer data from URL params (for repeat customers)
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

  // Define fetchProfile function before early returns
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

  // Define ALL other functions that use hooks before early returns
  const onSubmit = async (data: InvoiceForm) => {
    if (!user) return;

    // Generate invoice number if not provided
    const invoiceNumber = data.invoiceNumber || `INV-${Date.now()}`;

    // Create invoice data for template preview
    const invoiceData: InvoiceData = {
      invoiceNumber,
      invoiceDate: data.invoiceDate,
      paymentDate: data.paymentDate || undefined,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      companyName: data.companyName,
      companyPhone: data.companyPhone,
      companyAddress: data.companyAddress || undefined,
      items: data.items.map((item, index): InvoiceItem => ({
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

    setInvoiceData(invoiceData);
    setCurrentStep('template');
  };

  const handleTemplateSelection = async (templateId: number) => {
    if (!user || !invoiceData) return;

    setIsCreating(true);
    try {
      // Create the invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          record_type: 'invoice', // Add this line
          customer_name: invoiceData.customerName,
          customer_phone: invoiceData.customerPhone,
          customer_email: invoiceData.customerEmail || null,
          invoice_date: invoiceData.invoiceDate,
          payment_date: invoiceData.paymentDate || null,
          template_id: templateId,
          tax_rate: invoiceData.taxRate,
          sub_total: invoiceData.subTotal,
          amount: invoiceData.totalAmount,
          status: 'created',
          service_description: 'Multiple items' // Legacy field
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Invoice created successfully!",
        description: "Your invoice has been saved with the selected template",
      });
      
      reset();
      navigate('/dashboard');
    } catch (error) {
      console.error('Create invoice error:', error);
      toast({
        title: "Error creating invoice",
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
    setInvoiceData(null);
  };

  // Redirect if not authenticated (after all hooks are called)
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

  if (currentStep === 'template' && invoiceData) {
    return (
      <TemplateSelection
        invoiceData={invoiceData}
        onBack={handleBackToForm}
        onSelectTemplate={handleTemplateSelection}
        userSubscriptionType={profile?.subscription_type || 'free'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <MetaSEO 
        title="Create Invoice" 
        description="Create professional invoices for your Nigerian business. Add itemized details, apply tax, and share instantly via WhatsApp."
        canonicalPath="/create-invoice"
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
              <div className="p-2 rounded-lg bg-background">
                <Logo size="md" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-foreground">Create New Invoice</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {profile?.business_name || profile?.artisan_name || 'Your Business'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Logo size="md" className="mr-2" />
              Invoice Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a professional invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Invoice Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  Invoice Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      type="text"
                      placeholder="Auto-generated"
                      className="h-12 text-base"
                      {...register('invoiceNumber')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      className="h-12 text-base"
                      {...register('invoiceDate', { required: 'Invoice date is required' })}
                    />
                    {errors.invoiceDate && (
                      <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      className="h-12 text-base"
                      {...register('paymentDate')}
                    />
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
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
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
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
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
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-border/50 rounded-lg p-4 space-y-4">
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
                            className="h-10"
                            {...register(`items.${index}.description` as const, {
                              required: 'Description is required'
                            })}
                          />
                          {errors.items?.[index]?.description && (
                            <p className="text-sm text-destructive">
                              {errors.items[index]?.description?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="1"
                            className="h-10"
                            {...register(`items.${index}.quantity` as const, {
                              required: 'Quantity is required',
                              min: { value: 1, message: 'Quantity must be at least 1' },
                              valueAsNumber: true
                            })}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-sm text-destructive">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.unitPrice`}>
                            Unit Price ({supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}) *
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="h-10"
                            {...register(`items.${index}.unitPrice` as const, {
                              required: 'Unit price is required',
                              min: { value: 0.01, message: 'Price must be greater than 0' },
                              valueAsNumber: true
                            })}
                          />
                          {errors.items?.[index]?.unitPrice && (
                            <p className="text-sm text-destructive">
                              {errors.items[index]?.unitPrice?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total: {supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  Totals
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      className="h-12 text-base"
                      {...register('taxRate', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{subTotal.toLocaleString()}</span>
                    </div>
                    {watchedTaxRate > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax ({watchedTaxRate}%):</span>
                        <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>{supportedCurrencies.find(c => c.code === watch('currency'))?.symbol || '$'}{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isCreating ? "Processing..." : "Continue to Template Selection"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateInvoice;


