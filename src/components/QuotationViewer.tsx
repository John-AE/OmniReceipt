import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Share, Loader2, Eye, Mail } from 'lucide-react';
import { getQuotationTemplate } from '@/utils/quotationRegistry';
import { generateInvoiceImage, downloadImage } from '@/utils/imageGeneration';
import { uploadInvoiceToStorage, shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { QuotationData } from '@/utils/quotationRegistry';

interface QuotationViewerProps {
  quotationData: QuotationData | null;
  templateNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuotationViewer = ({ quotationData, templateNumber, open, onOpenChange }: QuotationViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user } = useAuth();
  
  if (!quotationData) return null;

  const Template = getQuotationTemplate(templateNumber);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateInvoiceImage('quotation-viewer-content');
      downloadImage(blob, `quotation-${quotationData.quotationNumber}.jpg`);
      toast({
        title: "Quotation downloaded",
        description: "Quotation has been saved as a JPEG image",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate quotation image",
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
        description: "Please log in to share quotations",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Upload quotation JPEG to storage and get public URL
      const fileName = `quotation-${quotationData.quotationNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('quotation-viewer-content', fileName, user.id);
      
      // Update database with quotation JPEG URL
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ quotation_jpeg_url: jpegUrl, status: 'sent' })
        .eq('quotation_number', quotationData.quotationNumber)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating quotation JPEG URL:', updateError);
      }

      // Create WhatsApp message
      const message = `Quotation #${quotationData.quotationNumber} for ₦${quotationData.totalAmount.toLocaleString()} from ${quotationData.companyName}. Valid until ${new Date(quotationData.validUntil).toLocaleDateString()}.`;
      
      // Share via WhatsApp
      await shareJPEGViaWhatsApp(jpegUrl, message, quotationData.customerPhone || '');
      
      toast({
        title: "Quotation shared via WhatsApp",
        description: "The quotation image has been uploaded and shared",
      });
    } catch (error) {
      console.error('Error sharing quotation:', error);
      toast({
        title: "Share failed",
        description: "Could not prepare quotation for sharing",
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
        description: "Please log in to share quotations",
        variant: "destructive",
      });
      return;
    }

    if (!quotationData.customerEmail) {
      toast({
        title: "No email address",
        description: "Customer email is required to send via email",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      // Upload quotation JPEG to storage and get public URL
      const fileName = `quotation-${quotationData.quotationNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('quotation-viewer-content', fileName, user.id);
      
      // Update database with quotation JPEG URL
      await supabase
        .from('quotations')
        .update({ quotation_jpeg_url: jpegUrl, status: 'sent' })
        .eq('quotation_number', quotationData.quotationNumber)
        .eq('user_id', user.id);

      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-document-email', {
        body: {
          recipientEmail: quotationData.customerEmail,
          documentType: 'quotation',
          documentNumber: quotationData.quotationNumber,
          businessName: quotationData.companyName,
          jpegUrl: jpegUrl,
          amount: `₦${quotationData.totalAmount.toLocaleString()}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Quotation sent via Email",
        description: `Quotation has been sent to ${quotationData.customerEmail}`,
      });
    } catch (error) {
      console.error('Error sending quotation via email:', error);
      toast({
        title: "Email failed",
        description: "Could not send quotation via email",
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
              Quotation Preview
            </DialogTitle>
            <Badge variant="outline" className="border-[#EAC435] text-[#B8961E]">Template {templateNumber}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quotation Preview */}
          <div id="quotation-viewer-content" className="border border-[#EAC435]/30 rounded-lg p-2 sm:p-4 bg-white max-w-full overflow-hidden">
            <div className="w-full">
              <Template data={quotationData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button 
              variant="outline"
              onClick={handleDownload}
              disabled={isGenerating || isSendingEmail}
              className="flex items-center gap-2 border-[#EAC435]/50"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download JPEG
            </Button>
            
            {quotationData.customerEmail && (
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
              className="flex items-center gap-2 bg-[#EAC435] text-black hover:bg-[#EAC435]/90"
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

export default QuotationViewer;


