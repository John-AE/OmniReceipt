import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template10Props {
  data: InvoiceData;
}

const Template10: React.FC<Template10Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Template 10

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border-l-8 pl-6" style={{ borderColor: primaryColor }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-light text-gray-800 mb-2">
                Invoice
              </h1>
              <p
                className="text-xl font-medium"
                style={{ color: primaryColor }}
              >
                #{data.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">
                {data.companyName}
              </h2>
              <p className="text-gray-600">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-gray-600">{data.companyAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div
          className="p-6 rounded-lg mb-8"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Bill To:
              </h3>
              <p className="font-medium">{data.customerName}</p>
              <p className="text-gray-600">{data.customerPhone}</p>
              {data.customerEmail && (
                <p className="text-gray-600">{data.customerEmail}</p>
              )}
            </div>
            <div>
              <h3
                className="font-semibold mb-2"
                style={{ color: primaryColor }}
              >
                Invoice Date:
              </h3>
              <p>{new Date(data.invoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              {data.paymentDate && (
                <>
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: primaryColor }}
                  >
                    Due Date:
                  </h3>
                  <p>{new Date(data.paymentDate).toLocaleDateString()}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                <th className="text-left py-4 font-semibold text-gray-800">
                  Description
                </th>
                <th className="text-center py-4 font-semibold text-gray-800">
                  Qty
                </th>
                <th className="text-right py-4 font-semibold text-gray-800">
                  Rate
                </th>
                <th className="text-right py-4 font-semibold text-gray-800">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items
                .filter((item) => !item.isPayment)
                .map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 text-gray-800">{item.description}</td>
                    <td className="py-4 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-right text-gray-600">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">
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
                  <tr
                    key={`payment-${index}`}
                    className="border-b border-gray-100 italic"
                    style={{ backgroundColor: `${primaryColor}05` }}
                  >
                    <td
                      className="py-4 font-medium"
                      style={{ color: primaryColor }}
                      colSpan={3}
                    >
                      {item.description}
                    </td>
                    <td
                      className="py-4 text-right font-semibold"
                      style={{ color: primaryColor }}
                    >
                      (
                      {formatCurrency(
                        Math.abs(item.totalPrice),
                        data.currency,
                        data.locale,
                      )}
                      )
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800 font-medium">
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-gray-600">Tax ({data.taxRate}%):</span>
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(
                      data.totalAmount - data.subTotal,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              {hasPartialPayments ? (
                <>
                  <div className="flex justify-between mb-3 text-sm border-t pt-2">
                    <span className="text-gray-600">Original Total:</span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div
                    className="flex justify-between mb-3 text-sm font-medium"
                    style={{ color: primaryColor }}
                  >
                    <span>Amount Paid:</span>
                    <span>
                      -
                      {formatCurrency(
                        data.amountPaid || 0,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <hr className="my-3 border-gray-200" />
                  <div
                    className="flex justify-between text-xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    <span>Balance Due:</span>
                    <span>
                      {formatCurrency(displayTotal, data.currency, data.locale)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <hr className="my-3 border-gray-200" />
                  <div
                    className="flex justify-between text-xl font-bold"
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
                </>
              )}
              <div
                className="mt-3 pt-3 border-t"
                style={{ borderTopColor: `${primaryColor}40` }}
              >
                <p className="text-xs text-gray-700 italic text-right">
                  <span className="font-semibold">
                    {convertAmountToWords(displayTotal, data.currency)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t flex items-center justify-center gap-2 text-gray-600"
          style={{ borderTopColor: `${primaryColor}40` }}
        >
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

export default Template10;
