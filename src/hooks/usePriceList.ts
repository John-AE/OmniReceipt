import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PriceListData, PriceListItem } from '@/utils/priceListRegistry';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Local interfaces to satisfy TS when schema types are not yet generated
interface DBPriceList {
    id: string;
    user_id: string;
    title: string;
    description: string;
    template: string;
    slug: string;
    is_active: boolean;
    primary_color: string;
    accent_color: string;
    logo_url: string;
    email?: string;
    whatsapp?: string;
    show_phone: boolean;
    show_email: boolean;
    show_whatsapp: boolean;
}

interface DBPriceListItem {
    id: string;
    price_list_id: string;
    category: string;
    item_name: string;
    price: number;
    note: string;
    position: number;
}

export const usePriceList = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch the user's price list and profile for defaults
    const { data: priceList, isLoading, error } = useQuery({
        queryKey: ['priceList', user?.id],
        queryFn: async () => {
            if (!user) return null;

            // 1. Fetch Profile for defaults
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            // 2. Fetch the price list header
            let { data: listData, error: listError } = await (supabase
                .from('price_lists' as any)
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle() as any);

            // If select * failed due to missing columns, retry with only safe columns
            if (listError && (listError.code === '42703' || listError.message?.includes('column'))) {
                console.warn('Migration missing, retrying fetch with safe columns...');
                const retry = await (supabase
                    .from('price_lists' as any)
                    .select('id, user_id, title, description, template, slug, is_active, primary_color, accent_color, logo_url')
                    .eq('user_id', user.id)
                    .maybeSingle() as any);
                listData = retry.data;
                listError = retry.error;
            }

            if (listError) {
                console.error('List fetch error:', listError);
                throw listError;
            }

            if (!listData) {
                // No price list found, return defaults based on profile
                return {
                    businessName: profile?.business_name || '',
                    description: '',
                    items: [],
                    templateId: '1',
                    slug: profile?.business_name?.toLowerCase().replace(/\s+/g, '-') || `user-${user.id.slice(0, 8)}`,
                    is_active: false,
                    contactInfo: {
                        phone: profile?.phone || '',
                        email: profile?.email || '',
                        address: profile?.business_address || '',
                        social: '',
                    },
                    logoUrl: profile?.logo_url || ''
                } as PriceListData;
            }

            const header = listData as DBPriceList;

            // 3. Fetch the items for this price list
            const { data: itemsData, error: itemsError } = await (supabase
                .from('price_list_items' as any)
                .select('*')
                .eq('price_list_id', header.id)
                .order('position', { ascending: true }) as any);

            if (itemsError) throw itemsError;

            const items = (itemsData || []) as DBPriceListItem[];

            // 4. Map to UI structure
            const mappedData: PriceListData = {
                id: header.id,
                businessName: header.title,
                description: header.description || '',
                templateId: header.template || '1',
                slug: header.slug,
                is_active: header.is_active,
                primaryColor: header.primary_color,
                accentColor: header.accent_color,
                logoUrl: header.logo_url || profile?.logo_url || '',
                showPhone: header.show_phone ?? true,
                showEmail: header.show_email ?? true,
                showWhatsapp: header.show_whatsapp ?? true,
                items: items.map(item => ({
                    id: item.id,
                    name: item.item_name,
                    price: Number(item.price),
                    note: item.note || '',
                    category: item.category || 'General',
                    position: item.position
                })),
                contactInfo: {
                    phone: profile?.phone || '',
                    email: header.email || profile?.email || '',
                    whatsapp: header.whatsapp || profile?.phone || '',
                    address: profile?.business_address || '',
                    social: '',
                    website: ''
                }
            };

            return mappedData;
        },
        enabled: !!user,
    });

    // Create or Update mutation
    const savePriceList = useMutation({
        mutationFn: async (data: Partial<PriceListData>) => {
            if (!user) throw new Error('User not authenticated');

            let listId = data.id;

            // 1. Save Header
            const listPayload = {
                user_id: user.id,
                title: data.businessName,
                description: data.description,
                template: data.templateId,
                slug: data.slug,
                is_active: data.is_active,
                primary_color: data.primaryColor,
                accent_color: data.accentColor,
                logo_url: data.logoUrl,
                email: data.contactInfo?.email,
                whatsapp: data.contactInfo?.whatsapp,
                show_phone: data.showPhone,
                show_email: data.showEmail,
                show_whatsapp: data.showWhatsapp,
                updated_at: new Date().toISOString(),
            };

            const performSave = async (payload: any) => {
                if (listId) {
                    const { data: updated, error } = await (supabase
                        .from('price_lists' as any)
                        .update(payload)
                        .eq('id', listId)
                        .select()
                        .single() as any);
                    return { data: updated, error };
                } else {
                    const { data: inserted, error } = await (supabase
                        .from('price_lists' as any)
                        .insert([payload])
                        .select()
                        .single() as any);
                    return { data: inserted, error };
                }
            };

            let { data: savedList, error: saveError } = await performSave(listPayload);

            // If it failed because columns don't exist, try saving without them
            if (saveError && (saveError.code === '42703' || saveError.message?.includes('column'))) {
                console.warn('Migration missing, retrying save without new columns...', saveError);
                const safePayload = { ...listPayload };
                delete (safePayload as any).email;
                delete (safePayload as any).whatsapp;
                delete (safePayload as any).show_phone;
                delete (safePayload as any).show_email;
                delete (safePayload as any).show_whatsapp;

                const retry = await performSave(safePayload);
                savedList = retry.data;
                saveError = retry.error;
            }

            // If it failed because of unique constraint on user_id (23505), it means we should have UPDATED
            if (saveError && saveError.code === '23505') {
                console.warn('Record exists, retrying as update...', saveError);
                const { data: existing } = await (supabase
                    .from('price_lists' as any)
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle() as any);

                if (existing) {
                    listId = existing.id;
                    const retry = await performSave(listPayload);
                    savedList = retry.data;
                    saveError = retry.error;
                }
            }

            if (saveError) {
                console.error('Final save error:', saveError);
                throw saveError;
            }

            listId = (savedList as DBPriceList).id;

            // 2. Save Items
            if (data.items) {
                // Simple sync strategy: delete all and insert new
                const { error: deleteError } = await (supabase
                    .from('price_list_items' as any)
                    .delete()
                    .eq('price_list_id', listId) as any);
                if (deleteError) throw deleteError;

                const itemsPayload = data.items.map((item, idx) => ({
                    price_list_id: listId,
                    item_name: item.name,
                    price: item.price,
                    note: item.note,
                    category: item.category,
                    position: item.position ?? idx,
                }));

                if (itemsPayload.length > 0) {
                    const { error: insertError } = await (supabase
                        .from('price_list_items' as any)
                        .insert(itemsPayload) as any);
                    if (insertError) throw insertError;
                }
            }

            return listId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['priceList', user?.id] });
            toast({ title: 'Success', description: 'Price list saved successfully.' });
        },
        onError: (error) => {
            console.error('Save error:', error);
            toast({ title: 'Error', description: 'Failed to save price list.', variant: 'destructive' });
        }
    });

    return {
        priceList,
        isLoading,
        error,
        savePriceList,
    };
};

export const usePublicPriceList = (slug: string) => {
    return useQuery({
        queryKey: ['publicPriceList', slug],
        queryFn: async () => {
            if (!slug) return null;

            const { data: listData, error: listError } = await (supabase
                .from('price_lists' as any)
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single() as any);

            if (listError) return null;

            const header = listData as DBPriceList;

            const { data: itemsData, error: itemsError } = await (supabase
                .from('price_list_items' as any)
                .select('*')
                .eq('price_list_id', header.id)
                .order('position', { ascending: true }) as any);

            if (itemsError) throw itemsError;

            const items = (itemsData || []) as DBPriceListItem[];

            // Fetch profile for business name/logo if not in listData
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', header.user_id)
                .single();

            const mappedData: PriceListData = {
                id: header.id,
                businessName: header.title || profile?.business_name || '',
                description: header.description || '',
                templateId: header.template || '1',
                slug: header.slug,
                is_active: header.is_active,
                primaryColor: header.primary_color,
                accentColor: header.accent_color,
                logoUrl: header.logo_url || profile?.logo_url || '',
                showPhone: header.show_phone ?? true,
                showEmail: header.show_email ?? true,
                showWhatsapp: header.show_whatsapp ?? true,
                items: items.map(item => ({
                    id: item.id,
                    name: item.item_name,
                    price: Number(item.price),
                    note: item.note || '',
                    category: item.category || 'General',
                    position: item.position
                })),
                contactInfo: {
                    phone: profile?.phone || '',
                    email: header.email || profile?.email || '',
                    whatsapp: header.whatsapp || profile?.phone || '',
                    address: profile?.business_address || '',
                    social: '',
                    website: ''
                }
            };

            return mappedData;
        },
        enabled: !!slug
    });
};


