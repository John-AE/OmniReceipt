import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate5Props {
  data: QuotationData;
}

const QuotationTemplate5: React.FC<QuotationTemplate5Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Quotation Template 5

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-xl overflow-hidden"
        style={{ borderColor: primaryColor }}
      >
        {/* Header with modern design */}
        <div className="p-8" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h1 className="text-5xl font-light">Quotation</h1>
              <div className="mt-4 bg-white/20 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium">
                  # {data.quotationNumber}
                </span>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                <h2 className="text-xl font-semibold">{data.companyName}</h2>
                <p className="opacity-90">{data.companyPhone}</p>
                {data.companyAddress && (
                  <p className="opacity-90 text-sm">{data.companyAddress}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Quotation Details */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <h3
                  className="font-semibold text-sm uppercase mb-2"
                  style={{ color: primaryColor }}
                >
                  Quotation Date
                </h3>
                <p className="text-lg font-medium">
                  {new Date(data.quotationDate).toLocaleDateString()}
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <h3
                  className="font-semibold text-sm uppercase mb-2"
                  style={{ color: primaryColor }}
                >
                  Valid Until
                </h3>
                <p className="text-lg font-medium">
                  {new Date(data.validUntil).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-gray-600 font-semibold text-sm uppercase mb-2 tracking-tight">
                  Prepared For
                </h3>
                <p className="font-bold text-gray-800">{data.customerName}</p>
                <p className="text-sm text-gray-600 font-medium">
                  {data.customerPhone}
                </p>
                {data.customerEmail && (
                  <p className="text-sm text-gray-600">{data.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table with modern styling */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
              Services & Items
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      borderColor: `${primaryColor}20`,
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Item Description
                    </th>
                    <th
                      className="px-6 py-4 text-center font-bold text-sm uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Qty
                    </th>
                    <th
                      className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Unit Price
                    </th>
                    <th
                      className="px-6 py-4 text-right font-bold text-sm uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">
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

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div
                className="rounded-xl p-6 border-2"
                style={{
                  backgroundColor: `${primaryColor}08`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Tax ({data.taxRate}%):</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(
                          data.totalAmount - data.subTotal,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                  )}
                  <div
                    className="pt-4 border-t-2"
                    style={{ borderTopColor: `${primaryColor}40` }}
                  >
                    <div
                      className="flex justify-between text-2xl font-black"
                      style={{ color: primaryColor }}
                    >
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          data.totalAmount,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-700 italic text-right font-medium leading-relaxed">
                        {convertAmountToWords(data.totalAmount, data.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          <div
            className="mt-8 p-4 rounded-lg border flex items-center gap-3"
            style={{
              backgroundColor: `${primaryColor}05`,
              borderColor: `${primaryColor}20`,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: primaryColor }}
            ></div>
            <p className="text-xs text-gray-600 text-center flex-1 font-medium">
              This quotation is valid for 5 days and subject to changing supply
              and/or demand.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-8 border-t flex items-center justify-center gap-2 text-gray-400"
          style={{ borderTopColor: `${primaryColor}20` }}
        >
          <img
            src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
            alt="OmniReceipts Logo"
            className="h-5 w-5 grayscale opacity-30"
          />
          <span className="font-poppins text-xs uppercase tracking-[0.2em]">
            Sent using OmniReceipts
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate5;
