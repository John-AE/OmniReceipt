import React from "react";
import BaseTemplate from "./BaseTemplate";
import { InvoiceData } from "@/utils/templateRegistry";
import { formatCurrency } from "@/utils/invoiceCalculations";
import { convertAmountToWords } from "@/utils/numberToWords";

interface Template7Props {
  data: InvoiceData;
}

const Template7: React.FC<Template7Props> = ({ data }) => {
  const taxAmount = (data.subTotal * data.taxRate) / 100;
  const hasPartialPayments = Boolean(data.amountPaid && data.amountPaid > 0);
  const displayTotal = hasPartialPayments
    ? (data.remainingBalance ?? data.totalAmount)
    : data.totalAmount;
  const primaryColor = data.primaryColor || "#0A3161"; // Default American Blue for Template 7

  return (
    <BaseTemplate>
      <div
        className="text-white p-12"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-white inline-block">
              <h1 className="text-2xl font-bold" id="company-name">
                {data.companyName || "Your Company Name"}
              </h1>
            </div>
            <p className="mt-2">
              {data.companyAddress || "Your Company Address"}
            </p>
            <p>{data.companyPhone || "Your Company Phone"}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">BILLED TO</h2>
            <p>{data.customerName}</p>
            <p>{data.customerEmail}</p>
            <p>{data.customerPhone}</p>
          </div>
        </div>
        <div className="flex justify-end mb-8">
          <div className="text-right">
            <p>Invoice #: {data.invoiceNumber}</p>
            <p>Invoice Date: {data.invoiceDate}</p>
            {data.paymentDate && <p>Due Date: {data.paymentDate}</p>}
            <p>
              Due Amount:{" "}
              {formatCurrency(displayTotal, data.currency, data.locale)}
            </p>
          </div>
        </div>
      </div>
      <div
        className="rounded-lg -mt-[42px] w-[92%] mx-auto bg-white border"
        style={{ borderColor: primaryColor }}
      >
        <div id="item-data" className="w-full mb-8">
          <div
            className="flex rounded-t"
            style={{ backgroundColor: `${primaryColor}25` }}
          >
            {/* Consistent column widths: w-12 for index, flex-[4] for description, flex-1 for others */}
            <div className="p-2 w-12 flex-none"></div>
            <div
              className="p-2 flex-[4] basis-0 text-left font-bold"
              style={{ color: primaryColor }}
            >
              ITEM NAME/ITEM DESCRIPTION
            </div>
            <div
              className="p-2 flex-1 basis-0 text-right font-bold"
              style={{ color: primaryColor }}
            >
              QTY.
            </div>
            <div
              className="p-2 flex-1 basis-0 text-right font-bold"
              style={{ color: primaryColor }}
            >
              RATE
            </div>
            <div
              className="p-2 flex-1 basis-0 text-right font-bold"
              style={{ color: primaryColor }}
            >
              AMOUNT
            </div>
          </div>
          {data.items
            .filter((item) => !item.isPayment)
            .map((item, index) => (
              <div
                key={item.id}
                className="flex border-t border-b hover:bg-gray-50 transition-colors"
              >
                {/* Data row columns matching header widths */}
                <div className="p-2 w-12 flex-none text-left">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="p-2 flex-[4] basis-0">
                  <p className="font-semibold">{item.description}</p>
                </div>
                <div className="p-2 flex-1 basis-0 text-right">
                  {item.quantity}
                </div>
                <div className="p-2 flex-1 basis-0 text-right">
                  {formatCurrency(item.unitPrice, data.currency, data.locale)}
                </div>
                <div className="p-2 flex-1 basis-0 text-right font-medium">
                  {formatCurrency(item.totalPrice, data.currency, data.locale)}
                </div>
              </div>
            ))}
          {/* Partial Payments as deductions - also aligned with columns */}
          {data.items
            .filter((item) => item.isPayment)
            .map((item) => (
              <div
                key={item.id}
                className="flex border-t border-b"
                style={{ backgroundColor: `${primaryColor}05` }}
              >
                <div className="p-2 w-12 flex-none"></div>
                <div
                  className="p-2 flex-[4] basis-0 italic font-medium"
                  style={{ color: primaryColor }}
                >
                  <p className="font-semibold">{item.description}</p>
                </div>
                <div className="p-2 flex-1 basis-0"></div>
                <div className="p-2 flex-1 basis-0"></div>
                <div
                  className="p-2 flex-1 basis-0 text-right font-semibold"
                  style={{ color: primaryColor }}
                >
                  (
                  {formatCurrency(
                    Math.abs(item.totalPrice, data.currency, data.locale),
                  )}
                  )
                </div>
              </div>
            ))}
        </div>
        <div className="flex justify-between">
          <div className="w-2/3 p-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <p className="text-sm text-gray-600">
              Thank you for your business!
            </p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between mb-2 p-2">
              <span className="text-gray-600">Sub Total:</span>
              <span>
                {formatCurrency(data.subTotal, data.currency, data.locale)}
              </span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between mb-2 p-2">
                <span className="text-gray-600">Tax ({data.taxRate}%):</span>
                <span>
                  {formatCurrency(taxAmount, data.currency, data.locale)}
                </span>
              </div>
            )}
            {hasPartialPayments && (
              <>
                <div className="flex justify-between mb-2 p-2 border-t">
                  <span className="text-gray-600">Original Total:</span>
                  <span>
                    {formatCurrency(
                      data.totalAmount,
                      data.currency,
                      data.locale,
                    )}
                  </span>
                </div>
                <div
                  className="flex justify-between mb-2 p-2 font-medium"
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
                  className="flex justify-between font-bold text-white p-2 mt-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-left font-bold">Balance Due</span>
                  <span>
                    {formatCurrency(displayTotal, data.currency, data.locale)}
                  </span>
                </div>
              </>
            )}
            {!hasPartialPayments && (
              <div
                className="flex justify-between font-bold text-white p-2 mt-4"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-left font-bold">Total</span>
                <span>
                  {formatCurrency(data.totalAmount, data.currency, data.locale)}
                </span>
              </div>
            )}
            <div className="mt-3 p-2">
              <p className="text-xs text-gray-700 italic text-right">
                <span className="font-semibold">
                  {convertAmountToWords(displayTotal, data.currency)}
                </span>
              </p>
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
    </BaseTemplate>
  );
};

export default Template7;
