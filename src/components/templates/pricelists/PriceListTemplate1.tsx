import React from "react";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";
import { PriceListData, groupItemsByCategory } from "@/utils/priceListRegistry";
import {
  Phone,
  Globe,
  Mail,
  Instagram,
  Truck,
  MessageCircle,
} from "lucide-react";

interface PriceListTemplate1Props {
  data: PriceListData;
}

const PriceListTemplate1: React.FC<PriceListTemplate1Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#1E88E5"; // Default Blue
  const accentColor = data.accentColor || "#FFD600"; // Default Yellow

  return (
    <div
      className="w-[794px] min-h-[1123px] mx-auto bg-white shadow-2xl overflow-hidden font-sans relative flex flex-col border"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Background Bubbles (Decorative) */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mb-32 -mr-32"></div>
      <div className="absolute top-1/2 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24"></div>

      {/* Header Section */}
      <div className="p-12 pb-8 flex justify-between items-start relative z-10">
        <div className="max-w-[70%]">
          <h1 className="text-6xl font-black italic text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
            Service
            <br />
            Price List
          </h1>
        </div>

        {/* Delivery Sticker */}
        <div className="relative shrink-0">
          <div className="w-40 h-40 aspect-square bg-yellow-400 rounded-full flex flex-col items-center justify-center text-center p-4 transform rotate-12 shadow-xl border-4 border-yellow-500/20 shrink-0">
            <Truck className="w-12 h-12 text-blue-700 mb-1" />
            <div className="bg-blue-700 text-white px-3 py-1 text-xs font-black rounded-md mb-1 uppercase tracking-widest italic">
              Free
            </div>
            <p className="text-blue-800 text-[10px] font-bold leading-tight uppercase">
              Pick Up &<br />
              Delivery
            </p>
          </div>
          {/* Sticker Curl Shadow */}
          <div className="absolute top-0 right-0 w-10 h-10 bg-yellow-600/30 rounded-bl-full"></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-12 pb-20 relative z-10 flex-grow">
        <div className="grid grid-cols-12 gap-6">
          {/* Group items by category for rendering */}
          {groupItemsByCategory(data.items).map((category, idx) => {
            let gridSpan = "col-span-12";
            if (idx === 0) gridSpan = "col-span-7";
            if (idx === 1) gridSpan = "col-span-5";
            if (idx === 2) gridSpan = "col-span-5";
            if (idx === 3) gridSpan = "col-span-7";

            return (
              <div key={idx} className={`${gridSpan} flex flex-col`}>
                <div className="bg-yellow-400 py-3 px-6 rounded-t-sm shadow-md">
                  <h2 className="text-blue-900 font-black text-xl uppercase tracking-wider">
                    {category.name}
                  </h2>
                </div>
                <div className="bg-white p-4 flex-grow shadow-lg rounded-b-sm border-t-0">
                  <div className="space-y-4">
                    {category.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="flex justify-between items-start border-b border-blue-50 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="pr-4">
                          <p className="text-blue-900 font-bold text-base leading-snug">
                            {item.name}
                          </p>
                          {item.note && (
                            <p className="text-blue-400 text-xs font-medium italic">
                              {item.note}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-blue-800 font-black text-lg">
                            ₦
                            {item.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          {item.note?.toLowerCase().includes("+ up") && (
                            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase">
                              + Up
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-6 flex justify-between items-center border-t-8 border-yellow-400">
        <div className="flex gap-6 items-center text-blue-900 overflow-hidden">
          {data.showPhone && data.contactInfo.phone && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-900" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                {data.contactInfo.phone}
              </span>
            </div>
          )}
          {data.showWhatsapp && data.contactInfo.whatsapp && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                {data.contactInfo.whatsapp}
              </span>
            </div>
          )}
          {data.showEmail && data.contactInfo.email && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-900" />
              </div>
              <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">
                {data.contactInfo.email}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-blue-900 font-black text-base uppercase leading-none">
              {data.businessName}
            </p>
            {/* <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Laundry Expert</p> */}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Date Sticker Layer (Optional description) */}
      {data.description && (
        <div className="absolute top-6 right-24 bg-red-600 text-white px-4 py-1.5 transform rotate-[-5deg] font-black text-xs shadow-lg uppercase tracking-widest z-20">
          {data.description}
        </div>
      )}
    </div>
  );
};

export default PriceListTemplate1;
