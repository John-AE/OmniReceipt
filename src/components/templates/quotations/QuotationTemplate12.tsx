import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate12Props {
  data: QuotationData;
}

const QuotationTemplate12: React.FC<QuotationTemplate12Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Quotation Template 12
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
        style={{ borderColor: primaryColor }}
      >
        {/* Header - Caramel Theme */}
        <div
          className="text-white p-10"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-6xl font-black tracking-tight mb-2 drop-shadow-md">
                QUOTATION
              </h1>
              <div className="mt-4 bg-white/20 inline-block px-5 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
                <span className="font-black text-sm uppercase tracking-[0.2em]">
                  #{data.quotationNumber}
                </span>
              </div>
            </div>
            <div className="text-right bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <h2 className="text-2xl font-black tracking-tight mb-1">
                {data.companyName}
              </h2>
              <p className="opacity-90 font-bold">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="opacity-80 text-xs mt-2 leading-relaxed max-w-[200px] ml-auto">
                  {data.companyAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 bg-gradient-to-br from-white to-gray-50/50">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div
              className="p-6 rounded-2xl border-2 shadow-sm transition-all hover:translate-y-[-2px]"
              style={{
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70"
                style={{ color: primaryColor }}
              >
                Client
              </h3>
              <p className="font-black text-gray-800 text-xl tracking-tight leading-tight">
                {data.customerName}
              </p>
              <p className="text-gray-500 font-bold text-sm mt-2">
                {data.customerPhone}
              </p>
              {data.customerEmail && (
                <p className="text-gray-400 text-xs font-semibold mt-1 truncate">
                  {data.customerEmail}
                </p>
              )}
            </div>
            <div
              className="p-6 rounded-2xl border-2 shadow-sm transition-all hover:translate-y-[-2px]"
              style={{
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70"
                style={{ color: primaryColor }}
              >
                Issued
              </h3>
              <p className="font-black text-gray-800 text-xl tracking-tight">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="p-6 rounded-2xl border-2 shadow-sm transition-all hover:translate-y-[-2px]"
              style={{ backgroundColor: "#EAC43505", borderColor: "#EAC43530" }}
            >
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-[#B8961E] opacity-70">
                Expiry
              </h3>
              <p className="font-black text-gray-800 text-xl tracking-tight">
                {new Date(data.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div
            className="mb-12 rounded-2xl overflow-hidden border-2 shadow-xl"
            style={{ borderColor: `${primaryColor}15` }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <th className="text-left p-6 font-black text-xs uppercase tracking-[0.2em]">
                    Item Description
                  </th>
                  <th className="text-center p-6 font-black text-xs uppercase tracking-[0.2em]">
                    Qty
                  </th>
                  <th className="text-right p-6 font-black text-xs uppercase tracking-[0.2em]">
                    Rate
                  </th>
                  <th className="text-right p-6 font-black text-xs uppercase tracking-[0.2em]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-6 text-gray-800 font-bold tracking-tight">
                      {item.description}
                    </td>
                    <td className="p-6 text-center text-gray-400 font-black">
                      {item.quantity}
                    </td>
                    <td className="p-6 text-right text-gray-400 font-bold">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="p-6 text-right font-black text-gray-900 text-lg">
                      {formatCurrency(
                        item.totalPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div className="flex justify-end pr-4">
            <div
              className="w-96 p-8 rounded-3xl border-4 shadow-2xl bg-white relative overflow-hidden"
              style={{ borderColor: primaryColor }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 opacity-[0.03] rotate-12 -mr-16 -mt-16"
                style={{ backgroundColor: primaryColor }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M0 0h100v100H0z" />
                </svg>
              </div>
              <div className="space-y-5 relative z-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  <span>Net Amount</span>
                  <span className="text-gray-900 text-sm">
                    {formatCurrency(data.subTotal, data.currency, data.locale)}
                  </span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                    <span>VAT ({data.taxRate}%)</span>
                    <span className="text-gray-900 text-sm">
                      {formatCurrency(taxAmount, data.currency, data.locale)}
                    </span>
                  </div>
                )}
                <div
                  className="pt-6 border-t font-black"
                  style={{ borderTopColor: `${primaryColor}20` }}
                >
                  <div className="flex flex-col items-end">
                    <span
                      className="text-[10px] uppercase tracking-[0.4em] mb-2 opacity-50"
                      style={{ color: primaryColor }}
                    >
                      Final Quote
                    </span>
                    <span
                      className="text-5xl italic tracking-tighter"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                </div>
                <div className="pt-6 mt-2 border-t border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2 text-right">
                    Sum in Words
                  </p>
                  <p className="text-xs text-gray-600 italic font-bold text-right leading-relaxed px-2">
                    {convertAmountToWords(data.totalAmount, data.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer Row */}
          <div
            className="mt-12 p-6 rounded-2xl border-2 border-dashed flex items-center gap-6"
            style={{ backgroundColor: "#EAC43505", borderColor: "#EAC43540" }}
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#EAC435] text-white flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500 font-black leading-relaxed flex-1">
              NOTE: Pricing is subject to availability and current exchange
              rates. This quotation remains valid for 5 business days from the
              issue date.
            </p>
          </div>
        </div>

        {/* Dynamic Footer */}
        <div
          className="p-10 border-t border-gray-50 flex items-center justify-between"
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <div className="flex items-center gap-5 group">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center p-3 opacity-40 group-hover:opacity-100 transition-all duration-500">
              <img
                src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
                alt="OmniReceipts"
                className="grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
                Generated with OmniReceipts
              </span>
              <span className="text-[8px] text-gray-300 uppercase font-black tracking-widest mt-1">
                Professional Document Standard
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: primaryColor,
                  opacity: 0.2 + i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate12;
