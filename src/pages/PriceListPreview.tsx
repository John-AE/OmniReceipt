import React, { useState } from 'react';
import { PriceListData, getPriceListTemplate, getAvailablePriceListTemplates } from '@/utils/priceListRegistry';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const mockPriceListData: PriceListData = {
    businessName: "Fauget Express Laundry",
    description: "Updated July 2026",
    items: [
        { name: "2 Piece Suit (sport coat, pant/skirt)", price: 14.75, category: "Dry Cleaning Service" },
        { name: "3 Piece Suit (sport coat, pant/skirt, vest)", price: 13.00, category: "Dry Cleaning Service" },
        { name: "Blouse", price: 5.50, category: "Dry Cleaning Service" },
        { name: "Silk/Linen", price: 7.50, category: "Dry Cleaning Service" },
        { name: "Casual Dresses", price: 10.50, category: "Dry Cleaning Service" },
        { name: "Formal Dress", price: 23.50, category: "Dry Cleaning Service" },
        { name: "Fancy Formal Dress", price: 24.00, note: "+ Up", category: "Dry Cleaning Service" },
        { name: "Wedding Dress", price: 27.00, note: "+ Up", category: "Dry Cleaning Service" },
        { name: "Mattress Pads", price: 12.00, category: "Comforters & Mattress Pads" },
        { name: "Comforter/Blanket (twin)", price: 15.00, category: "Comforters & Mattress Pads" },
        { name: "Comforter/Blanket (double/full)", price: 20.00, category: "Comforters & Mattress Pads" },
        { name: "Comforter/Blanket (queen/king)", price: 25.00, category: "Comforters & Mattress Pads" },
        { name: "Regular", price: 8.25, category: "Pillows" },
        { name: "Down", price: 25.00, category: "Pillows" },
        { name: "Regular", price: 7.00, category: "Sleeping Bag" },
        { name: "Down", price: 35.00, category: "Sleeping Bag" },
    ],
    contactInfo: {
        phone: "123-456-7890",
        social: "@rellygreatsite",
        website: "www.reallygreatsite.com",
        email: "hello@reallygreatsite.com"
    },
    templateId: '1',
    slug: 'fauget-laundry',
    is_active: true
};

const PriceListPreview = () => {
    const [currentTemplate, setCurrentTemplate] = useState('1');
    const availableTemplates = getAvailablePriceListTemplates();

    const TemplateComponent = getPriceListTemplate(currentTemplate);

    const nextTemplate = () => {
        const currentIndex = availableTemplates.indexOf(currentTemplate);
        const nextIndex = (currentIndex + 1) % availableTemplates.length;
        setCurrentTemplate(availableTemplates[nextIndex]);
    };

    const prevTemplate = () => {
        const currentIndex = availableTemplates.indexOf(currentTemplate);
        const prevIndex = currentIndex === 0 ? availableTemplates.length - 1 : currentIndex - 1;
        setCurrentTemplate(availableTemplates[prevIndex]);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Price List Templates Preview
                        </h1>
                        <p className="text-slate-400 mt-2">Check out these beautiful designs for your price lists.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={prevTemplate} className="border-white/20 hover:bg-white/10">
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <div className="flex items-center px-4 bg-white/5 rounded-md border border-white/10">
                            Template {currentTemplate} of {availableTemplates.length}
                        </div>
                        <Button variant="outline" onClick={nextTemplate} className="border-white/20 hover:bg-white/10">
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </header>

                <main className="flex justify-start lg:justify-center items-start gap-12 overflow-x-auto pb-20 px-4 mt-8">
                    {/* Template Container */}
                    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-white/5 shrink-0">
                        <TemplateComponent data={{ ...mockPriceListData, templateId: currentTemplate }} />
                    </div>

                    {/* Sidebar Controls (Optional) */}
                    <div className="w-80 space-y-6">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                                <Eye className="w-4 h-4 mr-2" /> Template Features
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                                    <span>Fully responsive design</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></div>
                                    <span>Print-ready A4 dimensions</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"></div>
                                    <span>Customizable colors & logo</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                                    <span>Dynamic categories & items</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-500/20">
                            <p className="text-xs font-medium text-blue-300 uppercase tracking-widest mb-2">Notice</p>
                            <p className="text-sm text-blue-100 leading-relaxed">
                                These templates are exclusive to paid users. One price list per user for maximum simplicity.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PriceListPreview;


