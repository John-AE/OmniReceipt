export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const calculateSubTotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
};

export const calculateTaxAmount = (subTotal: number, taxRate: number): number => {
  return (subTotal * taxRate) / 100;
};

export const calculateGrandTotal = (subTotal: number, taxAmount: number): number => {
  return subTotal + taxAmount;
};

export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

