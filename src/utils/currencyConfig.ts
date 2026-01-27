export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  dialingCode: string;
}

export const supportedCurrencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', dialingCode: '1' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', dialingCode: '49' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', dialingCode: '44' },
  { code: 'NGN', symbol: '₦', name: 'Naira', locale: 'en-NG', dialingCode: '234' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', locale: 'en-GH', dialingCode: '233' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', dialingCode: '254' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', dialingCode: '27' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', dialingCode: '61' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', dialingCode: '1' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', dialingCode: '81' },
];

export const getCurrencyByCode = (code: string): Currency => {
  return supportedCurrencies.find(currency => currency.code === code) || supportedCurrencies[0];
};

export const getCurrencySymbol = (code: string): string => {
  return getCurrencyByCode(code).symbol;
};

export const getCurrencyLocale = (code: string): string => {
  return getCurrencyByCode(code).locale;
};
