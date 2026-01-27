import React, { useState, useEffect, useCallback } from 'react';
import { usePriceList } from '@/hooks/usePriceList';
import { PriceListData, PriceListItem, getPriceListTemplate, getAvailablePriceListTemplates } from '@/utils/priceListRegistry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Trash2,
    GripVertical,
    Save,
    Eye,
    Settings2,
    Palette,
    Layout,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

interface PriceListEditorProps {
    onExit?: () => void;
}

const PriceListEditor: React.FC<PriceListEditorProps> = ({ onExit }) => {
    const { priceList, isLoading, savePriceList } = usePriceList();
    const [localData, setLocalData] = useState<PriceListData | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (priceList && !localData) {
            setLocalData(priceList);
        }
    }, [priceList, localData]);

    if (isLoading || !localData) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }
    const handleHeaderChange = (key: keyof PriceListData, value: any) => {
        if (!localData) return;
        setLocalData({ ...localData, [key]: value });
    };

    const handleItemChange = (index: number, key: keyof PriceListItem, value: any) => {
        if (!localData) return;
        const newItems = [...localData.items];
        newItems[index] = { ...newItems[index], [key]: value };
        setLocalData({ ...localData, items: newItems });
    };

    const addItem = () => {
        if (!localData) return;
        setLocalData({
            ...localData,
            items: [...localData.items, { name: '', price: 0, category: '', note: '' }]
        });
    };

    const removeItem = (index: number) => {
        if (!localData) return;
        const newItems = localData.items.filter((_, i) => i !== index);
        setLocalData({ ...localData, items: newItems });
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!localData) return;
        const newItems = [...localData.items];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
        }
        setLocalData({ ...localData, items: newItems });
    };

    const onSave = async () => {
        if (!localData) return;
        setIsSaving(true);
        try {
            await savePriceList.mutateAsync(localData);
            toast({
                title: "Success",
                description: "Price list saved successfully.",
            });
        } catch (error) {
            console.error("Failed to save price list:", error);
            toast({
                title: "Error",
                description: "Failed to save price list. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    const TemplateComponent = getPriceListTemplate(localData.templateId);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            {/* Top Toolbar */}
            <div className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onExit} className="mr-2">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <h2 className="font-bold text-lg hidden md:block">Price List Editor</h2>
                    <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Slug:</span>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                            /{localData.slug}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Visit Public Page"
                            onClick={() => window.open(`/price-list/${localData.slug}`, '_blank')}
                        >
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                        <Label htmlFor="active-toggle" className="text-xs uppercase tracking-widest font-bold text-slate-400">Public</Label>
                        <Switch
                            id="active-toggle"
                            checked={localData.is_active}
                            onCheckedChange={(checked) => handleHeaderChange('is_active', checked)}
                        />
                    </div>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Header Settings */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Settings2 className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic Info</h3>
                            </div>
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Business Name</Label>
                                        <Input
                                            value={localData.businessName}
                                            onChange={(e) => handleHeaderChange('businessName', e.target.value)}
                                            placeholder="Enter your business name"
                                            className="font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Public Link Slug</Label>
                                        <Input
                                            value={localData.slug}
                                            onChange={(e) => handleHeaderChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                            placeholder="fauget-laundry"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Description (Optional)</Label>
                                        <Textarea
                                            value={localData.description}
                                            onChange={(e) => handleHeaderChange('description', e.target.value)}
                                            placeholder="Tell your customers about your services or update date..."
                                            rows={2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Template & Appearance */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Palette className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Design</h3>
                            </div>
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Choose Template</Label>
                                        <Select
                                            value={localData.templateId}
                                            onValueChange={(val) => handleHeaderChange('templateId', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailablePriceListTemplates().map(id => (
                                                    <SelectItem key={id} value={id}>Template {id}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label>Primary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    className="w-12 h-10 p-1 rounded-md"
                                                    value={localData.primaryColor || '#1E88E5'}
                                                    onChange={(e) => handleHeaderChange('primaryColor', e.target.value)}
                                                />
                                                <Input
                                                    value={localData.primaryColor || '#1E88E5'}
                                                    onChange={(e) => handleHeaderChange('primaryColor', e.target.value)}
                                                    className="font-mono text-xs uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Items & Categories */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-purple-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Items & Categories</h3>
                                </div>
                                <Button onClick={() => addItem()} size="sm" className="bg-slate-900 hover:bg-slate-800">
                                    <Plus className="w-4 h-4 mr-1" /> Add Item
                                </Button>
                            </div>

                            <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
                                <CardContent className="p-0">
                                    {localData.items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-4">
                                            <Layout className="w-12 h-12 opacity-20" />
                                            <p className="text-sm">No items added yet. Click &quot;Add Item&quot; to start.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {localData.items.map((item, idx) => (
                                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex gap-4 items-start group">
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-slate-200"
                                                            onClick={() => moveItem(idx, 'up')}
                                                            disabled={idx === 0}
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 hover:bg-slate-200"
                                                            onClick={() => moveItem(idx, 'down')}
                                                            disabled={idx === localData.items.length - 1}
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-12 gap-4 flex-grow">
                                                        <div className="col-span-12 md:col-span-4 space-y-1">
                                                            <Label className="text-[10px] text-slate-400 uppercase font-black">Item Name</Label>
                                                            <Input
                                                                value={item.name}
                                                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                                placeholder="e.g. Wash & Fold"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="col-span-6 md:col-span-2 space-y-1">
                                                            <Label className="text-[10px] text-slate-400 uppercase font-black">Price (₦)</Label>
                                                            <Input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => handleItemChange(idx, 'price', Number(e.target.value))}
                                                                placeholder="1000"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="col-span-6 md:col-span-3 space-y-1">
                                                            <Label className="text-[10px] text-slate-400 uppercase font-black">Category</Label>
                                                            <Input
                                                                value={item.category}
                                                                onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                                                                placeholder="Dry Cleaning"
                                                                className="h-9"
                                                            />
                                                        </div>
                                                        <div className="col-span-10 md:col-span-2 space-y-1">
                                                            <Label className="text-[10px] text-slate-400 uppercase font-black">Note (Optional)</Label>
                                                            <Input
                                                                value={item.note}
                                                                onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                                                                placeholder="+ Up"
                                                                className="h-9"
                                                            />
                                                        </div>

                                                        <div className="col-span-2 md:col-span-1 flex items-end justify-end pb-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => removeItem(idx)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        <div className="pb-20 flex justify-center">
                            <Button variant="outline" onClick={() => addItem()} className="border-dashed border-2 px-10">
                                <Plus className="w-4 h-4 mr-2" /> Add Another Item
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Live Preview Sidebar */}
                <div className="hidden lg:flex w-[450px] bg-slate-100 dark:bg-slate-900 border-l overflow-hidden flex-col">
                    <div className="p-4 border-b bg-white dark:bg-black/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 relative flex justify-center bg-[#f8fafc] dark:bg-slate-950">
                        <div className="transform scale-[0.45] origin-top shadow-2xl rounded-lg overflow-hidden border">
                            <TemplateComponent data={localData} />
                        </div>
                    </div>

                    <div className="p-4 text-[10px] text-slate-400 border-t text-center uppercase tracking-widest bg-white dark:bg-black/20">
                        Auto-rendering Changes
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceListEditor;


