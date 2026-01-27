import React from 'react';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';
import Template3 from '@/components/templates/Template3';
import Template4 from '@/components/templates/Template4';
import Template5 from '@/components/templates/Template5';
import Template6 from '@/components/templates/Template6';
import Template7 from '@/components/templates/Template7';
import Template8 from '@/components/templates/Template8';
import Template9 from '@/components/templates/Template9';
import Template10 from '@/components/templates/Template10';
import Template11 from '@/components/templates/Template11';
import Template12 from '@/components/templates/Template12';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isPayment?: boolean; // Flag to identify payment items (deductions)
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  companyName: string;
  companyPhone: string;
  companyAddress?: string;
  serviceDescription?: string;
  items: InvoiceItem[];
  subTotal: number;
  taxRate: number;
  totalAmount: number;
  amountPaid?: number;
  remainingBalance?: number;
  primaryColor?: string;
  currency?: string;
  locale?: string;
}

export type TemplateComponent = React.FC<{ data: InvoiceData }>;

const templates: Record<number, TemplateComponent> = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
  6: Template6,
  7: Template7,
  8: Template8,
  9: Template9,
  10: Template10,
  11: Template11,
  12: Template12,
};

export const getTemplate = (templateNumber: number): TemplateComponent => {
  return templates[templateNumber] || templates[1];
};

export const getAvailableTemplates = () => {
  return Object.keys(templates).map(Number);
};

