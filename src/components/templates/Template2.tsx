import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";
import { formatCurrency } from "@/utils/invoiceCalculations";

interface Template2Props {
  data: InvoiceData;
}

const Template2: React.FC<Template2Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Template 2

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border border-gray-300">
        {/* Header */}
        <div
          className="text-white p-6"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">INVOICE</h1>
            <div className="text-right">
              <p className="text-lg">#{data.invoiceNumber}</p>
              <p>{new Date(data.invoiceDate).toLocaleDateString()}</p>
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
                className="bg-gray-50 p-4 rounded border-t-2"
                style={{ borderColor: primaryColor }}
              >
                <p className="font-semibold text-lg">{data.companyName}</p>
                <p>{data.companyPhone}</p>
                {data.companyAddress && <p>{data.companyAddress}</p>}
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
                className="bg-gray-50 p-4 rounded border-t-2"
                style={{ borderColor: primaryColor }}
              >
                <p className="font-semibold text-lg">{data.customerName}</p>
                <p>{data.customerPhone}</p>
                {data.customerEmail && <p>{data.customerEmail}</p>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              SERVICES PROVIDED
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-3 text-left">Item</th>
                  <th className="border border-gray-300 p-3 text-center">
                    Qty
                  </th>
                  <th className="border border-gray-300 p-3 text-right">
                    Rate
                  </th>
                  <th className="border border-gray-300 p-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items
                  .filter((item) => !item.isPayment)
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3">
                        {item.description}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        {formatCurrency(
                          item.unitPrice,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        {formatCurrency(
                          item.totalPrice,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                    </tr>
                  ))}
                {/* Partial Payments as deductions */}
                {data.items
                  .filter((item) => item.isPayment)
                  .map((item, index) => (
                    <tr key={`payment-${index}`} className="bg-red-50">
                      <td
                        className="border border-gray-300 p-3 text-red-700 italic"
                        colSpan={3}
                      >
                        {item.description}
                      </td>
                      <td className="border border-gray-300 p-3 text-right text-red-700 font-semibold">
                        ({Math.abs(item.totalPrice).toLocaleString()})
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="flex justify-end">
            <div className="w-64 bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span>
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between mb-2">
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
              <hr className="my-2" />
              {hasPartialPayments ? (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Original Total:</span>
                    <span>
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 text-red-600">
                    <span className="font-medium">Amount Paid:</span>
                    <span>
                      -
                      {formatCurrency(
                        data.amountPaid || 0,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-xl border-t pt-2">
                    <span>BALANCE DUE:</span>
                    <span>
                      {formatCurrency(displayTotal, data.currency, data.locale)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-bold text-xl">
                  <span>TOTAL:</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-700 italic">
                  <span className="font-semibold">
                    {convertAmountToWords(displayTotal, data.currency)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex items-center justify-center gap-2 text-gray-600">
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

export default Template2;
