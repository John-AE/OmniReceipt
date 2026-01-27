/**
 * Converts a number to words in currency format
 * Example: 4567000 => "Four Million Five Hundred and Sixty-Seven Thousand Naira Only"
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred';
    num %= 100;
    if (num > 0) result += ' and ';
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += '-' + ones[num];
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }
  
  return result;
}

export function convertAmountToWords(amount: number, currency: string = 'NGN'): string {
  // Get currency name based on code
  const currencyNames: Record<string, string> = {
    'NGN': 'Naira',
    'USD': 'Dollars',
    'EUR': 'Euros',
    'GBP': 'Pounds',
    'GHS': 'Cedis',
    'ZAR': 'Rands',
    'KES': 'Shillings'
  };
  
  const currencyName = currencyNames[currency] || 'Currency';
  
  if (amount === 0) return `Zero ${currencyName} Only`;
  
  // Round to avoid decimal issues
  const roundedAmount = Math.floor(amount);
  
  if (roundedAmount < 0) return 'Invalid Amount';
  
  let result = '';
  
  // Billions
  if (roundedAmount >= 1000000000) {
    const billions = Math.floor(roundedAmount / 1000000000);
    result += convertLessThanThousand(billions) + ' Billion ';
  }
  
  // Millions
  const millions = Math.floor((roundedAmount % 1000000000) / 1000000);
  if (millions > 0) {
    result += convertLessThanThousand(millions) + ' Million ';
  }
  
  // Thousands
  const thousands = Math.floor((roundedAmount % 1000000) / 1000);
  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + ' Thousand ';
  }
  
  // Hundreds
  const hundreds = roundedAmount % 1000;
  if (hundreds > 0) {
    result += convertLessThanThousand(hundreds);
  }
  
  // Clean up extra spaces and add currency name
  result = result.trim();
  return result + ` ${currencyName} Only`;
}


