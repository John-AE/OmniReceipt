import React from "react";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";
import { PriceListData, groupItemsByCategory } from "@/utils/priceListRegistry";
import {
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  MapPin,
  Globe,
  Sparkles,
  Star,
} from "lucide-react";

interface PriceListTemplate3Props {
  data: PriceListData;
}

const PriceListTemplate3: React.FC<PriceListTemplate3Props> = ({ data }) => {
  const categories = groupItemsByCategory(data.items);
  const primaryColor = data.primaryColor || "#6366f1"; // Indigo-500 default
  const accentColor = data.accentColor || "#f59e0b"; // Amber-500 default

  return (
    <div className="w-full max-w-[800px] min-h-[1100px] bg-white text-slate-900 font-sans relative overflow-hidden shadow-2xl flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -mr-48 -mt-48 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-50 to-transparent rounded-full -ml-48 -mb-48 opacity-50"></div>

      {/* Header Section */}
      <div className="p-12 pb-8 flex justify-between items-start relative z-10 border-b border-slate-100">
        <div className="space-y-4 max-w-[60%]">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt={data.businessName}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: primaryColor }}
              >
                {data.businessName.charAt(0)}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                {data.businessName}
              </h1>
            </div>
          )}
          <p className="text-slate-500 font-medium leading-relaxed italic">
            {data.description || "Our Premium Services & Pricing"}
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Exclusive Services
            </span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 leading-none">
            PRICE
            <br />
            <span style={{ color: primaryColor }}>LIST</span>
          </h2>
        </div>
      </div>

      {/* Services Section */}
      <div className="p-12 flex-grow relative z-10">
        <div className="grid grid-cols-1 gap-10">
          {categories.map((group, catIdx) => (
            <div key={group.name} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3
                  className="text-sm font-black uppercase tracking-widest px-4 py-2 border-l-4"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}10`,
                  }}
                >
                  {group.name}
                </h3>
                <div className="h-[1px] flex-grow bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex justify-between items-center py-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-bold group-hover:text-slate-950 transition-colors">
                          {item.name}
                        </span>
                        {item.note && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-grow border-b border-dotted border-slate-300 w-12 hidden md:block"></div>
                      <span
                        className="text-lg font-black tracking-tight"
                        style={{ color: primaryColor }}
                      >
                        ₦
                        {item.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Badge Section */}
      <div className="px-12 py-6 bg-slate-50/50 border-y border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Star className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              Quality Guaranteed
            </p>
            <p className="text-[10px] text-slate-500 leading-none">
              Premium results, every time.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Est. 2025
          </p>
        </div>
      </div>

      {/* Modern Footer Section */}
      <div
        className="p-12 pt-10 text-slate-900 border-t-8"
        style={{ borderTopColor: primaryColor }}
      >
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Get In Touch
              </span>
            </div>
            <div className="space-y-3">
              {data.showPhone && data.contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">
                    {data.contactInfo.phone}
                  </span>
                </div>
              )}
              {data.showWhatsapp && data.contactInfo.whatsapp && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">
                    {data.contactInfo.whatsapp}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end items-end space-y-3">
            {data.showEmail && data.contactInfo.email && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {data.contactInfo.email}
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            )}
            {data.contactInfo.social && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {data.contactInfo.social}
                </span>
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                  <Instagram className="w-4 h-4" />
                </div>
              </div>
            )}
            {data.contactInfo.address && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {data.contactInfo.address}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceListTemplate3;
