import React from 'react';
import { format } from 'date-fns';
import BaseTemplate from '../templates/BaseTemplate';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal, formatCurrency } from '@/utils/invoiceCalculations';
import type { InvoiceData } from '@/utils/templateRegistry';

interface ReceiptProps {
  data: InvoiceData;
  isPrint?: boolean;
}

const Receipt1: React.FC<ReceiptProps> = ({ data, isPrint = false }) => {
  const subTotal = calculateSubTotal(data.items);
  const taxAmount = calculateTaxAmount(subTotal, data.taxRate);
  const total = calculateGrandTotal(subTotal, taxAmount);
  const primaryColor = data.primaryColor || '#000000';

  return (
    <BaseTemplate
      width="80mm"
      height="auto"
      className="p-2"
      isPrint={isPrint}
    >
      <div
        className="bg-white flex flex-col min-h-full text-black"
        style={{
          fontSize: isPrint ? "8px" : "14px",
          fontFamily: "'Courier New', Courier, monospace",
          whiteSpace: "pre-wrap",
          lineHeight: "1.2",
        }}
      >
        <div className="flex-grow">
          <div className="text-center font-bold mb-2" style={{ color: primaryColor }}>RECEIPT</div>
          <div className="mb-2 text-center text-gray-700">
            <div className="font-bold text-black">{data.companyName || "N/A"}</div>
            <div className="text-[0.9em]">{data.companyAddress || "N/A"}</div>
            {data.companyPhone && <div className="text-[0.9em]">{data.companyPhone}</div>}
          </div>
          <div className="flex justify-between text-[0.95em] mb-1">
            <span className="text-gray-600">No:</span>
            <span>{data.invoiceNumber || "N/A"}</span>
          </div>
          <div className="flex justify-between text-[0.95em] mb-3">
            <span className="text-gray-600">Date:</span>
            <span>
              {data.invoiceDate
                ? `${format(new Date(data.invoiceDate), "MM/dd/yyyy")} ${format(new Date(), "HH:mm")}`
                : "N/A"}
            </span>
          </div>
          <div className="mb-3 flex justify-between gap-2 border-b pb-2">
            <span className="text-gray-600">Customer:</span>
            <span className="font-semibold text-right">{data.customerName || "N/A"}</span>
          </div>
          <div className="border-t-2 py-2 mb-2" style={{ borderColor: primaryColor }}>
            {data.serviceDescription && (
              <div className="font-bold mb-2 text-[0.95em]" style={{ color: primaryColor }}>
                {data.serviceDescription}
              </div>
            )}
            <div className="flex justify-between font-bold mb-2 text-[0.9em] uppercase tracking-wider">
              <span>Item Description</span>
              <span>Total</span>
            </div>
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div className="max-w-[70%] text-gray-700">
                  <div className="font-medium text-black">{item.description || "N/A"}</div>
                  <div className="text-[0.85em] italic">Qty: {item.quantity || 0} @ {item.unitPrice?.toLocaleString(data.locale) || 0}</div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.totalPrice, data.currency, data.locale)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-600 pt-2 border-t border-dashed">
            <span>Subtotal</span>
            <span>{formatCurrency(subTotal, data.currency, data.locale)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({data.taxRate}%)</span>
              <span>{formatCurrency(taxAmount, data.currency, data.locale)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-2 text-lg pt-2 border-t-2" style={{ borderColor: primaryColor }}>
            <span>TOTAL</span>
            <span style={{ color: primaryColor }}>{formatCurrency(total, data.currency, data.locale)}</span>
          </div>
        </div>
        <div className="text-center mt-6 italic text-gray-600 text-[0.9em]">Thank you for your business!</div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t flex flex-col items-center justify-center gap-1.5 border-gray-100">
          <div className="flex items-center gap-1.5">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              className="h-4 w-4"
              style={{ height: isPrint ? "10px" : "16px", width: isPrint ? "10px" : "16px" }}
            />
            <span style={{ fontSize: isPrint ? "8px" : "12px" }} className="font-medium text-gray-600">Verified by OmniReceipts</span>
          </div>
          <span style={{ fontSize: isPrint ? "8px" : "12px" }} className="text-gray-500 font-medium">www.OmniReceipts.com.ng</span>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default Receipt1;

