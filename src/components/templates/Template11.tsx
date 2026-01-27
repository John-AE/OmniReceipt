import React from "react";
import BaseTemplate from "./BaseTemplate";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template11Props {
  data: InvoiceData;
}

const Template11: React.FC<Template11Props> = ({ data }) => {
  const taxAmount = (data.subTotal * data.taxRate) / 100;
  const hasPartialPayments = data.amountPaid && data.amountPaid > 0;
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#B31942"; // Default American Red for Template 11

  return (
    <BaseTemplate>
      <div className="bg-white p-8 w-[794px] mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              Invoice
            </h1>
            <p>
              <span className="font-semibold text-gray-700">Invoice#:</span>{" "}
              {data.invoiceNumber}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Invoice Date:</span>{" "}
              {data.invoiceDate}
            </p>
            {data.paymentDate && (
              <p>
                <span className="font-semibold text-gray-700">Due Date:</span>{" "}
                {data.paymentDate}
              </p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{data.companyName}</h2>
            <p className="text-gray-600">{data.companyAddress}</p>
            <p className="text-gray-600">{data.companyPhone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div
            className="bg-gray-100 p-4 rounded border-t-2"
            style={{ borderTopColor: primaryColor }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              Billed by
            </h3>
            <p>
              <strong>{data.companyName}</strong>
            </p>
            <p className="text-gray-600">{data.companyAddress}</p>
            <p className="text-gray-600">{data.companyPhone}</p>
          </div>
          <div
            className="bg-gray-100 p-4 rounded border-t-2"
            style={{ borderTopColor: primaryColor }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              Billed to
            </h3>
            <p>
              <strong>{data.customerName}</strong>
            </p>
            {data.customerEmail && (
              <p className="text-gray-600">{data.customerEmail}</p>
            )}
            <p className="text-gray-600">{data.customerPhone}</p>
          </div>
        </div>

        <table className="w-full mb-8 border border-gray-300">
          <thead
            className="text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <tr>
              <th className="p-2 text-left border border-gray-300">
                Item #/Item Description
              </th>
              <th className="p-2 text-right border border-gray-300">Qty.</th>
              <th className="p-2 text-right border border-gray-300">Rate</th>
              <th className="p-2 text-right border border-gray-300">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items
              .filter((item) => !item.isPayment)
              .map((item, index) => (
                <tr
                  key={item.id}
                  className="bg-gray-50 hover:bg-white transition-colors"
                >
                  <td className="p-2 border border-gray-300">
                    {`${index + 1}. ${item.description}`}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {item.quantity}
                  </td>
                  <td className="p-2 text-right border border-gray-300">
                    {formatCurrency(item.unitPrice, data.currency, data.locale)}
                  </td>
                  <td className="p-2 text-right border border-gray-300 font-medium">
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
                  className="italic"
                  style={{ backgroundColor: `${primaryColor}10` }}
                >
                  <td
                    className="p-2 border border-gray-300 font-medium"
                    colSpan={3}
                    style={{ color: primaryColor }}
                  >
                    {item.description}
                  </td>
                  <td
                    className="p-2 text-right border border-gray-300 font-semibold"
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

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <p className="flex justify-between text-gray-600">
              <span>Sub Total:</span>{" "}
              <span>
                {formatCurrency(data.subTotal, data.currency, data.locale)}
              </span>
            </p>
            {data.taxRate > 0 && (
              <p className="flex justify-between text-gray-600">
                <span>Tax({data.taxRate}%):</span>{" "}
                <span>
                  {formatCurrency(taxAmount, data.currency, data.locale)}
                </span>
              </p>
            )}
            {hasPartialPayments ? (
              <>
                <div className="flex justify-between mt-2 border-t pt-1 text-sm text-gray-500">
                  <span>Original Total:</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
                <div
                  className="flex justify-between font-medium text-sm"
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
                <hr className="my-2" />
                <p
                  className="flex justify-between font-bold text-lg mt-2"
                  style={{ color: primaryColor }}
                >
                  <span>Balance Due:</span>{" "}
                  <span>
                    {formatCurrency(displayTotal, data.currency, data.locale)}
                  </span>
                </p>
              </>
            ) : (
              <>
                <hr className="my-2" />
                <p
                  className="flex justify-between font-bold text-lg mt-2"
                  style={{ color: primaryColor }}
                >
                  <span>Total:</span>{" "}
                  <span>
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </p>
              </>
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

        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: primaryColor }}
          >
            Note
          </h3>
          <p className="text-gray-600">
            Thank you for your business! Payment is due within 30 days.
          </p>
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
    </BaseTemplate>
  );
};

export default Template11;
