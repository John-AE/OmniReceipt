import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share, Loader2, Receipt } from 'lucide-react';
import { getReceipt, getAvailableReceipts } from '@/utils/receiptRegistry';
import { generateInvoiceImage, downloadImage } from '@/utils/imageGeneration';
import { uploadInvoiceToStorage, shareJPEGViaWhatsApp } from '@/utils/fileUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { InvoiceData } from '@/utils/templateRegistry';

interface ReceiptSelectionProps {
  invoiceData: InvoiceData;
  onBack: () => void;
  onReceiptGenerated: (receiptNumber: number) => void;
}

const ReceiptSelection = ({ invoiceData, onBack, onReceiptGenerated }: ReceiptSelectionProps) => {
  const [selectedReceipt, setSelectedReceipt] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const availableReceipts = getAvailableReceipts();
  const [selectedColor, setSelectedColor] = useState<string>('#000000');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const brandColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Navy', value: '#1e3a8a' },
  ];

  // Enhanced invoice data with selected color
  const enhancedInvoiceData = {
    ...invoiceData,
    primaryColor: selectedColor
  };

  // Debug logging
  console.log('invoiceData for receipt:', invoiceData);

  if (!invoiceData) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  const handleReceiptSelect = (receiptNumber: number) => {
    setSelectedReceipt(receiptNumber);
  };

  const handleGenerateReceipt = async () => {
    if (!selectedReceipt) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate receipts",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create receipt data from invoice data
      const { subTotal, taxRate, totalAmount } = calculateTotals();

      // Generate receipt number
      const receiptNumber = `REC-${Date.now()}`;

      // Create receipt in database
      const { data: receiptData, error } = await (supabase as any)
        .from('receipts')
        .insert({
          user_id: user.id,
          receipt_number: receiptNumber,
          customer_name: invoiceData.customerName,
          customer_phone: invoiceData.customerPhone,
          customer_email: invoiceData.customerEmail || null,
          service_description: invoiceData.items?.map(item => item.description).join(', ') || 'Services provided',
          amount: totalAmount,
          payment_date: new Date().toISOString().split('T')[0],
          receipt_template_id: selectedReceipt,
          sub_total: subTotal,
          tax_rate: taxRate,
          invoice_id: invoiceData.invoiceNumber, // Link to original invoice
        })
        .select()
        .single();

      if (error) throw error;

      // Create receipt items if they exist
      if (invoiceData.items && invoiceData.items.length > 0) {
        const itemsToInsert = invoiceData.items.map(item => ({
          receipt_id: receiptData.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await (supabase as any)
          .from('receipt_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating receipt items:', itemsError);
        }
      }

      // Update invoice with receipt generation timestamp
      const { error: updateError } = await (supabase as any)
        .from('invoices')
        .update({
          receipt_generated_at: new Date().toISOString()
        })
        .eq('invoice_number', invoiceData.invoiceNumber)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating invoice:', updateError);
      }

      toast({
        title: "Receipt generated",
        description: "Receipt has been created and saved successfully",
      });

      onReceiptGenerated(selectedReceipt);
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Error generating receipt",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotals = () => {
    const subTotal = invoiceData.subTotal || invoiceData.totalAmount || 0;
    const taxRate = invoiceData.taxRate || 0;
    const totalAmount = invoiceData.totalAmount || subTotal;
    return { subTotal, taxRate, totalAmount };
  };

  const handleDownload = async () => {
    if (!selectedReceipt) return;

    setIsGenerating(true);
    try {
      const blob = await generateInvoiceImage('receipt-preview');
      downloadImage(blob, `receipt-${invoiceData.invoiceNumber}.jpg`);
      toast({
        title: "Receipt downloaded",
        description: "Receipt has been saved to your device",
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
    if (!selectedReceipt) return;
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
      const fileName = `receipt-${invoiceData.invoiceNumber}-${Date.now()}.jpg`;
      const jpegUrl = await uploadInvoiceToStorage('receipt-preview', fileName, user.id);

      // Create WhatsApp message
      const message = `Receipt for Invoice #${invoiceData.invoiceNumber} (Paid ₦${invoiceData.totalAmount.toLocaleString()})`;

      // Share via WhatsApp
      await shareJPEGViaWhatsApp(jpegUrl, message, invoiceData.customerPhone);

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

  const ReceiptComponent = selectedReceipt ? getReceipt(selectedReceipt) : null;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Choose Receipt Template</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Brand Color Palette */}
      <div className="bg-background/80 backdrop-blur-sm border rounded-xl p-4 mb-6 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
          Brand Color Palette
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          {brandColors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.value
                ? 'border-primary ring-2 ring-primary/20 scale-110'
                : 'border-transparent hover:scale-105'
                }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <div className="h-8 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded-full border-2 border-transparent cursor-pointer overflow-hidden p-0"
            />
            <span className="text-xs text-muted-foreground font-mono uppercase">{selectedColor}</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic">
          Tip: This color will be applied to headers and accents on your receipt.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-full">
        {/* Template Selection - Left Side */}
        <div className="xl:w-1/3 flex-shrink-0 space-y-4">
          <h2 className="text-lg font-semibold">Select a Receipt Style</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableReceipts.map((receiptNumber) => {
              const ReceiptPreview = getReceipt(receiptNumber);
              return (
                <Card
                  key={receiptNumber}
                  className={`cursor-pointer transition-all duration-200 ${selectedReceipt === receiptNumber
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                    }`}
                  onClick={() => handleReceiptSelect(receiptNumber)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">Receipt Style {receiptNumber}</h3>
                      {selectedReceipt === receiptNumber && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <div className="h-20 overflow-hidden border rounded bg-gray-50 flex items-center justify-center">
                      <div className="transform scale-[0.08] origin-center w-[300px] h-[200px] pointer-events-none">
                        <ReceiptPreview data={enhancedInvoiceData} isPrint={true} />
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
          {selectedReceipt && ReceiptComponent && invoiceData ? (
            <div className="space-y-4">
              <div
                id="receipt-preview"
                className="border rounded-lg p-4 bg-white overflow-hidden"
                style={{ maxHeight: '500px', overflowY: 'auto' }}
              >
                <div className="w-full max-w-full">
                  <ReceiptComponent data={enhancedInvoiceData} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Share className="h-4 w-4 mr-2" />
                  )}
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground text-center px-4">Select a receipt template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptSelection;


