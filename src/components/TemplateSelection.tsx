import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvailableTemplates, InvoiceData } from '@/utils/templateRegistry';
import InvoiceTemplate from './InvoiceTemplate';
import { ArrowLeft, Eye, Download, Loader2 } from 'lucide-react';
import preview1 from '@/assets/preview1.png';
import preview2 from '@/assets/preview2.png';
import preview3 from '@/assets/preview3.png';
import preview4 from '@/assets/preview4.png';
import preview5 from '@/assets/preview5.png';
import preview6 from '@/assets/preview6.png';
import preview7 from '@/assets/preview7.png';
import preview8 from '@/assets/preview8.png';
import preview9 from '@/assets/preview9.png';
import preview10 from '@/assets/preview10.png';
import preview11 from '@/assets/preview11.png';
import preview12 from '@/assets/preview12.png';

interface TemplateSelectionProps {
  invoiceData: InvoiceData;
  onBack: () => void;
  onSelectTemplate: (templateId: number) => void;
  userSubscriptionType?: string;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  invoiceData,
  onBack,
  onSelectTemplate,
  userSubscriptionType = 'free'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#2563eb'); // Default blue for invoices
  const allTemplates = getAvailableTemplates();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const brandColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Navy', value: '#1e3a8a' },
    { name: 'Royal', value: '#1e40af' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Black', value: '#000000' },
  ];

  // Enhanced invoice data with selected color
  const enhancedInvoiceData = {
    ...invoiceData,
    primaryColor: selectedColor
  };

  const previewImages = [preview1, preview2, preview3, preview4, preview5, preview6, preview7, preview8, preview9, preview10, preview11, preview12];

  // Filter templates based on subscription type
  const isPaidUser = userSubscriptionType === 'monthly' || userSubscriptionType === 'yearly';
  const availableTemplates = isPaidUser ? allTemplates : allTemplates.filter(id => id <= 9);

  const isTemplateLocked = (templateId: number) => !isPaidUser && templateId > 9;

  const handlePreview = (templateId: number) => {
    setPreviewTemplate(templateId);
  };

  const handleSelect = (templateId: number) => {
    if (isProcessing || isTemplateLocked(templateId)) return;

    setIsProcessing(true);
    setSelectedTemplate(templateId);
    onSelectTemplate(templateId);

    // Reset after a delay (adjust timing as needed)
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            <h1 className="text-xl font-bold">Choose Invoice Template</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Invoice Template</h2>
          <p className="text-muted-foreground">Choose a professional template for your invoice</p>
        </div>

        {/* Brand Color Palette */}
        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 mb-8 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
            Brand Color Customization
          </h3>
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
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex items-center gap-3 bg-secondary/30 p-1 pr-3 rounded-full border border-border/50">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="absolute inset-[-5px] w-[calc(100%+10px)] h-[calc(100%+10px)] cursor-pointer"
                />
              </div>
              <span className="text-xs font-mono uppercase font-medium">{selectedColor}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 italic">
            Choosing a color will override the template's default theme for headers, borders, and professional accents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTemplates.map((templateId) => {
            const locked = isTemplateLocked(templateId);
            return (
              <Card key={templateId} className={`overflow-hidden hover:shadow-lg transition-shadow ${locked ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Template {templateId}
                    {locked && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Template Preview Thumbnail */}
                  <div className="border-2 border-gray-200 rounded-lg h-48 mb-4 overflow-hidden">
                    {previewImages[templateId - 1] ? (
                      <img
                        src={previewImages[templateId - 1]}
                        alt={`Template ${templateId} preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                        Template {templateId}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(templateId)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSelect(templateId)}
                      className="flex-1"
                      variant={isProcessing && selectedTemplate === templateId ? "default" : selectedTemplate === templateId ? "default" : "secondary"}
                      disabled={isProcessing || locked}
                      title={locked ? "Upgrade to access this template" : ""}
                    >
                      {isProcessing && selectedTemplate === templateId ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {locked ? "Premium" : isProcessing && selectedTemplate === templateId ? "Processing..." : selectedTemplate === templateId ? "Selected" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {!isPaidUser && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-800">
              🌟 Upgrade to access templates 10-12 and unlock more premium features!
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle>Template {previewTemplate} Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-4 overflow-x-auto">
              <div className="w-full">
                <InvoiceTemplate data={enhancedInvoiceData} templateNumber={previewTemplate} />
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button onClick={() => handleSelect(previewTemplate)}>
                  Select This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateSelection;


