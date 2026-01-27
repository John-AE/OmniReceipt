import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvailableQuotationTemplates, QuotationData } from '@/utils/quotationRegistry';
import QuotationTemplate from './QuotationTemplate';
import { ArrowLeft, Eye, Download, Loader2 } from 'lucide-react';
import preview1 from '@/assets/quotation-preview1.png';
import preview2 from '@/assets/quotation-preview2.png';
import preview3 from '@/assets/quotation-preview3.png';
import preview4 from '@/assets/quotation-preview4.png';
import preview5 from '@/assets/quotation-preview5.png';
import preview6 from '@/assets/quotation-preview6.png';
import preview7 from '@/assets/quotation-preview7.png';
import preview8 from '@/assets/quotation-preview8.png';
import preview9 from '@/assets/quotation-preview9.png';
import preview10 from '@/assets/quotation-preview10.png';
import preview11 from '@/assets/preview11.png';
import preview12 from '@/assets/preview12.png';

interface QuotationTemplateSelectionProps {
  quotationData: QuotationData;
  onBack: () => void;
  onSelectTemplate: (templateId: number) => void;
  userSubscriptionType?: string;
}

const QuotationTemplateSelection: React.FC<QuotationTemplateSelectionProps> = ({
  quotationData,
  onBack,
  onSelectTemplate,
  userSubscriptionType = 'free'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#EAC435'); // Default yellow for quotations
  const allTemplates = getAvailableQuotationTemplates();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const brandColors = [
    { name: 'Gold', value: '#EAC435' },
    { name: 'Caramel', value: '#D4A574' },
    { name: 'Vermilion', value: '#E63946' },
    { name: 'Phiox', value: '#00A676' },
    { name: 'Prussian', value: '#2A324B' },
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
  ];

  // Enhanced quotation data with selected color
  const enhancedQuotationData = {
    ...quotationData,
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

    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAC435]/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-[#EAC435]/30 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form
            </Button>
            <h1 className="text-xl font-bold">Choose Quotation Template</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Quotation Template</h2>
          <p className="text-muted-foreground">Choose a professional template for your quotation</p>
        </div>

        {/* Brand Color Palette */}
        <div className="bg-background/80 backdrop-blur-sm border border-[#EAC435]/30 rounded-xl p-4 mb-8 shadow-sm">
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
                  ? 'border-[#EAC435] ring-2 ring-[#EAC435]/20 scale-110'
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
              <Card key={templateId} className={`overflow-hidden hover:shadow-lg transition-shadow border-[#EAC435]/30 ${locked ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Template {templateId}
                    {locked && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Template Preview Thumbnail */}
                  <div className="border-2 border-[#EAC435]/30 rounded-lg h-48 mb-4 overflow-hidden">
                    {previewImages[templateId - 1] ? (
                      <img
                        src={previewImages[templateId - 1]}
                        alt={`Template ${templateId} preview`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#EAC435]/10 text-gray-500">
                        Template {templateId}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(templateId)}
                      className="flex-1 border-[#EAC435]/50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSelect(templateId)}
                      className={`flex-1 ${!locked ? 'bg-[#EAC435] text-black hover:bg-[#EAC435]/90' : ''}`}
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
          <div className="mt-8 p-4 bg-[#EAC435]/20 border border-[#EAC435] rounded-lg text-center">
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
                <QuotationTemplate data={enhancedQuotationData} templateNumber={previewTemplate} />
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => handleSelect(previewTemplate)}
                  className="bg-[#EAC435] text-black hover:bg-[#EAC435]/90"
                >
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

export default QuotationTemplateSelection;


