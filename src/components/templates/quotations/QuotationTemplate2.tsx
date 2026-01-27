import React from "react";
import { QuotationData } from "@/utils/quotationRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";

interface QuotationTemplate2Props {
  data: QuotationData;
}

const QuotationTemplate2: React.FC<QuotationTemplate2Props> = ({ data }) => {
  const primaryColor = data.primaryColor || "#1f2937"; // Default gray-800 for Quotation Template 2

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border border-gray-300 shadow-sm">
        {/* Header */}
        <div
          className="text-white p-6"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">QUOTATION</h1>
            <div className="text-right">
              <p className="text-lg font-medium opacity-90">
                #{data.quotationNumber}
              </p>
              <p className="opacity-80">
                {new Date(data.quotationDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Company and Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3
                className="font-bold text-lg mb-3"
                style={{ color: primaryColor }}
              >
                FROM:
              </h3>
              <div
                className="bg-gray-50 p-4 rounded border-l-4"
                style={{ borderLeftColor: primaryColor }}
              >
                <p className="font-semibold text-lg">{data.companyName}</p>
                <p className="text-gray-600">{data.companyPhone}</p>
                {data.companyAddress && (
                  <p className="text-gray-600">{data.companyAddress}</p>
                )}
              </div>
            </div>
            <div>
              <h3
                className="font-bold text-lg mb-3"
                style={{ color: primaryColor }}
              >
                TO:
              </h3>
              <div
                className="bg-gray-50 p-4 rounded border-l-4"
                style={{ borderLeftColor: primaryColor }}
              >
                <p className="font-semibold text-lg">{data.customerName}</p>
                <p className="text-gray-600">{data.customerPhone}</p>
                {data.customerEmail && (
                  <p className="text-gray-600">{data.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Valid Until */}
          <div
            className="mb-6 p-3 rounded-lg border"
            style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: primaryColor,
            }}
          >
            <p className="text-sm">
              <span className="font-semibold" style={{ color: primaryColor }}>
                Valid Until:
              </span>{" "}
              {new Date(data.validUntil).toLocaleDateString()}
            </p>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 text-gray-800 uppercase tracking-tight">
              Services / Items
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-3 text-left">
                    Item Description
                  </th>
                  <th className="border border-gray-200 p-3 text-center">
                    Qty
                  </th>
                  <th className="border border-gray-200 p-3 text-right">
                    Rate
                  </th>
                  <th className="border border-gray-200 p-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border border-gray-200 p-3">
                      {item.description}
                    </td>
                    <td className="border border-gray-200 p-3 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-200 p-3 text-right">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="border border-gray-200 p-3 text-right font-medium">
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
            <div className="w-72 bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-2 text-gray-600">
                <span className="font-medium">Subtotal:</span>
                <span>
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between mb-2 text-gray-600">
                  <span className="font-medium">Tax ({data.taxRate}%):</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount - data.subTotal,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              <hr className="my-3" />
              <div
                className="flex justify-between font-bold text-xl"
                style={{ color: primaryColor }}
              >
                <span>TOTAL:</span>
                <span>
                  {formatCurrency(data.totalAmount, data.currency, data.locale)}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                <p className="text-xs text-gray-700 italic">
                  <span className="font-semibold">
                    {convertAmountToWords(data.totalAmount, data.currency)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center italic">
              This quotation is valid for{" "}
              {new Date(data.validUntil).getDate() -
                new Date(data.quotationDate).getDate()}{" "}
              days and subject to changing supply and/or demand.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-500">
          <img
            src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
            alt="OmniReceipts Logo"
            className="h-5 w-5 grayscale opacity-50"
          />
          <span className="font-poppins text-xs uppercase tracking-widest">
            Sent using OmniReceipts
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotationTemplate2;
