import React from "react";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";
import { PriceListData, groupItemsByCategory } from "@/utils/priceListRegistry";
import { Phone, Mail, Instagram, MapPin } from "lucide-react";

interface PriceListTemplate4Props {
  data: PriceListData;
}

const PriceListTemplate4: React.FC<PriceListTemplate4Props> = ({ data }) => {
  const categories = groupItemsByCategory(data.items);
  const primaryColor = data.primaryColor || "#1a1a1a"; // Charcoal/Black default

  return (
    <div className="w-full max-w-[800px] min-h-[1100px] bg-[#fafafa] text-slate-900 font-serif relative shadow-2xl flex flex-col p-16">
      {/* Elegant Border Frame */}
      <div className="absolute inset-8 border border-slate-200 pointer-events-none"></div>

      {/* Header Section */}
      <div className="text-center space-y-8 mb-20 relative z-10">
        <div className="flex flex-col items-center">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt={data.businessName}
              className="h-20 w-auto object-contain mb-6"
            />
          ) : (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-slate-400 mb-2">
                Established 2025
              </h2>
              <div className="w-16 h-[1px] bg-slate-300 mx-auto"></div>
            </div>
          )}
          <h1 className="text-5xl font-light tracking-widest text-slate-900 uppercase mb-4">
            {data.businessName}
          </h1>
          <div className="w-32 h-[1px] bg-slate-900 mx-auto mb-6"></div>
          <p className="text-slate-500 font-sans text-sm tracking-widest uppercase italic max-w-md mx-auto leading-relaxed">
            {data.description || "Collection of Fine Services & Offerings"}
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="flex-grow space-y-16 relative z-10 font-sans px-10">
        {categories.map((group) => (
          <div key={group.name} className="space-y-8">
            <div className="text-center">
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-slate-800">
                {group.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-xl mx-auto">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="h-[1px] flex-grow bg-slate-100 italic"></div>
                    <span className="text-sm font-bold text-slate-900 tracking-wider">
                      {item.name}
                    </span>
                    <div className="h-[1px] flex-grow bg-slate-100"></div>
                  </div>
                  <span className="text-lg font-light text-slate-600">
                    ₦
                    {item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  {item.note && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {item.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="mt-20 pt-12 border-t border-slate-200 relative z-10 font-sans">
        <div className="flex flex-col items-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full text-center">
            {data.showPhone && data.contactInfo.phone && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Telephone
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {data.contactInfo.phone}
                </p>
              </div>
            )}
            {data.showEmail && data.contactInfo.email && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Inquiries
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {data.contactInfo.email}
                </p>
              </div>
            )}
            {data.showWhatsapp && data.contactInfo.whatsapp && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  WhatsApp
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {data.contactInfo.whatsapp}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-8">
              {data.contactInfo.social && (
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  {data.contactInfo.social}
                </span>
              )}
              {data.contactInfo.website && (
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  {data.contactInfo.website}
                </span>
              )}
            </div>
            {data.contactInfo.address && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center max-w-xs leading-relaxed">
                {data.contactInfo.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceListTemplate4;
