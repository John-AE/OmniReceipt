import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { MessageSquare, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyLocale } from '@/utils/currencyConfig';
import { toast } from '@/hooks/use-toast';
import QuotationViewer from '@/components/QuotationViewer';
import { shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import type { QuotationData } from '@/utils/quotationRegistry';

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_description: string;
  amount: number;
  quotation_date: string;
  valid_until: string;
  status: string;
  created_at: string;
  template_id?: number;
  sub_total?: number;
  tax_rate?: number;
  quotation_jpeg_url?: string;
}

interface QuotationViewDialogProps {
  quotation: Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: () => void;
}

export const QuotationViewDialog = ({ quotation, open, onOpenChange, onStatusUpdate }: QuotationViewDialogProps) => {
  const [isSending, setIsSending] = useState(false);
  const [showQuotationViewer, setShowQuotationViewer] = useState(false);
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null);
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

    if (open && quotation) {
      fetchUserCurrency();
    }
  }, [open, quotation]);

  if (!quotation) return null;
  
  // Clear stale data when quotation changes
  if (quotation && quotationData && quotationData.quotationNumber !== quotation.quotation_number) {
    setQuotationData(null);
  }

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
      // Check if quotation already has a JPEG URL, if not, load data and generate
      if (!quotation.quotation_jpeg_url) {
        await loadQuotationData();
        setShowQuotationViewer(true);
        setIsSending(false);
        return;
      }

      // Update status to 'sent'
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'sent' })
        .eq('id', quotation.id);

      if (error) {
        throw error;
      }

      // Create WhatsApp message
      const message = `Quotation #${quotation.quotation_number} for ${formatCurrency(quotation.amount)} from your service provider. Valid until ${formatDate(quotation.valid_until)}.`;
      
      // Share the existing JPEG via WhatsApp
      await shareJPEGViaWhatsApp(quotation.quotation_jpeg_url, message, quotation.customer_phone);

      toast({
        title: "Quotation sent via WhatsApp",
        description: "The quotation image has been shared and status updated to 'sent'",
      });

      onStatusUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending quotation:', error);
      toast({
        title: "Error sending quotation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const loadQuotationData = async () => {
    try {
      // Fetch quotation items
      const { data: items, error: itemsError } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotation.id);

      if (itemsError) throw itemsError;

      // Fetch user profile for company info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const quotationDataForTemplate: QuotationData = {
        quotationNumber: quotation.quotation_number,
        quotationDate: quotation.quotation_date,
        validUntil: quotation.valid_until,
        customerName: quotation.customer_name,
        customerPhone: quotation.customer_phone,
        customerEmail: quotation.customer_email,
        companyName: profile.business_name || profile.artisan_name,
        companyPhone: profile.phone,
        companyAddress: profile.business_address || '',
        items: items?.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })) || [],
        subTotal: quotation.sub_total || quotation.amount,
        taxRate: quotation.tax_rate || 0,
        totalAmount: quotation.amount,
      };
      setQuotationData(quotationDataForTemplate);
      return quotationDataForTemplate;
    } catch (error) {
      console.error('Error loading quotation data:', error);
      toast({
        title: "Error loading quotation",
        description: "Could not load quotation details",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleViewQuotation = async () => {
    await loadQuotationData();
    setShowQuotationViewer(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-[#EAC435] text-black font-bold">{status}</Badge>;
      case 'created':
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setQuotationData(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Logo size="sm" />
            Quotation Details
          </DialogTitle>
          <DialogDescription>
            View and manage quotation #{quotation.quotation_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quotation Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{quotation.quotation_number}</h3>
              <p className="text-sm text-muted-foreground">Created on {formatDate(quotation.created_at)}</p>
            </div>
            {getStatusBadge(quotation.status)}
          </div>

          {/* Quotation Details Card */}
          <Card className="border-[#EAC435]/30">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Customer</h4>
                  <p className="font-medium">{quotation.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{quotation.customer_phone}</p>
                  {quotation.customer_email && (
                    <p className="text-sm text-muted-foreground">{quotation.customer_email}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Quotation Date</h4>
                  <p className="font-medium">{formatDate(quotation.quotation_date)}</p>
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2 mt-3">Valid Until</h4>
                  <p className="font-medium">{formatDate(quotation.valid_until)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Service Description</h4>
                <p className="text-sm">{quotation.service_description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground">Total Amount</h4>
                  <p className="text-2xl font-bold text-[#B8961E]">{formatCurrency(quotation.amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={handleViewQuotation}
              variant="outline"
              className="flex items-center gap-2 border-[#EAC435]/50"
            >
              <Eye className="h-4 w-4" />
              View Quotation
            </Button>
                        
            {quotation.status === 'created' && (
              <Button 
                onClick={handleSendWhatsApp}
                disabled={isSending}
                className="flex items-center gap-2 bg-[#EAC435] text-black hover:bg-[#EAC435]/90"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
                Send via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Quotation Viewer */}
      <QuotationViewer
        quotationData={quotationData}
        templateNumber={quotation.template_id || 1}
        open={showQuotationViewer}
        onOpenChange={setShowQuotationViewer}
      />
    </Dialog>
  );
};
