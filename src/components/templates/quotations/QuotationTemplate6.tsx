import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate6Props {
  data: QuotationData;
}

const QuotationTemplate6: React.FC<QuotationTemplate6Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Quotation Template 6

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border border-gray-300 shadow-lg">
        {/* Header */}
        <div
          className="p-8 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">QUOTATION</h1>
              <p className="text-white/80 text-lg font-medium">
                #{data.quotationNumber}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">{data.companyName}</h2>
              <p className="text-white/80">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-white/80 text-sm">{data.companyAddress}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Quotation and Customer Info */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <h3
                className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4 pb-2 border-b-2"
                style={{ borderBottomColor: primaryColor }}
              >
                Prepared For
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-lg">{data.customerName}</p>
                <p className="text-gray-600 font-medium">
                  {data.customerPhone}
                </p>
                {data.customerEmail && (
                  <p className="text-gray-600 text-sm">{data.customerEmail}</p>
                )}
              </div>
            </div>
            <div>
              <h3
                className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4 pb-2 border-b-2"
                style={{ borderBottomColor: primaryColor }}
              >
                Quotation Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Issue Date:</span>
                  <span className="font-bold text-gray-800">
                    {new Date(data.quotationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    Valid Until:
                  </span>
                  <span className="font-bold text-gray-800">
                    {new Date(data.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">
                    Description
                  </th>
                  <th className="p-4 text-center font-bold text-sm uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="p-4 text-right font-bold text-sm uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="p-4 text-right font-bold text-sm uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"} hover:bg-gray-100/50 transition-colors`}
                  >
                    <td className="p-4 border-b border-gray-100 text-gray-800">
                      {item.description}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-right text-gray-600">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-right font-bold text-gray-900">
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

          {/* Payment Summary */}
          <div className="flex justify-end">
            <div className="w-80">
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 text-right text-gray-500 font-medium uppercase text-[10px] tracking-widest">
                      Subtotal
                    </td>
                    <td className="py-3 text-right font-bold text-gray-800 w-32">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                  </tr>
                  {data.taxRate > 0 && (
                    <tr>
                      <td className="py-3 text-right text-gray-500 font-medium uppercase text-[10px] tracking-widest">
                        Tax ({data.taxRate}%)
                      </td>
                      <td className="py-3 text-right font-bold text-gray-800">
                        {formatCurrency(
                          data.totalAmount - data.subTotal,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: `2px solid ${primaryColor}` }}>
                    <td
                      className="py-4 text-right font-black text-xl uppercase tracking-tighter"
                      style={{ color: primaryColor }}
                    >
                      TOTAL
                    </td>
                    <td
                      className="py-4 text-right font-black text-xl"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="pt-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest text-right mb-1 font-bold">
                        Amount in Words
                      </p>
                      <p className="text-xs text-gray-600 italic text-right font-medium leading-relaxed">
                        {convertAmountToWords(data.totalAmount, data.currency)}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div
              className="rounded-lg p-5 mb-6 border-l-4"
              style={{
                backgroundColor: `${primaryColor}08`,
                borderLeftColor: primaryColor,
              }}
            >
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                <span className="font-bold" style={{ color: primaryColor }}>
                  NOTE:
                </span>{" "}
                This quotation is valid for 5 days and subject to changing
                supply and/or demand. Please confirm your order within this
                period.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="flex items-center gap-2">
                <img
                  src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
                  alt="OmniReceipts Logo"
                  className="h-5 w-5 grayscale opacity-30"
                />
                <span className="font-poppins text-[10px] uppercase tracking-[0.2em]">
                  Sent using OmniReceipts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate6;
