import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template4Props {
  data: InvoiceData;
}

const Template4: React.FC<Template4Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Template 4

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="text-white p-8 rounded-t-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">INVOICE</h1>
            <p className="text-xl mt-2 opacity-90">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-sm opacity-90">Invoice Date</p>
              <p className="text-lg font-semibold">
                {new Date(data.invoiceDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-gray-200 p-8 rounded-b-lg">
        {/* Company and Customer Details */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <h3
                className="font-bold text-sm uppercase tracking-wide mb-3"
                style={{ color: primaryColor }}
              >
                From
              </h3>
              <h4 className="font-bold text-lg text-gray-800">
                {data.companyName}
              </h4>
              <p className="text-gray-600">{data.companyPhone}</p>
              {data.companyAddress && (
                <p className="text-gray-600">{data.companyAddress}</p>
              )}
            </div>
          </div>
          <div>
            <div
              className="p-6 rounded-lg"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <h3
                className="font-bold text-sm uppercase tracking-wide mb-3"
                style={{ color: primaryColor }}
              >
                Bill To
              </h3>
              <h4 className="font-bold text-lg text-gray-800">
                {data.customerName}
              </h4>
              <p className="text-gray-600">{data.customerPhone}</p>
              {data.customerEmail && (
                <p className="text-gray-600">{data.customerEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Items & Services
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead style={{ backgroundColor: `${primaryColor}25` }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.items
                  .filter((item) => !item.isPayment)
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
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
                      style={{ backgroundColor: `${primaryColor}10` }}
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

        {/* Payment Summary */}
        <div className="flex justify-end">
          <div className="w-80">
            <div
              className="p-6 rounded-lg border border-gray-200"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(data.subTotal, data.currency, data.locale)}
                  </span>
                </div>
                {data.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({data.taxRate}%):
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        data.totalAmount - data.subTotal,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                )}
                <hr className="border-gray-300" />
                {hasPartialPayments ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Total:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          data.totalAmount,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                    <div
                      className="flex justify-between"
                      style={{ color: primaryColor }}
                    >
                      <span>Amount Paid:</span>
                      <span className="font-medium">
                        -
                        {formatCurrency(
                          data.amountPaid || 0,
                          data.currency,
                          data.locale,
                        )}
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-xl font-bold border-t pt-3"
                      style={{ color: primaryColor }}
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
                    className="flex justify-between text-xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    <span>Total Amount:</span>
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
        </div>

        {data.paymentDate && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800">
              <span className="font-semibold">Payment Due:</span>{" "}
              {new Date(data.paymentDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-600">
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

export default Template4;
