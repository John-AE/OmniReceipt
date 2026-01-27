import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate4Props {
  data: QuotationData;
}

const QuotationTemplate4: React.FC<QuotationTemplate4Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Quotation Template 4

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="text-white p-8 rounded-t-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tight">
              Quotation
            </h1>
            <p className="text-xl mt-2 opacity-90 font-medium">
              #{data.quotationNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
                Quotation Date
              </p>
              <p className="text-lg font-semibold">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-gray-200 p-8 rounded-b-lg shadow-sm">
        {/* Company and Customer Details */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <div
              className="p-6 rounded-lg border-l-4"
              style={{
                backgroundColor: `${primaryColor}08`,
                borderLeftColor: primaryColor,
              }}
            >
              <h3
                className="font-bold text-xs uppercase tracking-widest mb-3 opacity-70"
                style={{ color: primaryColor }}
              >
                From
              </h3>
              <h4 className="font-bold text-lg text-gray-800">
                {data.companyName}
              </h4>
              <p className="text-gray-600 font-medium">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-gray-600 text-sm mt-1">
                  {data.companyAddress}
                </p>
              )}
            </div>
          </div>
          <div>
            <div
              className="p-6 rounded-lg border-l-4"
              style={{
                backgroundColor: `${primaryColor}08`,
                borderLeftColor: primaryColor,
              }}
            >
              <h3
                className="font-bold text-xs uppercase tracking-widest mb-3 opacity-70"
                style={{ color: primaryColor }}
              >
                Prepared For
              </h3>
              <h4 className="font-bold text-lg text-gray-800">
                {data.customerName}
              </h4>
              <p className="text-gray-600 font-medium">{data.customerPhone}</p>
              {data.customerEmail && (
                <p className="text-gray-600 text-sm mt-1">
                  {data.customerEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight flex items-center gap-2">
            Items & Services
            <div className="h-px flex-1 bg-gray-200"></div>
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead style={{ backgroundColor: `${primaryColor}15` }}>
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider text-gray-700">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-800">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
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
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end">
          <div className="w-80">
            <div
              className="p-6 rounded-lg border shadow-sm"
              style={{
                backgroundColor: `${primaryColor}05`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(data.subTotal, data.currency, data.locale)}
                  </span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Tax ({data.taxRate}%):
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(
                        data.totalAmount - data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div
                    className="flex justify-between text-xl font-black"
                    style={{ color: primaryColor }}
                  >
                    <span>TOTAL:</span>
                    <span>
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200/60">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest text-right mb-1">
                    Amount in Words
                  </p>
                  <p className="text-xs text-gray-700 italic text-right font-medium leading-relaxed">
                    {convertAmountToWords(data.totalAmount, data.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validity Notice */}
        <div
          className="mt-8 p-5 rounded-xl border-2 border-dashed flex items-start gap-4"
          style={{
            backgroundColor: `${primaryColor}05`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div
            className="p-2 rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: primaryColor }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: primaryColor }}>
              Valid Until: {new Date(data.validUntil).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              This quotation is valid for 5 days and subject to changing supply
              and/or demand. Please confirm acceptance within the validity
              period.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4 text-gray-400">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              className="h-6 w-6 grayscale opacity-40"
            />
            <span className="font-poppins text-[10px] uppercase tracking-[0.2em]">
              Sent using OmniReceipts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate4;
