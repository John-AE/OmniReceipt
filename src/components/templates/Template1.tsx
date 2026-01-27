import React from "react";
import { InvoiceData } from "@/utils/templateRegistry";
import { convertAmountToWords } from "@/utils/numberToWords";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { getCurrencySymbol } from "@/utils/currencyConfig";

interface Template1Props {
  data: InvoiceData;
}

const Template1: React.FC<Template1Props> = ({ data }) => {
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#2563eb";

  return (
    <div className="w-[794px] mx-auto p-8 bg-white text-black">
      <div
        className="border-2 rounded-lg overflow-hidden"
        style={{ borderColor: primaryColor }}
      >
        {/* Header */}
        <div
          className="text-white p-6"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">INVOICE</h1>
              <p className="text-lg mt-2">#{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">{data.companyName}</h2>
              <p>{data.companyPhone}</p>
              {data.companyAddress && <p>{data.companyAddress}</p>}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-3">Bill To:</h3>
              <p className="font-semibold">{data.customerName}</p>
              <p>{data.customerPhone}</p>
              {data.customerEmail && <p>{data.customerEmail}</p>}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold">Invoice Date: </span>
                <span>{new Date(data.invoiceDate).toLocaleDateString()}</span>
              </div>
              {data.paymentDate && (
                <div>
                  <span className="font-semibold">Payment Date: </span>
                  <span>{new Date(data.paymentDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border-b">Description</th>
                <th className="text-center p-3 border-b">Qty</th>
                <th className="text-right p-3 border-b">Unit Price</th>
                <th className="text-right p-3 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items
                .filter((item) => !item.isPayment)
                .map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
                    </td>
                    <td className="p-3 text-right">
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
                  <tr key={`payment-${index}`} className="border-b bg-green-50">
                    <td className="p-3 text-green-700 italic" colSpan={3}>
                      {item.description}
                    </td>
                    <td className="p-3 text-right text-green-700 font-semibold">
                      ({Math.abs(item.totalPrice).toLocaleString()})
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between mb-2">
                  <span>Tax ({data.taxRate}%):</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount - data.subTotal,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              {hasPartialPayments && (
                <>
                  <div className="flex justify-between mb-2 border-t pt-2">
                    <span>Original Total:</span>
                    <span>
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2 text-green-600">
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
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Balance Due:</span>
                    <span>
                      {formatCurrency(displayTotal, data.currency, data.locale)}
                    </span>
                  </div>
                </>
              )}
              {!hasPartialPayments && (
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
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
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-sm text-gray-700 italic">
                  Amount in words:{" "}
                  <span className="font-semibold">
                    {convertAmountToWords(displayTotal, data.currency)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

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

export default Template1;
