import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicPriceList } from '@/hooks/usePriceList';
import { getPriceListTemplate, PriceListData } from '@/utils/priceListRegistry';
import PriceListContainer from '@/components/pricelists/PriceListContainer';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

const PriceListView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: priceList, isLoading, error } = usePublicPriceList(slug || '');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Mobile scaling logic - moved to top to prevent Hook order error
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const containerWidth = window.innerWidth;
            const templateWidth = 794; // Standard A4 width in px at 96 DPI

            // Only scale if screen is smaller than template
            if (containerWidth < templateWidth) {
                // Subtract some padding (e.g. 32px or 2rem total)
                const newScale = (containerWidth - 32) / templateWidth;
                setScale(newScale);
            } else {
                setScale(1);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (slug) {
            console.log('Attempting to increment views for slug:', slug);
            // Fire and forget view increment
            (supabase as any).rpc('increment_price_list_views', { p_slug: slug })
                .then(({ data, error }: any) => {
                    if (error) {
                        console.error('Failed to increment views:', error);
                    } else {
                        console.log('Successfully incremented views');
                    }
                });
        }
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading Price List...</p>
            </div>
        );
    }

    if (error || !priceList) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-20" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Price List Not Found</h1>
                <p className="text-slate-500 max-w-md mb-8">
                    The price list you are looking for might have been moved, deleted, or is currently private.
                </p>
                <Button asChild>
                    <Link to="/">Go to Homepage</Link>
                </Button>
            </div>
        );
    }

    const TemplateComponent = getPriceListTemplate(priceList.templateId);

    // Extract unique categories
    const categories = ['All', ...Array.from(new Set(priceList.items.map(item => item.category || 'General')))].sort();

    // Filter items based on category
    const filteredItems = selectedCategory === 'All'
        ? priceList.items
        : priceList.items.filter(item => (item.category || 'General') === selectedCategory);

    const filteredData: PriceListData = {
        ...priceList,
        items: filteredItems
    };



    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Category Filter - only show if there are multiple categories */}
            {categories.length > 2 && ( // 'All' + at least 2 distinct categories
                <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 px-4 overflow-x-auto">
                    <div className="flex gap-2 max-w-5xl mx-auto min-w-max">
                        {categories.map(category => (
                            <Badge
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                className={`cursor-pointer px-4 py-1.5 text-sm transition-all hover:scale-105 ${selectedCategory === category ? 'bg-[#6A4C93] hover:bg-[#5A3E82]' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-grow flex justify-center py-8 overflow-x-hidden">
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: '794px', // Fixed base width
                        height: 'fit-content',
                        marginBottom: `-${(1 - scale) * 1123}px` // Compensate for scale causing whitespace (approx A4 height)
                    }}
                    className="transition-transform duration-300"
                >
                    <PriceListContainer>
                        <TemplateComponent data={filteredData} />
                    </PriceListContainer>
                </div>
            </div>

            {/* Minimalist Footer for Public View */}
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                    Powered by <span className="text-blue-500 font-bold">OmniReceipts</span>
                </p>
            </div>
        </div>
    );
};

export default PriceListView;


