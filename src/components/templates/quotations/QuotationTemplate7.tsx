import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate7Props {
  data: QuotationData;
}

const QuotationTemplate7: React.FC<QuotationTemplate7Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Quotation Template 7
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-lg overflow-hidden"
        style={{ borderColor: primaryColor }}
      >
        {/* Header */}
        <div
          className="text-white p-6"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-wide">QUOTATION</h1>
              <p className="mt-2 text-lg opacity-90 font-medium">
                #{data.quotationNumber}
              </p>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <h2 className="text-xl font-semibold">{data.companyName}</h2>
              <p className="opacity-90">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="opacity-80 text-sm">{data.companyAddress}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-semibold text-sm uppercase mb-2"
                style={{ color: primaryColor }}
              >
                Prepared For
              </h3>
              <p className="font-bold text-gray-800">{data.customerName}</p>
              <p className="text-sm text-gray-600 font-medium">
                {data.customerPhone}
              </p>
              {data.customerEmail && (
                <p className="text-sm text-gray-600 truncate">
                  {data.customerEmail}
                </p>
              )}
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-semibold text-sm uppercase mb-2"
                style={{ color: primaryColor }}
              >
                Quotation Date
              </h3>
              <p className="font-bold text-gray-800">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <h3
                className="font-semibold text-sm uppercase mb-2"
                style={{ color: primaryColor }}
              >
                Valid Until
              </h3>
              <p className="font-bold text-gray-800">
                {new Date(data.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div
            className="mb-8 rounded-lg overflow-hidden border shadow-sm"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <table className="w-full">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center p-4 font-bold text-sm uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50/50" : "bg-white"}
                  >
                    <td className="p-4 text-gray-800 font-medium">
                      {item.description}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="p-4 text-right text-gray-600">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-900">
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
            <div
              className="w-72 p-6 rounded-lg border shadow-sm"
              style={{
                background: `linear-gradient(to bottom right, ${primaryColor}08, ${primaryColor}15)`,
                borderColor: `${primaryColor}20`,
              }}
            >
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium tracking-tight">
                    Subtotal
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(data.subTotal, data.currency, data.locale)}
                  </span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium tracking-tight">
                      Tax ({data.taxRate}%)
                    </span>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(taxAmount, data.currency, data.locale)}
                    </span>
                  </div>
                )}
                <hr style={{ borderColor: `${primaryColor}30` }} />
                <div
                  className="flex justify-between text-xl font-black"
                  style={{ color: primaryColor }}
                >
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest text-right mb-1 font-bold">
                    Amount in Words
                  </p>
                  <p className="text-xs text-gray-700 italic text-right font-medium leading-relaxed">
                    {convertAmountToWords(data.totalAmount, data.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          <div
            className="mt-8 p-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2"
            style={{
              backgroundColor: `${primaryColor}05`,
              borderColor: `${primaryColor}30`,
            }}
          >
            <p className="text-xs text-gray-600 font-medium italic">
              * This quotation is valid for 5 days and subject to changing
              supply and/or demand.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex flex-col items-center gap-2 text-gray-400 border-t border-gray-100"
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              className="h-4 w-4 grayscale opacity-30"
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

export default QuotationTemplate7;
