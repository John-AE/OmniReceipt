import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template5Props {
  data: InvoiceData;
}

const Template5: React.FC<Template5Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#FF7F11"; // Default orange for Template 5

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
              <h1 className="text-5xl font-light">Invoice</h1>
              <div className="mt-4 bg-white/20 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium">
                  # {data.invoiceNumber}
                </span>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
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
          {/* Invoice Details */}
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
                  Invoice Date
                </h3>
                <p className="text-lg">
                  {new Date(data.invoiceDate).toLocaleDateString()}
                </p>
              </div>
              {data.paymentDate && (
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: `${primaryColor}10` }}
                >
                  <h3
                    className="font-semibold text-sm uppercase mb-2"
                    style={{ color: primaryColor }}
                  >
                    Due Date
                  </h3>
                  <p className="text-lg">
                    {new Date(data.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-700 font-semibold text-sm uppercase mb-2">
                  Bill To
                </h3>
                <p className="font-semibold">{data.customerName}</p>
                <p className="text-sm text-gray-600">{data.customerPhone}</p>
                {data.customerEmail && (
                  <p className="text-sm text-gray-600">{data.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table with modern styling */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Services Provided
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderBottomColor: `${primaryColor}30`,
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Item Description
                    </th>
                    <th
                      className="px-6 py-4 text-center font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Qty
                    </th>
                    <th
                      className="px-6 py-4 text-right font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Unit Price
                    </th>
                    <th
                      className="px-6 py-4 text-right font-semibold"
                      style={{ color: primaryColor }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items
                    .filter((item) => !item.isPayment)
                    .map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">{item.description}</td>
                        <td className="px-6 py-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(
                            item.unitPrice,
                            data.currency,
                            data.locale,
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
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
                        className="border-b border-gray-100"
                        style={{ backgroundColor: `${primaryColor}05` }}
                      >
                        <td
                          className="px-6 py-4 italic font-medium"
                          style={{ color: primaryColor }}
                          colSpan={3}
                        >
                          {item.description}
                        </td>
                        <td
                          className="px-6 py-4 text-right font-semibold"
                          style={{ color: primaryColor }}
                        >
                          ({Math.abs(item.totalPrice).toLocaleString()})
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
                className="border-2 rounded-xl p-6"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}30`,
                }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  {data.taxRate > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({data.taxRate}%):</span>
                      <span className="font-medium">
                        {formatCurrency(
                          data.totalAmount - data.subTotal,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                  )}
                  <div
                    className="border-t-2 pt-4"
                    style={{ borderTopColor: `${primaryColor}50` }}
                  >
                    {hasPartialPayments ? (
                      <>
                        <div className="flex justify-between text-gray-600 mb-2">
                          <span>Original Total:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              data.totalAmount,
                              data.currency,
                              data.locale,
                            )}
                          </span>
                        </div>
                        <div
                          className="flex justify-between font-medium mb-2"
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
                        <div
                          className="flex justify-between text-2xl font-bold border-t pt-2"
                          style={{
                            color: primaryColor,
                            borderTopColor: `${primaryColor}30`,
                          }}
                        >
                          <span>Balance Due:</span>
                          <span>
                            {formatCurrency(
                              displayTotal,
                              data.currency,
                              data.locale,
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div
                        className="flex justify-between text-2xl font-bold"
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
                    )}
                    <div
                      className="mt-3 pt-3 border-t"
                      style={{ borderTopColor: `${primaryColor}30` }}
                    >
                      <p className="text-xs text-gray-700 italic">
                        <span className="font-semibold">
                          {convertAmountToWords(displayTotal, data.currency)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-8 pt-6 border-t flex items-center justify-center gap-2 text-gray-600"
          style={{ borderTopColor: `${primaryColor}30` }}
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

export default Template5;
