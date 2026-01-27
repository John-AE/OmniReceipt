import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate9Props {
  data: QuotationData;
}

const QuotationTemplate9: React.FC<QuotationTemplate9Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Quotation Template 9
  const taxAmount = (data.subTotal * (data.taxRate || 0)) / 100;

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-t-8 shadow-lg"
        style={{ borderTopColor: primaryColor }}
      >
        {/* Header */}
        <div className="bg-white p-8 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1
                className="text-5xl font-extrabold tracking-tight"
                style={{ color: primaryColor }}
              >
                QUOTATION
              </h1>
              <p className="text-gray-500 mt-2 text-lg font-medium">
                #{data.quotationNumber}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">
                {data.companyName}
              </h2>
              <p className="text-gray-600 font-medium">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-gray-500 text-sm mt-1">
                  {data.companyAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Info Section */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div
              className="p-5 rounded-lg border-l-4"
              style={{
                backgroundColor: `${primaryColor}08`,
                borderLeftColor: primaryColor,
              }}
            >
              <h3
                className="font-bold text-xs uppercase mb-2 opacity-70"
                style={{ color: primaryColor }}
              >
                Prepared For
              </h3>
              <p className="font-bold text-gray-800">{data.customerName}</p>
              <p className="text-gray-600 text-sm font-medium">
                {data.customerPhone}
              </p>
              {data.customerEmail && (
                <p className="text-gray-600 text-xs mt-1 truncate">
                  {data.customerEmail}
                </p>
              )}
            </div>
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-gray-400">
              <h3 className="text-gray-500 font-bold text-xs uppercase mb-2">
                Quotation Date
              </h3>
              <p className="font-bold text-gray-800">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className="p-5 rounded-lg border-l-4 border-[#EAC435]"
              style={{ backgroundColor: "#EAC43515" }}
            >
              <h3 className="text-[#B8961E] font-bold text-xs uppercase mb-2">
                Valid Until
              </h3>
              <p className="font-bold text-gray-800">
                {new Date(data.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
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
                    className="hover:bg-gray-50/50 transition-colors"
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
            <div className="w-80">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium tracking-tight">
                      Subtotal
                    </span>
                    <span className="font-bold text-gray-800">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
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
                  <hr className="border-gray-200" />
                  <div
                    className="flex justify-between text-2xl font-black"
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
                  <div className="pt-4 mt-1 border-t border-gray-200">
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
            className="mt-8 p-4 rounded-lg border-2 border-dashed flex items-center gap-3"
            style={{ backgroundColor: "#EAC43508", borderColor: "#EAC43540" }}
          >
            <div className="h-2 w-2 rounded-full bg-[#EAC435]"></div>
            <p className="text-xs text-gray-600 text-center flex-1 font-medium">
              This quotation is valid for 5 days and subject to changing supply
              and/or demand.
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
              className="h-5 w-5 grayscale opacity-30"
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

export default QuotationTemplate9;
