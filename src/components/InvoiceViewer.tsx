import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Share, Loader2, Eye, Mail } from 'lucide-react';
import { getTemplate } from '@/utils/templateRegistry';
import { generateInvoiceImage, downloadImage } from '@/utils/imageGeneration';
import { uploadInvoiceToStorage, shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { InvoiceData } from '@/utils/templateRegistry';

interface InvoiceViewerProps {
  invoiceData: InvoiceData | null;
  templateNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceViewer = ({ invoiceData, templateNumber, open, onOpenChange }: InvoiceViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user } = useAuth();
  
  if (!invoiceData) return null;

  const Template = getTemplate(templateNumber);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateInvoiceImage('invoice-viewer-content');
      downloadImage(blob, `invoice-${invoiceData.invoiceNumber}.jpg`);
      toast({
        title: "Invoice downloaded",
        description: "Invoice has been saved as a JPEG image",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate invoice image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to share invoices",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Upload invoice JPEG to storage and get public URL
      const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('invoice-viewer-content', fileName, user.id);
      
      // Update database with invoice JPEG URL
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ invoice_jpeg_url: jpegUrl,
                status: 'sent'})
        .eq('invoice_number', invoiceData.invoiceNumber)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating invoice JPEG URL:', updateError);
      }

      // Create WhatsApp message
      const message = `Invoice #${invoiceData.invoiceNumber} for ₦${invoiceData.totalAmount.toLocaleString()} from ${invoiceData.companyName}`;
      
      // Share via WhatsApp
      await shareJPEGViaWhatsApp(jpegUrl, message, invoiceData.customerPhone || '');
      
      toast({
        title: "Invoice shared via WhatsApp",
        description: "The invoice image has been uploaded and shared",
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      toast({
        title: "Share failed",
        description: "Could not prepare invoice for sharing",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareEmail = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to share invoices",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceData.customerEmail) {
      toast({
        title: "No email address",
        description: "Customer email is required to send via email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Upload invoice JPEG to storage and get public URL
      const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('invoice-viewer-content', fileName, user.id);
      
      // Update database with invoice JPEG URL
      await supabase
        .from('invoices')
        .update({ invoice_jpeg_url: jpegUrl, status: 'sent' })
        .eq('invoice_number', invoiceData.invoiceNumber)
        .eq('user_id', user.id);

      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-document-email', {
        body: {
          recipientEmail: invoiceData.customerEmail,
          documentType: 'invoice',
          documentNumber: invoiceData.invoiceNumber,
          businessName: invoiceData.companyName,
          jpegUrl: jpegUrl,
          amount: `₦${invoiceData.totalAmount.toLocaleString()}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Invoice sent via Email",
        description: `Invoice has been sent to ${invoiceData.customerEmail}`,
      });
    } catch (error) {
      console.error('Error sending invoice via email:', error);
      toast({
        title: "Email failed",
        description: "Could not send invoice via email",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Invoice Preview
            </DialogTitle>
            <Badge variant="outline">Template {templateNumber}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Preview */}
          <div id="invoice-viewer-content" className="border rounded-lg p-2 sm:p-4 bg-white max-w-full overflow-hidden">
            <div className="w-full">
              <Template data={invoiceData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button 
              variant="outline"
              onClick={handleDownload}
              disabled={isGenerating || isSendingEmail}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download JPEG
            </Button>
            
            {invoiceData.customerEmail && (
              <Button 
                onClick={handleShareEmail}
                disabled={isSendingEmail || isGenerating}
                className="flex items-center gap-2 bg-[#2B4162] text-white hover:bg-[#1f2e47] font-bold"
              >
                {isSendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Share via Email
              </Button>
            )}
            
            <Button 
              onClick={handleShare}
              disabled={isGenerating || isSendingEmail}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share className="h-4 w-4" />
              )}
              Share via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewer;


