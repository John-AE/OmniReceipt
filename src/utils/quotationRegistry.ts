import React from 'react';
import QuotationTemplate1 from '@/components/templates/quotations/QuotationTemplate1';
import QuotationTemplate2 from '@/components/templates/quotations/QuotationTemplate2';
import QuotationTemplate3 from '@/components/templates/quotations/QuotationTemplate3';
import QuotationTemplate4 from '@/components/templates/quotations/QuotationTemplate4';
import QuotationTemplate5 from '@/components/templates/quotations/QuotationTemplate5';
import QuotationTemplate6 from '@/components/templates/quotations/QuotationTemplate6';
import QuotationTemplate7 from '@/components/templates/quotations/QuotationTemplate7';
import QuotationTemplate8 from '@/components/templates/quotations/QuotationTemplate8';
import QuotationTemplate9 from '@/components/templates/quotations/QuotationTemplate9';
import QuotationTemplate10 from '@/components/templates/quotations/QuotationTemplate10';
import QuotationTemplate11 from '@/components/templates/quotations/QuotationTemplate11';
import QuotationTemplate12 from '@/components/templates/quotations/QuotationTemplate12';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationData {
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName: string;
  companyPhone: string;
  companyAddress?: string;
  items: QuotationItem[];
  subTotal: number;
  taxRate: number;
  totalAmount: number;
  primaryColor?: string;
  currency?: string;
  locale?: string;
}

export type QuotationTemplateComponent = React.FC<{ data: QuotationData }>;

const quotationTemplates: Record<number, QuotationTemplateComponent> = {
  1: QuotationTemplate1,
  2: QuotationTemplate2,
  3: QuotationTemplate3,
  4: QuotationTemplate4,
  5: QuotationTemplate5,
  6: QuotationTemplate6,
  7: QuotationTemplate7,
  8: QuotationTemplate8,
  9: QuotationTemplate9,
  10: QuotationTemplate10,
  11: QuotationTemplate11,
  12: QuotationTemplate12,
};

export const getQuotationTemplate = (templateNumber: number): QuotationTemplateComponent => {
  return quotationTemplates[templateNumber] || quotationTemplates[1];
};

export const getAvailableQuotationTemplates = () => {
  return Object.keys(quotationTemplates).map(Number);
};


