import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate8Props {
  data: QuotationData;
}

const QuotationTemplate8: React.FC<QuotationTemplate8Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#7e22ce"; // Default purple-700 for Quotation Template 8
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border border-gray-200 shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="text-white p-8"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`,
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-light tracking-wider">Quotation</h1>
              <div className="mt-3 inline-block bg-white/20 px-4 py-2 rounded-full border border-white/20">
                <span className="text-sm font-medium">
                  #{data.quotationNumber}
                </span>
              </div>
            </div>
            <div className="text-right bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <h2 className="text-2xl font-bold">{data.companyName}</h2>
              <p className="opacity-90">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="opacity-80 text-sm">{data.companyAddress}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div
              className="p-6 rounded-xl border border-gray-100"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <h3
                className="font-bold text-xs uppercase tracking-widest mb-3 opacity-70"
                style={{ color: primaryColor }}
              >
                Prepared For
              </h3>
              <p className="text-xl font-bold text-gray-800">
                {data.customerName}
              </p>
              <p className="text-gray-600 mt-1 font-medium">
                {data.customerPhone}
              </p>
              {data.customerEmail && (
                <p className="text-gray-600 text-sm">{data.customerEmail}</p>
              )}
            </div>
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border border-gray-100"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <h3
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                  style={{ color: primaryColor }}
                >
                  Quotation Date
                </h3>
                <p className="text-lg font-bold mt-1 text-gray-800">
                  {new Date(data.quotationDate).toLocaleDateString()}
                </p>
              </div>
              <div
                className="p-4 rounded-xl border border-gray-100"
                style={{ backgroundColor: `${primaryColor}08` }}
              >
                <h3
                  className="font-bold text-xs uppercase tracking-widest opacity-70"
                  style={{ color: primaryColor }}
                >
                  Valid Until
                </h3>
                <p className="text-lg font-bold mt-1 text-gray-800">
                  {new Date(data.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4 tracking-tight">
              Items & Services
            </h3>
            <div
              className="rounded-xl overflow-hidden border shadow-sm"
              style={{ borderColor: `${primaryColor}20` }}
            >
              <table className="w-full border-collapse">
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
                      Rate
                    </th>
                    <th className="text-right p-4 font-bold text-sm uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50/30" : "bg-white"}
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
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div
                className="p-6 rounded-xl border shadow-sm"
                style={{
                  background: `linear-gradient(to bottom right, ${primaryColor}08, ${primaryColor}15)`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span className="font-medium">
                        Tax ({data.taxRate}%):
                      </span>
                      <span className="font-bold text-gray-800">
                        {formatCurrency(taxAmount, data.currency, data.locale)}
                      </span>
                    </div>
                  )}
                  <hr style={{ borderColor: `${primaryColor}40` }} />
                  <div
                    className="flex justify-between text-2xl font-black"
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
                  <div className="pt-4 border-t border-gray-200">
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
          </div>

          {/* Validity Notice */}
          <div
            className="mt-8 p-4 rounded-xl border-t-4 shadow-sm"
            style={{
              backgroundColor: `${primaryColor}05`,
              borderTopColor: primaryColor,
            }}
          >
            <p className="text-xs text-gray-600 text-center font-medium">
              This quotation is valid for 5 days and subject to changing supply
              and/or demand. Acceptance of this quotation implies agreement to
              the terms specified.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 flex flex-col items-center gap-3 text-gray-400 border-t border-gray-100"
          style={{ backgroundColor: `${primaryColor}05` }}
        >
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              className="h-6 w-6 grayscale opacity-30"
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

export default QuotationTemplate8;
