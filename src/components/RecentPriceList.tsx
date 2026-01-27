import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Share2, Phone, Mail, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PriceList {
    id: string;
    title: string;
    description: string;
    slug: string;
    created_at: string;
    updated_at: string;
    views: number;
}

import QRCode from 'react-qr-code';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, QrCode } from 'lucide-react';

const RecentPriceList = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [priceList, setPriceList] = useState<PriceList | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [shareData, setShareData] = useState({
        phone: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            fetchPriceList();
        }
    }, [user]);

    const fetchPriceList = async () => {
        setIsRefreshing(true);
        try {
            const { data, error } = await (supabase as any)
                .from('price_lists')
                .select('*')
                .eq('user_id', user?.id)
                .order('updated_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error fetching price list:', error);
            } else if (data) {
                setPriceList(data as PriceList);
            }
        } catch (error) {
            console.error('Price list fetch error:', error);
        } finally {
            setLoading(false);
            // Add a small delay so the animation is visible even if the request is instant
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleShareWhatsApp = () => {
        if (!priceList) return;

        let phoneNumber = shareData.phone.trim();
        if (!phoneNumber) {
            toast({
                title: "Phone number required",
                description: "Please enter a phone number to share via WhatsApp",
                variant: "destructive"
            });
            return;
        }

        // Basic formatting for WhatsApp
        if (phoneNumber.startsWith('0')) {
            phoneNumber = '234' + phoneNumber.substring(1);
        }

        const publicUrl = `${window.location.origin}/pricelist/${priceList.slug}`;
        const message = `Check out my price list: ${publicUrl}`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    };

    const handleShareEmail = () => {
        if (!priceList) return;

        if (!shareData.email) {
            toast({
                title: "Email address required",
                description: "Please enter an email address to share via Email",
                variant: "destructive"
            });
            return;
        }

        const publicUrl = `${window.location.origin}/pricelist/${priceList.slug}`;
        const subject = `Price List: ${priceList.title}`;
        const body = `Hello,\n\nPlease check out my price list here: ${publicUrl}\n\nBest regards.`;

        const mailtoUrl = `mailto:${shareData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };

    const isPaidUser = profile?.subscription_type === 'monthly' || profile?.subscription_type === 'yearly';

    if (loading) {
        return <div className="p-4 text-center">Loading price list...</div>;
    }

    // Gated Access for Free Users
    if (!isPaidUser) {
        return (
            <Card className="border-2 border-border shadow-md h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-sm">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-card-foreground mb-2">Premium Feature</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upgrade to a paid plan to create, customize, and share your own professional price list.
                        </p>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                            onClick={() => document.getElementById('subscription-trigger')?.click()}
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </div>
                {/* Background Content (Blurred) */}
                <CardHeader className="opacity-50">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <FileText className="h-5 w-5 text-primary" />
                        My Price List
                    </CardTitle>
                    <CardDescription>Manage your services</CardDescription>
                </CardHeader>
                <CardContent className="opacity-50 flex justify-center py-8">
                    <p className="text-muted-foreground">Premium Content</p>
                </CardContent>
            </Card>
        );
    }

    if (!priceList) {
        return (
            <Card className="border-2 border-gray-200 shadow-md h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#6A4C93]" />
                        My Price List
                    </CardTitle>
                    <CardDescription>Manage your services</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <p className="text-muted-foreground">You haven't created a price list yet.</p>
                    <Button
                        onClick={() => navigate('/price-list')}
                        className="bg-[#6A4C93] hover:bg-[#5A3E82]"
                    >
                        Create Price List
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-gray-200 shadow-md h-fit">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#6A4C93]" />
                        My Price List
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/price-list')}
                        className="flex items-center gap-2 text-[#6A4C93] hover:text-[#5A3E82] hover:bg-[#6A4C93]/10"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Price List Content
                    </Button>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <CardDescription>
                        Last updated: {new Date(priceList.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={fetchPriceList}
                            title="Refresh Stats"
                        >
                            <span className="sr-only">Refresh</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                        </Button>
                        <div className="flex items-center gap-1.5 text-sm font-medium bg-secondary/50 px-3 py-1.5 rounded-full text-secondary-foreground">
                            <Eye className="h-4 w-4" />
                            {priceList.views || 0} Views by Your Customers
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <h4 className="font-semibold text-lg mb-1">{priceList.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{priceList.description || 'No description'}</p>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="secondary"
                            className="flex-1 text-[#6A4C93]"
                            onClick={() => window.open(`/pricelist/${priceList.slug}`, '_blank')}
                        >
                            View Public Page
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2 border-2 border-[#6A4C93] text-[#6A4C93] font-bold hover:bg-[#6A4C93] hover:text-white transition-colors" title="Generate QR Code">
                                    <QrCode className="h-4 w-4" />
                                    Generate QR Code
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Price List QR Code</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                        <QRCode
                                            value={`${window.location.origin}/pricelist/${priceList.slug}`}
                                            size={200}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Scan to view {priceList.title}
                                    </p>
                                    <Button onClick={() => window.print()} variant="ghost" size="sm">
                                        Print QR Code
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Price List
                    </h4>

                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Label htmlFor="share-phone" className="sr-only">Phone Number</Label>
                                <Input
                                    id="share-phone"
                                    placeholder="Recipient Phone"
                                    value={shareData.phone}
                                    onChange={(e) => setShareData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="rounded-none border-2 border-slate-300 focus:border-[#6A4C93] transition-colors"
                                />
                            </div>
                            <Button
                                onClick={handleShareWhatsApp}
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2"
                                title="Share via WhatsApp"
                            >
                                <Phone className="h-4 w-4" />
                                Share via WhatsApp
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Label htmlFor="share-email" className="sr-only">Email Address</Label>
                                <Input
                                    id="share-email"
                                    type="email"
                                    placeholder="Recipient Email"
                                    value={shareData.email}
                                    onChange={(e) => setShareData(prev => ({ ...prev, email: e.target.value }))}
                                    className="rounded-none border-2 border-slate-300 focus:border-[#6A4C93] transition-colors"
                                />
                            </div>
                            <Button
                                onClick={handleShareEmail}
                                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                                title="Share via Email"
                            >
                                <Mail className="h-4 w-4" />
                                Share via Email
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RecentPriceList;


