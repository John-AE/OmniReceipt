import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/ui/phone-input';
import { Calendar, CalendarDays, Plus, X, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getReceipt, getAvailableReceipts } from '@/utils/receiptRegistry';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal } from '@/utils/invoiceCalculations';
import { supportedCurrencies, Currency } from '@/utils/currencyConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Item {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreateReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReceiptCreated: () => void;
  onReceiptUpdate?: () => void;
  prefillCustomer?: {
    name: string;
    phone: string;
    email?: string;
  };
}

const CreateReceiptDialog: React.FC<CreateReceiptDialogProps> = ({
  open,
  onOpenChange,
  onReceiptCreated,
  onReceiptUpdate,
  prefillCustomer,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'template'>('form');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    paymentDate: new Date(),
    serviceDescription: '',
    currency: 'USD',
  });

  const [items, setItems] = useState<Item[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  // Fetch profile data when dialog opens
 useEffect(() => {
  if (open && user) {
    fetchProfileData();
    
    // Prefill customer data if provided
    if (prefillCustomer) {
      setFormData(prev => ({
        ...prev,
        customerName: prefillCustomer.name,
        customerPhone: prefillCustomer.phone,
        customerEmail: prefillCustomer.email || '',
      }));
    }
  }
}, [open, user, prefillCustomer]);

  const fetchProfileData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('artisan_name, business_name, business_address, phone')
        .eq('user_id', user?.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          companyName: profile.business_name || profile.artisan_name || '',
          companyAddress: profile.business_address || '',
          companyPhone: profile.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0; // No tax for receipts typically
    const totalAmount = subTotal;
    
    return { subTotal, taxRate, totalAmount };
  };

  const handleNext = () => {
    if (!formData.customerName || !formData.customerPhone || !formData.serviceDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: "Invalid Items",
        description: "Please ensure all items have valid descriptions, quantities, and prices",
        variant: "destructive",
      });
      return;
    }
    
    setStep('template');
  };

  const handleBack = () => {
    setStep('form');
  };

  const handleTemplateSelect = async (templateId: number) => {
    setSelectedTemplate(templateId);
    await createReceipt(templateId);
  };

  const handleReceiptCreated = () => {
    onReceiptCreated();
    // Force refresh of recent receipts
    if (onReceiptUpdate) {
      onReceiptUpdate();
    }
  };

  const createReceipt = async (templateId: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { subTotal, taxRate, totalAmount } = calculateTotals();
      
      // Create receipt entry
      const receiptNumber = `REC-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user?.id,
          receipt_number: receiptNumber,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          customer_email: formData.customerEmail || null,
          service_description: formData.serviceDescription,
          payment_date: format(formData.paymentDate, 'yyyy-MM-dd'),
          amount: totalAmount,
          sub_total: subTotal,
          tax_rate: taxRate,
          receipt_template_id: templateId,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Create receipt items
      const receiptItems = items.map(item => ({
        receipt_id: receiptData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(receiptItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Receipt created successfully!",
        description: `Receipt ${receiptNumber} has been generated`,
      });

      // Reset form and close dialog
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
        companyPhone: formData.companyPhone,
        paymentDate: new Date(),
        serviceDescription: '',
        currency: formData.currency,
      });
      setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
      setStep('form');
      
      handleReceiptCreated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating receipt:', error);
      toast({
        title: "Error creating receipt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableReceipts = getAvailableReceipts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Create New Receipt' : 'Choose Receipt Template'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <PhoneInput
                      value={formData.customerPhone}
                      onChange={(value) => setFormData({...formData, customerPhone: value})}
                      currency={formData.currency}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email Address (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <div className="relative">
                    <Input
                      id="paymentDate"
                      type="date"
                      value={format(formData.paymentDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({...formData, paymentDate: new Date(e.target.value)})}
                      className="pl-10"
                    />
                    <CalendarDays className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="serviceDescription">Service Description *</Label>
                  <Input
                    id="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
                    placeholder="Describe the service provided"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, currency: value})} defaultValue="USD">
                    <SelectTrigger className="h-10 text-base">
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
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Items & Services</CardTitle>
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <Label>Total</Label>
                        <Input value={`${supportedCurrencies.find(c => c.code === formData.currency)?.symbol || '$'}${item.totalPrice.toLocaleString()}`} disabled />
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{supportedCurrencies.find(c => c.code === formData.currency)?.symbol || '$'}{calculateTotals().totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next: Choose Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" onClick={handleBack} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Form
              </Button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
            {/* Template Selection - Left Side */}
            <div className="xl:w-1/3 flex-shrink-0 space-y-4">
              <h2 className="text-lg font-semibold">Select a Receipt Style</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableReceipts.map((templateId) => {
                  const ReceiptPreview = getReceipt(templateId);
                  return (
                    <Card 
                      key={templateId}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTemplate === templateId 
                          ? 'ring-2 ring-primary shadow-md' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(templateId)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm">Receipt Style {templateId}</h3>
                          {selectedTemplate === templateId && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Selected</span>
                          )}
                        </div>
                        <div className="h-20 overflow-hidden border rounded bg-gray-50 flex items-center justify-center">
                          <div className="transform scale-[0.08] origin-center w-[300px] h-[200px] pointer-events-none">
                            <ReceiptPreview data={{
                              customerName: formData.customerName || 'Sample Customer',
                              customerPhone: '',
                              companyName: '',
                              companyAddress: '',
                              companyPhone: '',
                              invoiceNumber: 'SAMPLE-001',
                              invoiceDate: new Date().toISOString().split('T')[0],
                              items: items.length > 0 && items[0].description ? items : [
                                { id: '1', description: 'Sample Service', quantity: 1, unitPrice: 10000, totalPrice: 10000 }
                              ],
                              subTotal: calculateTotals().totalAmount || 10000,
                              taxRate: 0,
                              totalAmount: calculateTotals().totalAmount || 10000,
                              currency: formData.currency,
                              locale: supportedCurrencies.find(c => c.code === formData.currency)?.locale || 'en-US'
                            }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          
            {/* Preview - Right Side */}
            <div className="xl:w-2/3 flex-grow space-y-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white overflow-hidden" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {(() => {
                      const ReceiptComponent = getReceipt(selectedTemplate);
                      const previewData = {
                        invoiceNumber: `REC-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`,
                        invoiceDate: formData.paymentDate ? format(formData.paymentDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                        customerName: formData.customerName,
                        customerPhone: formData.customerPhone,
                        customerEmail: formData.customerEmail,
                        companyName: formData.companyName,
                        companyAddress: formData.companyAddress,
                        companyPhone: formData.companyPhone,
                        serviceDescription: formData.serviceDescription,
                        items: items,
                        subTotal: calculateTotals().subTotal,
                        taxRate: 0,
                        totalAmount: calculateTotals().totalAmount,
                        currency: formData.currency,
                        locale: supportedCurrencies.find(c => c.code === formData.currency)?.locale || 'en-US'
                      };
                      return <ReceiptComponent data={previewData} />;
                    })()}
                  </div>
                  
                  <Button
                    onClick={() => handleTemplateSelect(selectedTemplate)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Receipt...
                      </>
                    ) : (
                      'Create Receipt with This Template'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground text-center px-4">Select a receipt template to preview</p>
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateReceiptDialog;


