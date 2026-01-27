import React from 'react';
import Receipt1 from '@/components/receipts/Receipt1';
import Receipt2 from '@/components/receipts/Receipt2';
import type { InvoiceData } from './templateRegistry';

export type ReceiptComponent = React.FC<{ data: InvoiceData; isPrint?: boolean }>;

const receipts: Record<number, ReceiptComponent> = {
  1: Receipt1,
  2: Receipt2,
};

export const getReceipt = (receiptNumber: number): ReceiptComponent => {
  return receipts[receiptNumber] || receipts[1];
};

export const getAvailableReceipts = () => {
  return Object.keys(receipts).map(Number);
};

