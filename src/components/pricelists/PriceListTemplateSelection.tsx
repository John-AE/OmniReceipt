import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPriceListTemplate, PriceListData, getAvailablePriceListTemplates } from '@/utils/priceListRegistry';
import { ArrowLeft, Check, Eye, Layout } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PriceListTemplateSelectionProps {
    data: PriceListData;
    onBack: () => void;
    onSelect: (templateId: string) => void;
}

const PriceListTemplateSelection: React.FC<PriceListTemplateSelectionProps> = ({
    data,
    onBack,
    onSelect
}) => {
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
    const templateIds = getAvailablePriceListTemplates();

    const handlePreview = (id: string) => {
        setPreviewTemplate(id);
    };

    const handleSelect = (id: string) => {
        onSelect(id);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col items-center text-center">
                    <Button variant="ghost" onClick={onBack} className="self-start mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Details
                    </Button>
                    <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                        <Layout className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Choose Your Design</h1>
                    <p className="text-slate-500 mt-2 max-w-md">Select one of our professional templates to showcase your services. You can always change this later.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {templateIds.map((id) => {
                        const TemplateComponent = getPriceListTemplate(id);
                        return (
                            <Card key={id} className="group overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-xl hover:shadow-2xl">
                                <CardHeader className="bg-white dark:bg-slate-900 border-b p-6">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold">Template {id}</CardTitle>
                                        <div className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Professional</div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 relative">
                                    {/* Scaled Preview */}
                                    <div className="h-[400px] overflow-hidden bg-slate-100 dark:bg-slate-800 flex justify-center p-4">
                                        <div className="w-[800px] transform scale-[0.35] origin-top shadow-2xl rounded-lg overflow-hidden border bg-white">
                                            <TemplateComponent data={{ ...data, templateId: id }} />
                                        </div>
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                        <Button
                                            variant="secondary"
                                            className="w-40 font-bold"
                                            onClick={() => handlePreview(id)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Full Preview
                                        </Button>
                                        <Button
                                            className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                            onClick={() => handleSelect(id)}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Select This
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
                    <DialogContent className="max-w-5xl w-[95vw] h-[90vh] overflow-y-auto p-0">
                        <DialogHeader className="p-6 border-b sticky top-0 bg-white dark:bg-slate-900 z-50">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl font-bold">Template {previewTemplate} Preview</DialogTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPreviewTemplate(null)}
                                        className="gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Close Preview
                                    </Button>
                                    <Button
                                        onClick={() => previewTemplate && handleSelect(previewTemplate)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
                                    >
                                        Select This Design
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="p-10 bg-slate-50 dark:bg-slate-950 flex justify-center">
                            {previewTemplate && (
                                <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-xl overflow-hidden border">
                                    {React.createElement(getPriceListTemplate(previewTemplate), { data: { ...data, templateId: previewTemplate } })}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default PriceListTemplateSelection;


