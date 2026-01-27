import PriceListTemplate1 from '@/components/templates/pricelists/PriceListTemplate1';
import PriceListTemplate2 from '@/components/templates/pricelists/PriceListTemplate2';
import PriceListTemplate3 from '@/components/templates/pricelists/PriceListTemplate3';
import PriceListTemplate4 from '@/components/templates/pricelists/PriceListTemplate4';
import React from 'react';

export interface PriceListItem {
    id?: string;
    name: string;
    price: number;
    note?: string;
    category?: string;
    position?: number;
}

export interface PriceListData {
    id?: string;
    businessName: string;
    description?: string;
    items: PriceListItem[];
    contactInfo: {
        phone: string;
        email?: string;
        whatsapp?: string;
        website?: string;
        social?: string; // @handle
        address?: string;
    };
    showPhone?: boolean;
    showEmail?: boolean;
    showWhatsapp?: boolean;
    templateId: string; // Changed to string to match user's suggestion
    slug: string;
    is_active: boolean;
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
}

// Helper to group items by category for templates
export const groupItemsByCategory = (items: PriceListItem[]) => {
    const groups: { name: string; items: PriceListItem[] }[] = [];

    items.forEach(item => {
        const categoryName = item.category || 'General';
        let group = groups.find(g => g.name === categoryName);
        if (!group) {
            group = { name: categoryName, items: [] };
            groups.push(group);
        }
        group.items.push(item);
    });

    return groups;
};

export type PriceListTemplateComponent = React.FC<{ data: PriceListData }>;

const priceListTemplates: Record<string, PriceListTemplateComponent> = {
    '1': PriceListTemplate1,
    '2': PriceListTemplate2,
    '3': PriceListTemplate3,
    '4': PriceListTemplate4,
};

export const getPriceListTemplate = (templateId: string): PriceListTemplateComponent => {
    return priceListTemplates[templateId] || PriceListTemplate1;
};

export const getAvailablePriceListTemplates = () => {
    return Object.keys(priceListTemplates);
};


