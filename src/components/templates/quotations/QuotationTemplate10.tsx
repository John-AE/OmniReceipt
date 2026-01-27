import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate10Props {
  data: QuotationData;
}

const QuotationTemplate10: React.FC<QuotationTemplate10Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Quotation Template 10
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-2xl overflow-hidden shadow-xl"
        style={{ borderColor: primaryColor }}
      >
        {/* Header - Phiox Theme */}
        <div
          className="text-white p-8"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-black tracking-tighter">
                QUOTATION
              </h1>
              <div className="mt-4 bg-white/20 inline-block px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                <span className="font-bold text-sm tracking-widest">
                  #{data.quotationNumber}
                </span>
              </div>
            </div>
            <div className="text-right bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
              <h2 className="text-2xl font-black tracking-tight mb-1">
                {data.companyName}
              </h2>
              <p className="opacity-90 font-medium">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="opacity-80 text-xs mt-1 leading-relaxed">
                  {data.companyAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-bold text-[10px] uppercase tracking-[0.2em] mb-3 opacity-60"
                style={{ color: primaryColor }}
              >
                Prepared For
              </h3>
              <p className="font-black text-gray-800 text-lg tracking-tight">
                {data.customerName}
              </p>
              <p className="text-gray-600 font-bold text-sm mt-1">
                {data.customerPhone}
              </p>
              {data.customerEmail && (
                <p className="text-gray-500 text-xs font-medium mt-1 truncate">
                  {data.customerEmail}
                </p>
              )}
            </div>
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-bold text-[10px] uppercase tracking-[0.2em] mb-3 opacity-60"
                style={{ color: primaryColor }}
              >
                Issued On
              </h3>
              <p className="font-black text-gray-800 text-lg tracking-tight">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-bold text-[10px] uppercase tracking-[0.2em] mb-3 opacity-60"
                style={{ color: primaryColor }}
              >
                Valid Until
              </h3>
              <p className="font-black text-gray-800 text-lg tracking-tight">
                {new Date(data.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div
            className="mb-10 rounded-2xl overflow-hidden border shadow-sm"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <th className="text-left p-5 font-black text-xs uppercase tracking-widest">
                    Description
                  </th>
                  <th className="text-center p-5 font-black text-xs uppercase tracking-widest">
                    Qty
                  </th>
                  <th className="text-right p-5 font-black text-xs uppercase tracking-widest">
                    Rate
                  </th>
                  <th className="text-right p-5 font-black text-xs uppercase tracking-widest">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-100/50 transition-colors`}
                  >
                    <td className="p-5 text-gray-800 font-bold">
                      {item.description}
                    </td>
                    <td className="p-5 text-center text-gray-600 font-bold">
                      {item.quantity}
                    </td>
                    <td className="p-5 text-right text-gray-600 font-medium">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="p-5 text-right font-black text-gray-900">
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

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div
                className="p-6 rounded-2xl border-2 shadow-xl"
                style={{
                  backgroundColor: `${primaryColor}05`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-800">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>Tax ({data.taxRate}%)</span>
                      <span className="text-gray-800">
                        {formatCurrency(taxAmount, data.currency, data.locale)}
                      </span>
                    </div>
                  )}
                  <div
                    className="pt-4 border-t-2"
                    style={{ borderTopColor: `${primaryColor}40` }}
                  >
                    <div
                      className="flex justify-between text-3xl font-black italic tracking-tighter"
                      style={{ color: primaryColor }}
                    >
                      <span>TOTAL</span>
                      <span>
                        {formatCurrency(
                          data.totalAmount,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest text-right mb-1 font-black">
                      Amount in Words
                    </p>
                    <p className="text-xs text-gray-600 italic text-right font-bold leading-relaxed px-2">
                      {convertAmountToWords(data.totalAmount, data.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          <div
            className="mt-10 p-5 rounded-2xl border flex items-center gap-4"
            style={{ backgroundColor: "#EAC43508", borderColor: "#EAC43530" }}
          >
            <div className="p-3 rounded-full bg-[#EAC435] text-white">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              * This quotation is valid for 5 days and subject to changing
              supply and/or demand. Please confirm within validity period.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-8 flex flex-col items-center gap-4 text-gray-400 border-t border-gray-100"
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              className="h-6 w-6 grayscale opacity-20"
            />
            <span className="font-poppins text-[10px] uppercase tracking-[0.3em] font-bold">
              Sent using OmniReceipts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate10;
