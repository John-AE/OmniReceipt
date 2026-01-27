import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate11Props {
  data: QuotationData;
}

const QuotationTemplate11: React.FC<QuotationTemplate11Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#E63946"; // Default red for Quotation Template 11
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
        style={{ borderColor: primaryColor }}
      >
        {/* Header - Vermilion Theme */}
        <div
          className="text-white p-10"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-6xl font-black tracking-tighter leading-none mb-4">
                QUOTATION
              </h1>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20">
                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  Ref No: #{data.quotationNumber}
                </span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <h2 className="text-3xl font-black tracking-tight">
                {data.companyName}
              </h2>
              <div className="bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <p className="font-bold">{data.companyPhone}</p>
                {data.companyAddress && (
                  <p className="text-xs mt-1 opacity-80 max-w-[200px] leading-relaxed ml-auto">
                    {data.companyAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-gradient-to-b from-transparent to-gray-50/30">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div
              className="p-6 rounded-2xl border-2 transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}15`,
              }}
            >
              <h3
                className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 opacity-50"
                style={{ color: primaryColor }}
              >
                Client Details
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
              className="p-6 rounded-2xl border-2 transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}15`,
              }}
            >
              <h3
                className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 opacity-50"
                style={{ color: primaryColor }}
              >
                Date Issued
              </h3>
              <p className="font-black text-gray-800 text-xl tracking-tight">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="p-6 rounded-2xl border-2 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "#EAC43508", borderColor: "#EAC43530" }}
            >
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-[#B8961E] opacity-60">
                Valid Until
              </h3>
              <p className="font-black text-gray-800 text-xl tracking-tight">
                {new Date(data.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div
            className="mb-12 rounded-2xl overflow-hidden border-2 shadow-sm"
            style={{ borderColor: `${primaryColor}15` }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <th className="text-left p-6 font-black text-xs uppercase tracking-widest">
                    Service Description
                  </th>
                  <th className="text-center p-6 font-black text-xs uppercase tracking-widest">
                    Qty
                  </th>
                  <th className="text-right p-6 font-black text-xs uppercase tracking-widest">
                    Unit Rate
                  </th>
                  <th className="text-right p-6 font-black text-xs uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-6 text-gray-800 font-black tracking-tight">
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
                    <td
                      className="p-6 text-right font-black text-gray-900 text-lg"
                      style={{
                        color:
                          index === data.items.length - 1
                            ? primaryColor
                            : "inherit",
                      }}
                    >
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

          {/* Totals Section */}
          <div className="flex justify-end pr-2">
            <div className="w-96">
              <div
                className="p-8 rounded-[2.5rem] border-4 shadow-2xl relative overflow-hidden"
                style={{ backgroundColor: "white", borderColor: primaryColor }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -mr-10 -mt-10"
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-300">
                    <span>Subtotal</span>
                    <span className="text-gray-800 text-sm">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-300">
                      <span>VAT ({data.taxRate}%)</span>
                      <span className="text-gray-800 text-sm">
                        {formatCurrency(taxAmount, data.currency, data.locale)}
                      </span>
                    </div>
                  )}
                  <div
                    className="pt-6 border-t-4"
                    style={{ borderTopColor: `${primaryColor}20` }}
                  >
                    <div className="flex flex-col items-end">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-50"
                        style={{ color: primaryColor }}
                      >
                        Estimated Total
                      </span>
                      <span
                        className="text-5xl font-black italic tracking-tighter"
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
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-2 text-right">
                      In Words
                    </p>
                    <p className="text-xs text-gray-500 italic font-black text-right leading-relaxed">
                      {convertAmountToWords(data.totalAmount, data.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notice Card */}
          <div
            className="mt-12 p-6 rounded-3xl border-2 border-dashed flex items-center gap-6"
            style={{ backgroundColor: "#EAC43505", borderColor: "#EAC43540" }}
          >
            <div className="h-12 w-12 rounded-2xl bg-[#EAC43515] flex items-center justify-center text-[#B8961E]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-black leading-relaxed flex-1 italic">
              * This quotation is subject to market fluctuations. Validity is 5
              business days from issue date. Kindly finalize documentation
              within this window.
            </p>
          </div>
        </div>

        {/* Brand Footer */}
        <div
          className="p-10 border-t border-gray-50 flex items-center justify-between"
          style={{ backgroundColor: `${primaryColor}03` }}
        >
          <div className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center p-2 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              <img
                src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
                alt="OmniReceipts Logo"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-poppins text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                Sent via OmniReceipts
              </span>
              <span className="text-[8px] text-gray-200 uppercase font-bold tracking-widest mt-0.5">
                Premium Billing Solution
              </span>
            </div>
          </div>
          <div
            className="h-1 w-24 rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate11;
