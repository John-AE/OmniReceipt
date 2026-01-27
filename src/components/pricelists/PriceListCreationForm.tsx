import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Logo } from '@/components/ui/logo';
import { Plus, Trash2, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { PriceListData, PriceListItem } from '@/utils/priceListRegistry';

interface PriceListCreationFormProps {
    initialData: PriceListData;
    onSubmit: (data: PriceListData) => void;
    onBack?: () => void;
    onSaveNow?: (data: PriceListData) => void;
}

const PriceListCreationForm: React.FC<PriceListCreationFormProps> = ({
    initialData,
    onSubmit,
    onBack,
    onSaveNow
}) => {
    const [formData, setFormData] = useState<PriceListData>(initialData);

    const handleChange = (field: keyof PriceListData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactChange = (field: keyof PriceListData['contactInfo'], value: string) => {
        setFormData(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [field]: value }
        }));
    };

    const handleToggle = (field: keyof PriceListData, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof PriceListItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const newItem: PriceListItem = {
            name: '',
            price: 0,
            category: 'General',
            position: formData.items.length
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button variant="ghost" onClick={onBack} className="p-2 h-auto">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <Logo size="lg" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create/Edit Price List</h1>
                        <p className="text-slate-500 text-sm">Set up your professional price list in minutes</p>
                    </div>
                </header>

                <Card className="shadow-xl border-slate-200/60 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-xl">Business Details</CardTitle>
                        <CardDescription>We've pre-filled this from your profile. You can edit it if needed.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Basic Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName" className="text-slate-700 font-semibold">Business Name</Label>
                                    <Input
                                        id="businessName"
                                        value={formData.businessName}
                                        onChange={(e) => handleChange('businessName', e.target.value)}
                                        placeholder="e.g. Fauget Laundry & Dry Cleaning"
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.contactInfo.email}
                                        onChange={(e) => handleContactChange('email', e.target.value)}
                                        placeholder="e.g. contact@business.com"
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-700 font-semibold">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.contactInfo.phone}
                                        onChange={(e) => handleContactChange('phone', e.target.value)}
                                        placeholder="e.g. 08012345678"
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp" className="text-slate-700 font-semibold">WhatsApp Number</Label>
                                    <Input
                                        id="whatsapp"
                                        value={formData.contactInfo.whatsapp}
                                        onChange={(e) => handleContactChange('whatsapp', e.target.value)}
                                        placeholder="e.g. 08012345678"
                                        className="h-12 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Visibility Toggles */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Display Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Show Phone</Label>
                                            <p className="text-[10px] text-slate-500">Visible on price list</p>
                                        </div>
                                        <Switch
                                            checked={formData.showPhone}
                                            onCheckedChange={(checked) => handleToggle('showPhone', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Show Email</Label>
                                            <p className="text-[10px] text-slate-500">Visible on price list</p>
                                        </div>
                                        <Switch
                                            checked={formData.showEmail}
                                            onCheckedChange={(checked) => handleToggle('showEmail', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200" title="WhatsApp Icon Status">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Show WhatsApp</Label>
                                            <p className="text-[10px] text-slate-500">WhatsApp icon & link</p>
                                        </div>
                                        <Switch
                                            checked={formData.showWhatsapp}
                                            onCheckedChange={(checked) => handleToggle('showWhatsapp', checked)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-700 font-semibold">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Briefly describe your services or provide important updates..."
                                    className="min-h-[100px] border-slate-200 focus:ring-blue-500"
                                />
                            </div>

                            {/* Line Items Section */}
                            <div className="space-y-6 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-500 pl-3">Price List Items</h3>
                                        <p className="text-sm text-slate-500">Add all your services and their prices below.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addItem}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-lg shadow-blue-500/20"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Item
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {formData.items.length === 0 ? (
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                                            <p className="text-slate-400 mb-4">No services added yet.</p>
                                            <Button variant="outline" onClick={addItem} type="button">
                                                Add Your First Service
                                            </Button>
                                        </div>
                                    ) : (
                                        formData.items.map((item, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
                                                <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-4">
                                                    <div className="md:col-span-6 space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-tight text-slate-400">Service Name</Label>
                                                        <Input
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                            placeholder="e.g. Wash & Fold"
                                                            className="h-10 border-slate-100 bg-slate-50/30 focus:bg-white transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-tight text-slate-400">Price (₦)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                                            placeholder="0"
                                                            className="h-10 border-slate-100 bg-slate-50/30 focus:bg-white transition-all"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="md:col-span-4 space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-tight text-slate-400">Category (Optional)</Label>
                                                        <Input
                                                            value={item.category}
                                                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                                            placeholder="e.g. Laundry"
                                                            className="h-10 border-slate-100 bg-slate-50/30 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-end pb-1 pr-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons - Mobile Responsive */}
                            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 sm:flex-row sm:justify-between sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onBack && onBack()}
                                    className="w-full sm:w-auto px-6 h-12 rounded-full border-slate-300 text-slate-600 hover:bg-slate-50 order-3 sm:order-1"
                                >
                                    Cancel
                                </Button>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center order-1 sm:order-2">
                                    {/* If editing existing data, allow direct save */}
                                    {initialData.id && (
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onSaveNow && onSaveNow(formData);
                                            }}
                                            variant="secondary"
                                            className="w-full sm:w-auto h-12 sm:h-14 font-bold px-6 sm:px-8 rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100"
                                        >
                                            Save Changes
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-6 sm:px-10 h-12 sm:h-14 rounded-full shadow-2xl shadow-blue-500/40 transform hover:scale-105 transition-all"
                                    >
                                        {initialData.id ? 'Change Template' : 'Choose Template'}
                                        <Send className="w-4 h-4 ml-3" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-slate-400 text-xs uppercase tracking-widest font-medium">
                    OmniReceipts Pro &bull; Professional Price Lists
                </p>
            </div>
        </div>
    );
};

export default PriceListCreationForm;


