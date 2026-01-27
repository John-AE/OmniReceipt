
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { Eye, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ReceiptViewer from '@/components/ReceiptViewer';
import { shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import type { InvoiceData } from '@/utils/templateRegistry';

interface Receipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  payment_date: string;
  created_at: string;
  receipt_template_id: number;
  receipt_jpeg_url?: string;
  sub_total?: number;
  tax_rate?: number;
  user_id: string;
  invoice_id?: string;
  updated_at?: string;
}

interface ReceiptViewDialogProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: () => void;
}

export const ReceiptViewDialog = ({ receipt, open, onOpenChange, onStatusUpdate }: ReceiptViewDialogProps) => {
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [receiptData, setReceiptData] = useState<InvoiceData | null>(null);

  if (!receipt) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadReceiptData = async () => {
    try {
      // Fetch receipt items - using type assertion to bypass TypeScript errors
      const { data: items, error: itemsError } = await (supabase as any)
        .from('receipt_items')
        .select('*')
        .eq('receipt_id', receipt.id);

      if (itemsError) throw itemsError;

      // Fetch user profile for company info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

     const receiptDataForTemplate: InvoiceData = {
        invoiceNumber: receipt.receipt_number,
        invoiceDate: receipt.payment_date,
        paymentDate: receipt.payment_date,
        customerName: receipt.customer_name,
        customerPhone: receipt.customer_phone,
        customerEmail: receipt.customer_email,
        companyName: profile.business_name || profile.artisan_name,
        companyPhone: profile.phone,
        companyAddress: profile.business_address || '',
        serviceDescription: receipt.service_description,
        items: items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })) || [],
        subTotal: receipt.sub_total || receipt.amount,
        taxRate: receipt.tax_rate || 0,
        totalAmount: receipt.amount,
      };

      setReceiptData(receiptDataForTemplate);
      return receiptDataForTemplate;
    } catch (error) {
      console.error('Error loading receipt data:', error);
      toast({
        title: "Error loading receipt",
        description: "Could not load receipt details",
        variant: "destructive",
      });
       return null; 
    }
  };

  const handleViewReceipt = async () => {
    await loadReceiptData();
    setShowReceiptViewer(true);
  };

  const handleShareReceipt = async () => {
    try {
      if (!receipt.receipt_jpeg_url) {
        toast({
          title: "No receipt image available",
          description: "Please generate the receipt first",
          variant: "destructive",
        });
        return;
      }

      const message = `Receipt #${receipt.receipt_number} (Paid ${formatCurrency(receipt.amount)})`;
      await shareJPEGViaWhatsApp(receipt.receipt_jpeg_url, message, receipt.customer_phone);
      
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logo size="sm" />
            Receipt Details
          </DialogTitle>
          <DialogDescription>
            View and manage receipt #{receipt.receipt_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{receipt.receipt_number}</h3>
              <p className="text-sm text-muted-foreground">Receipt created on {formatDate(receipt.created_at)}</p>
            </div>
            <Badge variant="success" className="font-bold">Paid</Badge>
          </div>

          {/* Receipt Details Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Customer</h4>
                  <p className="font-medium">{receipt.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{receipt.customer_phone}</p>
                  {receipt.customer_email && (
                    <p className="text-sm text-muted-foreground">{receipt.customer_email}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Payment Date</h4>
                  <p className="font-medium">{formatDate(receipt.payment_date)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Service Description</h4>
                <p className="text-sm">{receipt.service_description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground">Amount Paid</h4>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(receipt.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={handleViewReceipt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Receipt
            </Button>
                        
            {receipt.receipt_jpeg_url && (
              <Button 
                onClick={handleShareReceipt}
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

      {/* Receipt Viewer */}
      <ReceiptViewer
        receiptData={receiptData}
        templateNumber={receipt?.receipt_template_id || 1}
        open={showReceiptViewer}
        onOpenChange={setShowReceiptViewer}
      />
    </Dialog>
  );
};


