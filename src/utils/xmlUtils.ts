import { formatCurrency } from './invoiceCalculations';

export interface UBLInvoiceData {
  id: string;
  invoice_number: string;
  invoice_date: string;
  payment_date?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  amount: number;
  sub_total?: number;
  tax_rate?: number;
  service_description: string;
  user_id: string;
}

export interface UBLReceiptData {
  id: string;
  receipt_number: string;
  payment_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  amount: number;
  sub_total?: number;
  tax_rate?: number;
  service_description: string;
  user_id: string;
}

export interface UBLLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const generateUBLInvoiceXML = (
  invoice: UBLInvoiceData, 
  invoiceItems: UBLLineItem[] = [],
  profile?: any
): string => {
  const taxAmount = ((invoice.sub_total || invoice.amount) * (invoice.tax_rate || 0)) / 100;
  const subtotal = invoice.sub_total || invoice.amount - taxAmount;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.4</cbc:UBLVersionID>
  <cbc:ID>${escapeXml(invoice.invoice_number)}</cbc:ID>
  <cbc:IssueDate>${formatDate(invoice.invoice_date)}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>NGN</cbc:DocumentCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(profile?.business_name || profile?.artisan_name || 'Business')}</cbc:Name>
      </cac:PartyName>
      <cac:Contact>
        <cbc:Telephone>${escapeXml(profile?.phone || '')}</cbc:Telephone>
        <cbc:ElectronicMail>${escapeXml(profile?.email || '')}</cbc:ElectronicMail>
      </cac:Contact>
      ${profile?.business_address ? `
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(profile.business_address)}</cbc:StreetName>
        <cbc:CityName>City</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>NG</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ` : ''}
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(invoice.customer_name)}</cbc:Name>
      </cac:PartyName>
      <cac:Contact>
        <cbc:Telephone>${escapeXml(invoice.customer_phone)}</cbc:Telephone>
        ${invoice.customer_email ? `<cbc:ElectronicMail>${escapeXml(invoice.customer_email)}</cbc:ElectronicMail>` : ''}
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  ${invoice.payment_date ? `
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>1</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${formatDate(invoice.payment_date)}</cbc:PaymentDueDate>
  </cac:PaymentMeans>
  ` : ''}
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="NGN">${taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="NGN">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>VAT</cbc:ID>
        <cbc:Percent>${(invoice.tax_rate || 0).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="NGN">${invoice.amount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="NGN">${invoice.amount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  ${invoiceItems.length > 0 ? invoiceItems.map((item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="NGN">${item.total_price.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(item.description)}</cbc:Description>
      <cbc:Name>${escapeXml(item.description)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="NGN">${item.unit_price.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
  `).join('') : `
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(invoice.service_description)}</cbc:Description>
      <cbc:Name>${escapeXml(invoice.service_description)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
  `}
</Invoice>`;
};

export const generateUBLReceiptXML = (
  receipt: UBLReceiptData, 
  receiptItems: UBLLineItem[] = [],
  profile?: any
): string => {
  const taxAmount = ((receipt.sub_total || receipt.amount) * (receipt.tax_rate || 0)) / 100;
  const subtotal = receipt.sub_total || receipt.amount - taxAmount;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Receipt xmlns="urn:oasis:names:specification:ubl:schema:xsd:Receipt-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.4</cbc:UBLVersionID>
  <cbc:ID>${escapeXml(receipt.receipt_number)}</cbc:ID>
  <cbc:IssueDate>${formatDate(receipt.payment_date)}</cbc:IssueDate>
  <cbc:DocumentCurrencyCode>NGN</cbc:DocumentCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(profile?.business_name || profile?.artisan_name || 'Business')}</cbc:Name>
      </cac:PartyName>
      <cac:Contact>
        <cbc:Telephone>${escapeXml(profile?.phone || '')}</cbc:Telephone>
        <cbc:ElectronicMail>${escapeXml(profile?.email || '')}</cbc:ElectronicMail>
      </cac:Contact>
      ${profile?.business_address ? `
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(profile.business_address)}</cbc:StreetName>
        <cbc:CityName>City</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>NG</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ` : ''}
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(receipt.customer_name)}</cbc:Name>
      </cac:PartyName>
      <cac:Contact>
        <cbc:Telephone>${escapeXml(receipt.customer_phone)}</cbc:Telephone>
        ${receipt.customer_email ? `<cbc:ElectronicMail>${escapeXml(receipt.customer_email)}</cbc:ElectronicMail>` : ''}
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="NGN">${taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="NGN">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>VAT</cbc:ID>
        <cbc:Percent>${(receipt.tax_rate || 0).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="NGN">${receipt.amount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="NGN">${receipt.amount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  ${receiptItems.length > 0 ? receiptItems.map((item, index) => `
  <cac:ReceiptLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:ReceivedQuantity unitCode="EA">${item.quantity}</cbc:ReceivedQuantity>
    <cbc:LineExtensionAmount currencyID="NGN">${item.total_price.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(item.description)}</cbc:Description>
      <cbc:Name>${escapeXml(item.description)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="NGN">${item.unit_price.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:ReceiptLine>
  `).join('') : `
  <cac:ReceiptLine>
    <cbc:ID>1</cbc:ID>
    <cbc:ReceivedQuantity unitCode="EA">1</cbc:ReceivedQuantity>
    <cbc:LineExtensionAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(receipt.service_description)}</cbc:Description>
      <cbc:Name>${escapeXml(receipt.service_description)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="NGN">${subtotal.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:ReceiptLine>
  `}
</Receipt>`;
};

