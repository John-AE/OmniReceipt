import React from 'react';
import { PriceListData, groupItemsByCategory } from '@/utils/priceListRegistry';
import { Phone, Globe, Mail, Instagram, MapPin, MessageCircle } from 'lucide-react';

interface PriceListTemplate2Props {
    data: PriceListData;
}

const PriceListTemplate2: React.FC<PriceListTemplate2Props> = ({ data }) => {
    const primaryColor = data.primaryColor || '#004D40'; // Emerald Green
    const accentColor = data.accentColor || '#E0F2F1'; // Light Mint

    // Default image if none provided
    const imageUrl = data.logoUrl || "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop";

    return (
        <div className="w-[794px] min-h-[1123px] mx-auto bg-white shadow-2xl flex flex-col font-sans overflow-hidden border" style={{ backgroundColor: primaryColor }}>
            {/* Top Section */}
            <div className="flex min-h-[400px]">
                {/* Left: Image */}
                <div className="w-[35%] relative overflow-hidden">
                    <img
                        src={imageUrl}
                        alt="Laundry Service"
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                </div>

                {/* Right: Title and Main Category */}
                <div className="w-[65%] p-10 flex flex-col justify-center">
                    <div className="mb-6">
                        <h1 className="text-4xl font-black text-[#004D40] leading-tight uppercase tracking-tighter" style={{ color: primaryColor }}>
                            {data.businessName || 'Our Prices'}
                        </h1>
                        <p className="mt-2 text-[#004D40]/80 font-medium" style={{ color: primaryColor }}>
                            {data.description}
                        </p>
                    </div>

                    {/* First Category (Main) */}
                    {groupItemsByCategory(data.items).length > 0 && (
                        <div className="flex-grow">
                            <div className="bg-[#00897B] text-white py-3 px-6 rounded-lg flex justify-between items-center mb-4">
                                <span className="font-bold uppercase tracking-widest">{groupItemsByCategory(data.items)[0].name}</span>
                                <span className="font-bold uppercase tracking-widest text-xs opacity-80">Price</span>
                            </div>
                            <div className="space-y-3 px-2 flex-grow overflow-hidden">
                                {groupItemsByCategory(data.items)[0].items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-end border-b border-gray-100 pb-1">
                                        <span className="text-gray-700 font-medium truncate pr-4">{item.name}</span>
                                        <span className="text-gray-900 font-bold shrink-0">{formatCurrency(item.price, data.currency, data.locale)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Grid of Categories */}
            <div className="flex-grow p-10 pt-0">
                <div className="grid grid-cols-3 gap-6">
                    {groupItemsByCategory(data.items).slice(1, 4).map((category, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="bg-[#E0F2F1] border-b-4 border-[#00897B] py-2 px-4 rounded-t-lg mb-3">
                                <h3 className="text-[#004D40] font-black text-xs uppercase tracking-wider text-center">
                                    {category.name}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {category.items.map((item, iIdx) => (
                                    <div key={iIdx} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600 font-medium truncate pr-2">{item.name}</span>
                                        <span className="text-[#004D40] font-bold shrink-0">{formatCurrency(item.price, data.currency, data.locale)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Section */}
            <div className="bg-[#004D40] p-10 text-white mt-auto">
                <div className="grid grid-cols-2 gap-10">
                    {/* Logo/Brand */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                            <div className="grid grid-cols-2 gap-1 px-2">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-1">{data.businessName}</h2>
                            {data.description && <p className="text-xs text-mint-100 opacity-70 italic line-clamp-1">{data.description}</p>}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col justify-center items-end text-right">
                        {data.showPhone && data.contactInfo.phone && (
                            <div className="flex items-center gap-3 mb-2">
                                <div>
                                    <p className="text-[8px] uppercase tracking-widest opacity-60">Call Us</p>
                                    <p className="text-xl font-black">{data.contactInfo.phone}</p>
                                </div>
                                <Phone className="w-6 h-6 text-mint-200" />
                            </div>
                        )}
                        {data.showWhatsapp && data.contactInfo.whatsapp && (
                            <div className="flex items-center gap-3 mb-2">
                                <div>
                                    <p className="text-[8px] uppercase tracking-widest opacity-60">WhatsApp</p>
                                    <p className="text-xl font-black">{data.contactInfo.whatsapp}</p>
                                </div>
                                <MessageCircle className="w-6 h-6 text-green-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Socials / Email */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-70">
                    <div className="flex gap-6">
                        {data.contactInfo.website && <span>{data.contactInfo.website}</span>}
                        {data.contactInfo.social && <span>{data.contactInfo.social}</span>}
                    </div>
                    {data.showEmail && data.contactInfo.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{data.contactInfo.email}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceListTemplate2;





