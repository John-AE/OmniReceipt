import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { MessageSquare, Check, Loader2, Eye, Receipt, Share2, Plus } from 'lucide-react';
import { getCurrencyByCode, getCurrencyLocale } from '@/utils/currencyConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import InvoiceViewer from '@/components/InvoiceViewer';
import ReceiptSelection from '@/components/ReceiptSelection';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import type { InvoiceData } from '@/utils/templateRegistry';

interface PartialPayment {
  id: string;
  payment_amount: number;
  payment_date: string;
  description: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  invoice_date: string;
  status: string;
  created_at: string;
  template_id?: number;
  sub_total?: number;
  tax_rate?: number;
  invoice_jpeg_url?: string;
  receipt_jpeg_url?: string;
  receipt_generated_at?: string;
  amount_paid?: number;
  partial_payment_count?: number;
}

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: () => void;
}

export const InvoiceViewDialog = ({ invoice, open, onOpenChange, onStatusUpdate }: InvoiceViewDialogProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [showReceiptSelection, setShowReceiptSelection] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [userCurrency, setUserCurrency] = useState<string>('NGN');

  // Fetch user currency when dialog opens
  useEffect(() => {
    const fetchUserCurrency = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('user_id', user.id)
            .single();
          if (profile?.currency) {
            setUserCurrency(profile.currency);
          }
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };

    if (open && invoice) {
      fetchUserCurrency();
    }
  }, [open, invoice]);

  // Fetch partial payments and update current invoice when dialog opens or invoice changes
  useEffect(() => {
    if (open && invoice) {
      setCurrentInvoice(invoice);
      fetchPartialPayments();
    }
  }, [open, invoice?.id]);

  const fetchPartialPayments = async () => {
    if (!invoice) return;
    
    try {
      const { data, error } = await supabase
        .from('partial_payments')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('payment_date', { ascending: true });

      if (error) throw error;
      setPartialPayments(data || []);
    } catch (error) {
      console.error('Error fetching partial payments:', error);
    }
  };

  const refreshInvoiceData = async () => {
    if (!invoice) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice.id)
        .single();

      if (error) throw error;
      setCurrentInvoice(data);
      await fetchPartialPayments();
      onStatusUpdate();
    } catch (error) {
      console.error('Error refreshing invoice:', error);
    }
  };

  if (!invoice || !currentInvoice) return null;
  
  // Clear stale data when invoice changes
  if (invoice && invoiceData && invoiceData.invoiceNumber !== invoice.invoice_number) {
    setInvoiceData(null);
  }

  const amountPaid = currentInvoice.amount_paid || 0;
  const remainingBalance = currentInvoice.amount - amountPaid;
  const hasPartialPayments = partialPayments.length > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(getCurrencyLocale(userCurrency), {
      style: 'currency',
      currency: userCurrency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendWhatsApp = async () => {
    setIsSending(true);
    try {
      // Check if invoice already has a JPEG URL, if not, load data and generate
      if (!currentInvoice.invoice_jpeg_url) {
        await loadInvoiceData();
        // Show invoice viewer to allow user to generate and share the JPEG
        setShowInvoiceViewer(true);
        setIsSending(false);
        return;
      }

      // Update status to 'sent'
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', currentInvoice.id);

      if (error) {
        throw error;
      }

      // Create WhatsApp message
      const message = `Invoice #${currentInvoice.invoice_number} for ${formatCurrency(currentInvoice.amount)} from your service provider`;
      
      // Share the existing JPEG via WhatsApp
      await shareJPEGViaWhatsApp(currentInvoice.invoice_jpeg_url, message, currentInvoice.customer_phone);

      toast({
        title: "Invoice sent via WhatsApp",
        description: "The invoice image has been shared and status updated to 'sent'",
      });

      onStatusUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error sending invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = async () => {
  setIsMarkingPaid(true);
  try {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', currentInvoice.id);

    if (error) throw error;

    toast({
      title: "Invoice marked as paid",
      description: "Now you can generate a receipt for the customer",
    });

    onStatusUpdate();
    
    // Load invoice data and wait for it to complete
    const loadedData = await loadInvoiceData();
    if (!loadedData) return;
    
    // Set the invoice data immediately and show receipt selection
    setInvoiceData(loadedData);
    setShowReceiptSelection(true);
    
  } catch (error: any) {
    console.error('Error marking as paid:', error);
    toast({
      title: "Error updating status",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsMarkingPaid(false);
  }
};

  const loadInvoiceData = async () => {
    try {
      // Fetch invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', currentInvoice.id);

      if (itemsError) throw itemsError;

      // Fetch user profile for company info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch partial payments for this invoice
      const { data: payments, error: paymentsError } = await supabase
        .from('partial_payments')
        .select('*')
        .eq('invoice_id', currentInvoice.id)
        .order('payment_date', { ascending: true });

      if (paymentsError) throw paymentsError;

      // Convert invoice items to the template format
      const invoiceItems = items?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })) || [];

      // Add partial payments as negative line items (deductions)
      const paymentItems = (payments || []).map(payment => ({
        id: payment.id,
        description: `Payment: ${payment.description}`,
        quantity: 1,
        unitPrice: -payment.payment_amount,
        totalPrice: -payment.payment_amount,
        isPayment: true, // Flag to identify payment items in templates
      }));

     const invoiceDataForTemplate: InvoiceData = {
        invoiceNumber: currentInvoice.invoice_number,
        invoiceDate: currentInvoice.invoice_date,
        paymentDate: currentInvoice.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
        customerName: currentInvoice.customer_name,
        customerPhone: currentInvoice.customer_phone,
        customerEmail: currentInvoice.customer_email,
        companyName: profile.business_name || profile.artisan_name,
        companyPhone: profile.phone,
        companyAddress: profile.business_address || '',
        items: [...invoiceItems, ...paymentItems],
        subTotal: currentInvoice.sub_total || currentInvoice.amount,
        taxRate: currentInvoice.tax_rate || 0,
        totalAmount: currentInvoice.amount,
        amountPaid: currentInvoice.amount_paid || 0,
        remainingBalance: remainingBalance,
      };
      setInvoiceData(invoiceDataForTemplate);
      return invoiceDataForTemplate;
    } catch (error) {
      console.error('Error loading invoice data:', error);
      toast({
        title: "Error loading invoice",
        description: "Could not load invoice details",
        variant: "destructive",
      });
       return null; 
    }
  };

  const handleViewInvoice = async () => {
    await loadInvoiceData();
    setShowInvoiceViewer(true);
  };

  const handleReceiptGenerated = (receiptNumber: number) => {
    setShowReceiptSelection(false);
    toast({
      title: "Receipt generated",
      description: "Receipt has been created successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="font-bold">{status}</Badge>;
      case 'sent':
        return <Badge variant="default">{status}</Badge>;
      case 'created':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setInvoiceData(null); // Clear stale data when dialog closes
        setPartialPayments([]);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logo size="sm" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            View and manage invoice #{currentInvoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{currentInvoice.invoice_number}</h3>
              <p className="text-sm text-muted-foreground">Created on {formatDate(currentInvoice.created_at)}</p>
            </div>
            {getStatusBadge(currentInvoice.status)}
          </div>

          {/* Invoice Details Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Customer</h4>
                  <p className="font-medium">{currentInvoice.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{currentInvoice.customer_phone}</p>
                  {currentInvoice.customer_email && (
                    <p className="text-sm text-muted-foreground">{currentInvoice.customer_email}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Invoice Date</h4>
                  <p className="font-medium">{formatDate(currentInvoice.invoice_date)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Service Description</h4>
                <p className="text-sm">{currentInvoice.service_description}</p>
              </div>

              {/* Amount Section - Updated to show partial payments info */}
              <div className="border-t pt-4 space-y-3">
                {hasPartialPayments ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm uppercase text-muted-foreground">Original Amount</h4>
                      <p className="text-lg font-semibold">{formatCurrency(currentInvoice.amount)}</p>
                    </div>
                    <div className="flex justify-between items-center text-green-600">
                      <h4 className="font-semibold text-sm uppercase">Amount Paid</h4>
                      <p className="text-lg font-semibold">-{formatCurrency(amountPaid)}</p>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <h4 className="font-semibold text-sm uppercase text-muted-foreground">Outstanding Balance</h4>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(remainingBalance)}</p>
                    </div>
                    
                    {/* Payment History */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment History</h4>
                      <div className="space-y-2">
                        {partialPayments.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                            <div>
                              <p className="font-medium">{payment.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                            </div>
                            <p className="font-semibold text-green-600">{formatCurrency(payment.payment_amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm uppercase text-muted-foreground">Total Amount</h4>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(currentInvoice.amount)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button 
              onClick={handleViewInvoice}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Invoice
            </Button>

            {/* Add Payment Button - show when invoice is not fully paid */}
            {currentInvoice.status !== 'paid' && remainingBalance > 0 && (
              <Button 
                onClick={() => setShowAddPaymentModal(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Payment
              </Button>
            )}
                       
            {currentInvoice.status === 'sent' && (
              <Button 
                onClick={handleMarkAsPaid}
                disabled={isMarkingPaid}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isMarkingPaid ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Mark as Paid
              </Button>
            )}

            {currentInvoice.status === 'paid' && !currentInvoice.receipt_generated_at && (
              <Button 
                onClick={async () => {
                  setIsGeneratingReceipt(true);
                  try {
                    const loadedData = await loadInvoiceData();
                    if (loadedData) {
                      setInvoiceData(loadedData);
                      setShowReceiptSelection(true);
                    }
                  } finally {
                    setIsGeneratingReceipt(false);
                  }
                }}
                disabled={isGeneratingReceipt}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isGeneratingReceipt ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
                {isGeneratingReceipt ? "Loading..." : "Generate Receipt"}
              </Button>
            )}

            {currentInvoice.status === 'paid' && currentInvoice.receipt_generated_at && currentInvoice.receipt_jpeg_url && (
              <Button 
                onClick={async () => {
                  try {
                    const message = `Receipt for Invoice #${currentInvoice.invoice_number} (Paid ${formatCurrency(currentInvoice.amount)})`;
                    await shareJPEGViaWhatsApp(currentInvoice.receipt_jpeg_url!, message, currentInvoice.customer_phone);
                    toast({
                      title: "Receipt shared via WhatsApp",
                      description: "The receipt has been shared successfully",
                    });
                  } catch (error) {
                    console.error('Error sharing receipt:', error);
                    toast({
                      title: "Error sharing receipt",
                      description: "Failed to share receipt. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Receipt
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Invoice Viewer */}
      <InvoiceViewer
        invoiceData={invoiceData}
        templateNumber={currentInvoice.template_id || 1}
        open={showInvoiceViewer}
        onOpenChange={setShowInvoiceViewer}
      />

      {/* Receipt Selection */}
      <Dialog open={showReceiptSelection} onOpenChange={setShowReceiptSelection}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle>Generate Receipt</DialogTitle>
            <DialogDescription>
              Choose a receipt template to generate for the paid invoice
            </DialogDescription>
          </DialogHeader>
          {showReceiptSelection && invoiceData ? (
            <ReceiptSelection
              invoiceData={invoiceData}
              onBack={() => setShowReceiptSelection(false)}
              onReceiptGenerated={handleReceiptGenerated}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading invoice data...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Modal */}
      <AddPaymentModal
        invoiceId={currentInvoice.id}
        invoiceAmount={currentInvoice.amount}
        amountPaid={amountPaid}
        open={showAddPaymentModal}
        onOpenChange={setShowAddPaymentModal}
        onPaymentAdded={refreshInvoiceData}
      />
    </Dialog>
  );
};


