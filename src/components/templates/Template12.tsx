import React from "react";
import BaseTemplate from "./BaseTemplate";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template12Props {
  data: InvoiceData;
}

const Template12: React.FC<Template12Props> = ({ data }) => {
  const taxAmount = (data.subTotal * data.taxRate) / 100;
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Template 12

  return (
    <BaseTemplate>
      <div className="bg-white p-8 w-[794px] mx-auto">
        {/* Header with gradient background */}
        <div
          className="text-white p-6 rounded-t-lg mb-6"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}DD)`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <div className="text-white/90">
                <p>#{data.invoiceNumber}</p>
                <p>Date: {data.invoiceDate}</p>
                {data.paymentDate && <p>Due: {data.paymentDate}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold mb-2">{data.companyName}</h2>
              <div className="text-white/90 text-sm">
                <p>{data.companyAddress}</p>
                <p>{data.companyPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: primaryColor }}
          >
            Bill To:
          </h3>
          <div className="text-gray-700">
            <p className="font-semibold text-lg">{data.customerName}</p>
            {data.customerEmail && <p>{data.customerEmail}</p>}
            <p>{data.customerPhone}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr
                className="text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items
                .filter((item) => !item.isPayment)
                .map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="p-3 font-medium text-gray-600">
                      {index + 1}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">
                        {item.description}
                      </div>
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right text-gray-600">
                      {formatCurrency(
                        item.unitPrice,
                        data.currency,
                        data.locale,
                      )}
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
              {/* Partial Payments as deductions */}
              {data.items
                .filter((item) => item.isPayment)
                .map((item, index) => (
                  <tr
                    key={`payment-${index}`}
                    className="border-t border-gray-100 italic"
                    style={{ backgroundColor: `${primaryColor}05` }}
                  >
                    <td
                      className="p-3 font-medium"
                      style={{ color: primaryColor }}
                      colSpan={4}
                    >
                      {item.description}
                    </td>
                    <td
                      className="p-3 text-right font-semibold"
                      style={{ color: primaryColor }}
                    >
                      (
                      {formatCurrency(
                        Math.abs(item.totalPrice, data.currency, data.locale),
                      )}
                      )
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(data.subTotal, data.currency, data.locale)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                  <span className="text-gray-600">Tax ({data.taxRate}%):</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(taxAmount, data.currency, data.locale)}
                  </span>
                </div>
              )}
              {hasPartialPayments ? (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                    <span className="text-gray-600">Original Total:</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(
                        data.totalAmount,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div
                    className="flex justify-between py-2 border-b border-gray-200 text-sm font-medium"
                    style={{ color: primaryColor }}
                  >
                    <span>Amount Paid:</span>
                    <span>
                      -
                      {formatCurrency(
                        data.amountPaid!,
                        data.currency,
                        data.locale,
                      )}
                    </span>
                  </div>
                  <div
                    className="flex justify-between pt-3 mt-2 border-t-2"
                    style={{ borderTopColor: primaryColor }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: primaryColor }}
                    >
                      Balance Due:
                    </span>
                    <span
                      className="text-lg font-bold"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(displayTotal, data.currency, data.locale)}
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="flex justify-between pt-3 mt-2 border-t-2"
                  style={{ borderTopColor: primaryColor }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    Total Amount:
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-300 text-right">
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
        <div className="border-t border-gray-200 pt-6">
          <div
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>
              Payment Terms & Notes:
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Payment is due within 30 days of invoice date. Late payments may
              incur additional charges.
            </p>
            <p className="text-sm text-gray-600">
              Thank you for choosing {data.companyName}. We appreciate your
              business!
            </p>
          </div>
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
    </BaseTemplate>
  );
};

export default Template12;
