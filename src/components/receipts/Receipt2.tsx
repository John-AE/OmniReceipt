import React from 'react';
import { format } from 'date-fns';
import BaseTemplate from '../templates/BaseTemplate';
import { calculateSubTotal, calculateTaxAmount, calculateGrandTotal, formatCurrency } from '@/utils/invoiceCalculations';
import type { InvoiceData } from '@/utils/templateRegistry';

interface ReceiptProps {
  data: InvoiceData;
  isPrint?: boolean;
}

const Receipt2: React.FC<ReceiptProps> = ({ data, isPrint = false }) => {
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
          fontFamily: "'Consolas', monospace",
          whiteSpace: "pre-wrap",
          lineHeight: "1.2",
        }}
      >
        <div className="flex-grow">
          <div className="text-center font-bold mb-1 py-2 px-1" style={{ backgroundColor: primaryColor, color: '#fff' }}>CUSTOMER RECEIPT</div>
          <div className="text-center mb-2" style={{ color: primaryColor }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</div>
          <div className="mb-2 flex justify-between text-[0.9em]">
            <div className="text-gray-600">No: {data.invoiceNumber || "N/A"}</div>
            <div className="text-right">
              {data.invoiceDate
                ? format(new Date(data.invoiceDate), "MM/dd/yyyy")
                : "N/A"}
            </div>
          </div>
          <div className="text-center mb-2" style={{ color: primaryColor }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</div>
          <div className="mb-3 text-center">
            <div className="font-bold text-lg">{data.companyName || "N/A"}</div>
            <div className="text-[0.85em] text-gray-700">{data.companyAddress || "N/A"}</div>
            {data.companyPhone && <div className="text-[0.85em] text-gray-700">{data.companyPhone}</div>}
          </div>
          <div className="mb-3 p-2 bg-gray-50 rounded flex justify-between items-center">
            <span className="text-gray-500 text-xs uppercase tracking-tighter font-bold">Customer</span>
            <span className="font-semibold text-sm">{data.customerName || "N/A"}</span>
          </div>
          <div className="text-center mb-2" style={{ color: primaryColor }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</div>
          <div className="py-2 mb-2">
            {data.serviceDescription && (
              <div className="font-bold mb-2 text-[0.95em]" style={{ color: primaryColor }}>
                {data.serviceDescription}
              </div>
            )}
            <div className="flex justify-between font-bold mb-2 text-xs uppercase text-gray-400">
              <span>Description</span>
              <span>Total</span>
            </div>
            {data.items.map((item, index) => (
              <div key={index} className="flex justify-between mb-2">
                <div className="max-w-[70%]">
                  <div className="font-medium text-black break-words">{item.description || "N/A"}</div>
                  <div className="text-[0.8em] text-gray-500 italic">Qty: {item.quantity || 0} @ {item.unitPrice?.toLocaleString(data.locale) || 0}</div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.totalPrice, data.currency, data.locale)}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mb-2" style={{ color: primaryColor }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</div>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subTotal, data.currency, data.locale)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({data.taxRate}%)</span>
              <span>{formatCurrency(taxAmount, data.currency, data.locale)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-2 text-xl pt-2 border-t-2 border-double" style={{ borderColor: primaryColor }}>
            <span>TOTAL</span>
            <span style={{ color: primaryColor }}>{formatCurrency(total, data.currency, data.locale)}</span>
          </div>
        </div>
        <div className="text-center mt-6 font-medium text-gray-700">Thank you for choosing us!</div>

        {/* Footer */}
        <div className="mt-6 pt-2 flex flex-col items-center justify-center gap-1.5 border-t border-dotted border-gray-200">
          <div className="text-center mb-1" style={{ color: primaryColor }}>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</div>
          <div className="flex items-center gap-1.5">
            <img
              src="/lovable-uploads/bec25280-d488-4d12-99b7-c326f6694bf7.png"
              alt="OmniReceipts Logo"
              style={{ height: isPrint ? "10px" : "16px", width: isPrint ? "10px" : "16px" }}
            />
            <span style={{ fontSize: isPrint ? "8px" : "12px" }} className="font-medium text-gray-600">Secured by OmniReceipts</span>
          </div>
          <span style={{ fontSize: isPrint ? "8px" : "12px" }} className="text-gray-500 font-medium">www.OmniReceipts.com.ng</span>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default Receipt2;

