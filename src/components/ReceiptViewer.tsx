import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Share, Loader2, Eye, Mail } from 'lucide-react';
import { getReceipt } from '@/utils/receiptRegistry';
import { generateInvoiceImage, downloadImage } from '@/utils/imageGeneration';
import { uploadInvoiceToStorage, shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { InvoiceData } from '@/utils/templateRegistry';

interface ReceiptViewerProps {
  receiptData: InvoiceData | null;
  templateNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReceiptViewer = ({ receiptData, templateNumber, open, onOpenChange }: ReceiptViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user } = useAuth();
  
  if (!receiptData) return null;

  const ReceiptTemplate = getReceipt(templateNumber);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateInvoiceImage('receipt-viewer-content');
      downloadImage(blob, `receipt-${receiptData.invoiceNumber}.jpg`);
      toast({
        title: "Receipt downloaded",
        description: "Receipt has been saved as a JPEG image",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate receipt image",
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
        description: "Please log in to share receipts",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Upload receipt JPEG to storage and get public URL
      const fileName = `receipt-${receiptData.invoiceNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('receipt-viewer-content', fileName, user.id);
      
      // Update database with receipt JPEG URL
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ receipt_jpeg_url: jpegUrl })
        .eq('invoice_number', receiptData.invoiceNumber)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating receipt JPEG URL:', updateError);
      }

      // Create WhatsApp message
      const message = `Receipt for Invoice #${receiptData.invoiceNumber} (Paid ₦${receiptData.totalAmount.toLocaleString()}) from ${receiptData.companyName}`;
      
      // Share via WhatsApp
      await shareJPEGViaWhatsApp(jpegUrl, message, receiptData.customerPhone || '');
      
      toast({
        title: "Receipt shared via WhatsApp",
        description: "The receipt image has been uploaded and shared",
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast({
        title: "Share failed",
        description: "Could not prepare receipt for sharing",
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
        description: "Please log in to share receipts",
        variant: "destructive",
      });
      return;
    }

    if (!receiptData.customerEmail) {
      toast({
        title: "No email address",
        description: "Customer email is required to send via email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Upload receipt JPEG to storage and get public URL
      const fileName = `receipt-${receiptData.invoiceNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('receipt-viewer-content', fileName, user.id);
      
      // Update database with receipt JPEG URL
      await supabase
        .from('invoices')
        .update({ receipt_jpeg_url: jpegUrl })
        .eq('invoice_number', receiptData.invoiceNumber)
        .eq('user_id', user.id);

      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-document-email', {
        body: {
          recipientEmail: receiptData.customerEmail,
          documentType: 'receipt',
          documentNumber: receiptData.invoiceNumber,
          businessName: receiptData.companyName,
          jpegUrl: jpegUrl,
          amount: `₦${receiptData.totalAmount.toLocaleString()}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Receipt sent via Email",
        description: `Receipt has been sent to ${receiptData.customerEmail}`,
      });
    } catch (error) {
      console.error('Error sending receipt via email:', error);
      toast({
        title: "Email failed",
        description: "Could not send receipt via email",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Receipt Preview
            </DialogTitle>
            <Badge variant="outline">Template {templateNumber}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt Preview */}
          <div id="receipt-viewer-content" className="border rounded-lg p-4 bg-white max-w-full overflow-hidden">
            <div className="w-full">
              <ReceiptTemplate data={receiptData} />
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
            
            {receiptData.customerEmail && (
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

export default ReceiptViewer;


