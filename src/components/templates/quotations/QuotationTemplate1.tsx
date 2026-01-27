import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";

interface QuotationTemplate1Props {
  data: QuotationData;
}

const QuotationTemplate1: React.FC<QuotationTemplate1Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Quotation Template 1

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-lg overflow-hidden"
        style={{ borderColor: primaryColor }}
      >
        {/* Header */}
        <div className="p-6" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">QUOTATION</h1>
              <p className="text-lg mt-2 font-medium opacity-90">
                #{data.quotationNumber}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">{data.companyName}</h2>
              <p>{data.companyPhone}</p>
              {data.companyAddress && <p>{data.companyAddress}</p>}
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3
                className="font-semibold text-lg mb-3"
                style={{
                  color: primaryColor === "#EAC435" ? "#856404" : primaryColor,
                }}
              >
                Prepared For:
              </h3>
              <p className="font-semibold">{data.customerName}</p>
              <p>{data.customerPhone}</p>
              {data.customerEmail && <p>{data.customerEmail}</p>}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold">Quotation Date: </span>
                <span>{new Date(data.quotationDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-semibold">Valid Until: </span>
                <span>{new Date(data.validUntil).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-50">
                <th
                  className="text-left p-3 border-b-2"
                  style={{ borderBottomColor: primaryColor }}
                >
                  Description
                </th>
                <th
                  className="text-center p-3 border-b-2"
                  style={{ borderBottomColor: primaryColor }}
                >
                  Qty
                </th>
                <th
                  className="text-right p-3 border-b-2"
                  style={{ borderBottomColor: primaryColor }}
                >
                  Unit Price
                </th>
                <th
                  className="text-right p-3 border-b-2"
                  style={{ borderBottomColor: primaryColor }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(item.unitPrice, data.currency, data.locale)}
                  </td>
                  <td className="p-3 text-right font-medium">
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

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({data.taxRate}%):</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount - data.subTotal,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              <div
                className="flex justify-between font-bold text-lg pt-2 border-t mt-2"
                style={{
                  color: primaryColor === "#EAC435" ? "#856404" : primaryColor,
                }}
              >
                <span>Total:</span>
                <span>
                  {formatCurrency(data.totalAmount, data.currency, data.locale)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-700 italic text-right">
                  <span className="font-semibold">
                    {convertAmountToWords(data.totalAmount, data.currency)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          <div
            className="mt-8 p-4 rounded-lg border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: primaryColor,
            }}
          >
            <p className="text-sm text-gray-700 text-center">
              This quotation is valid for 5 days and subject to changing supply
              and/or demand.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-600">
          <img
            src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
            alt="OmniReceipts Logo"
            className="h-5 w-5"
          />
          <span className="font-poppins text-sm">Sent using OmniReceipts</span>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate1;
