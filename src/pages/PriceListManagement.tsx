import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import PriceListEditor from '@/components/pricelists/PriceListEditor';
import PriceListCreationForm from '@/components/pricelists/PriceListCreationForm';
import PriceListTemplateSelection from '@/components/pricelists/PriceListTemplateSelection';
import { usePriceList } from '@/hooks/usePriceList';
import { PriceListData } from '@/utils/priceListRegistry';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PriceListManagement: React.FC = () => {
    const { user, profile } = useAuth();
    const { priceList, isLoading, error, savePriceList } = usePriceList();
    const navigate = useNavigate();
    const [step, setStep] = useState<'loading' | 'form' | 'template' | 'editor'>('loading');
    const [wizardData, setWizardData] = useState<PriceListData | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (error) {
                // If there's an error, we might still want to show the form but maybe with a warning
                // For now, let's treat it as "no data found" to let them create it
                setStep('form');
                setWizardData({
                    businessName: profile?.business_name || '',
                    description: '',
                    items: [],
                    contactInfo: {
                        phone: profile?.phone || '',
                        email: profile?.email || '',
                        whatsapp: profile?.phone || '' // Default WhatsApp to phone
                    },
                    showPhone: true,
                    showEmail: true,
                    showWhatsapp: true,
                    templateId: '1',
                    slug: profile?.business_name?.toLowerCase().replace(/\s+/g, '-') || '',
                    is_active: false
                });
                return;
            }

            if (priceList) {
                // If the price list has an ID, it means it's already saved in the DB
                // We want to allow editing, so we load the form with existing data
                setStep('form');
                // Ensure we spread the fetched priceList data into wizardData
                setWizardData({
                    ...priceList,
                    // Ensure defaults if any fields are missing
                    items: priceList.items || []
                } as PriceListData);
            } else if (!isLoading) {
                // Fallback for unexpected null
                setStep('form');
            }
        }
    }, [isLoading, priceList, error]);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (isLoading || step === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-500 font-medium">Loading your price list...</p>
                </div>
            </div>
        );
    }

    const handleFormSubmit = (data: PriceListData) => {
        setWizardData(data);
        setStep('template');
    };

    const handleTemplateSelect = async (templateId: string) => {
        if (!wizardData) return;

        const finalData = { ...wizardData, templateId, is_active: true };
        try {
            await savePriceList.mutateAsync(finalData);
            toast({
                title: "Price List Saved",
                description: "Your price list has supported successfully.",
            });
            navigate('/profile');
        } catch (err) {
            console.error('Failed to save initial price list:', err);
            toast({
                title: "Error",
                description: "Failed to save price list. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleBackToForm = () => {
        setStep('form');
    };

    const handleDashboardBack = () => {
        navigate('/profile');
    };

    const handleDirectSave = async (data: PriceListData) => {
        try {
            // Keep existing template if not specified, or default to current
            const finalData = {
                ...data,
                // Ensure we keep the existing templateId if the form doesn't manage it (which it doesn't visualy, but data has it)
                templateId: data.templateId || '1',
                is_active: true
            };

            await savePriceList.mutateAsync(finalData);
            toast({
                title: "Changes Saved",
                description: "Your price list has been updated successfully.",
            });
            // Optional: navigate back to profile or just show success
            navigate('/profile');
        } catch (err) {
            console.error('Failed to save changes:', err);
            toast({
                title: "Error",
                description: "Failed to update price list. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {step === 'form' && wizardData && (
                <PriceListCreationForm
                    initialData={wizardData}
                    onSubmit={handleFormSubmit}
                    onBack={handleDashboardBack}
                    onSaveNow={handleDirectSave}
                />
            )}

            {step === 'template' && wizardData && (
                <PriceListTemplateSelection
                    data={wizardData}
                    onBack={handleBackToForm}
                    onSelect={handleTemplateSelect}
                />
            )}
        </div>
    );
};

export default PriceListManagement;


