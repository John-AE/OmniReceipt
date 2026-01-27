import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template6Props {
  data: InvoiceData;
}

const Template6: React.FC<Template6Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#2A324B"; // Default dark blue for Template 6

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div className="border border-gray-300 shadow-lg">
        {/* Header */}
        <div
          className="text-white p-8"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
              <p className="text-gray-300 text-lg">#{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">{data.companyName}</h2>
              <p className="text-gray-300">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-gray-300 text-sm">{data.companyAddress}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Invoice and Customer Info */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <h3
                className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4 pb-2 border-b-2"
                style={{ borderBottomColor: primaryColor }}
              >
                Bill To
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-lg">{data.customerName}</p>
                <p className="text-gray-600">{data.customerPhone}</p>
                {data.customerEmail && (
                  <p className="text-gray-600">{data.customerEmail}</p>
                )}
              </div>
            </div>
            <div>
              <h3
                className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4 pb-2 border-b-2"
                style={{ borderBottomColor: primaryColor }}
              >
                Invoice Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">
                    {new Date(data.invoiceDate).toLocaleDateString()}
                  </span>
                </div>
                {data.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">
                      {new Date(data.paymentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="p-4 text-left font-semibold"
                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                  >
                    Description
                  </th>
                  <th
                    className="p-4 text-center font-semibold"
                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                  >
                    Qty
                  </th>
                  <th
                    className="p-4 text-right font-semibold"
                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                  >
                    Unit Price
                  </th>
                  <th
                    className="p-4 text-right font-semibold"
                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items
                  .filter((item) => !item.isPayment)
                  .map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="p-4 border-b border-gray-200">
                        {item.description}
                      </td>
                      <td className="p-4 border-b border-gray-200 text-center">
                        {item.quantity}
                      </td>
                      <td className="p-4 border-b border-gray-200 text-right">
                        {formatCurrency(
                          item.unitPrice,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                      <td className="p-4 border-b border-gray-200 text-right font-semibold">
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
                    <tr key={`payment-${index}`} className="bg-green-50">
                      <td
                        className="p-4 border-b border-gray-200 text-green-700 italic"
                        colSpan={3}
                      >
                        {item.description}
                      </td>
                      <td className="p-4 border-b border-gray-200 text-right text-green-700 font-semibold">
                        ({Math.abs(item.totalPrice).toLocaleString()})
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
                <tbody>
                  <tr>
                    <td className="py-2 text-right text-gray-600">Subtotal:</td>
                    <td className="py-2 text-right font-medium w-32">
                      {formatCurrency(
                        data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                  </tr>
                  {data.taxRate > 0 && (
                    <tr>
                      <td className="py-2 text-right text-gray-600">
                        Tax ({data.taxRate}%):
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatCurrency(
                          data.totalAmount - data.subTotal,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                    </tr>
                  )}
                  {hasPartialPayments ? (
                    <>
                      <tr
                        className="border-t-2"
                        style={{ borderTopColor: primaryColor }}
                      >
                        <td className="py-2 text-right text-gray-600">
                          Original Total:
                        </td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(
                            data.totalAmount,
                            data.currency,
                            data.locale,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-right text-green-600">
                          Amount Paid:
                        </td>
                        <td className="py-2 text-right font-medium text-green-600">
                          -
                          {formatCurrency(
                            data.amountPaid || 0,
                            data.currency,
                            data.locale,
                          )}
                        </td>
                      </tr>
                      <tr
                        className="border-t-2"
                        style={{ borderTopColor: primaryColor }}
                      >
                        <td className="py-4 text-right font-bold text-xl">
                          BALANCE DUE:
                        </td>
                        <td className="py-4 text-right font-bold text-xl">
                          {formatCurrency(
                            displayTotal,
                            data.currency,
                            data.locale,
                          )}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr
                      className="border-t-2"
                      style={{ borderTopColor: primaryColor }}
                    >
                      <td className="py-4 text-right font-bold text-xl">
                        TOTAL:
                      </td>
                      <td className="py-4 text-right font-bold text-xl">
                        {formatCurrency(
                          data.totalAmount,
                          data.currency,
                          data.locale,
                        )}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={2} className="pt-3">
                      <p className="text-xs text-gray-700 italic text-right">
                        <span className="font-semibold">
                          {convertAmountToWords(displayTotal, data.currency)}
                        </span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-300">
            <p className="text-center text-gray-600 mb-4">
              Thank you for your business!
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <img
                src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
                alt="OmniReceipts Logo"
                className="h-5 w-5"
              />
              <span className="font-poppins text-sm">
                Sent using OmniReceipts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template6;
