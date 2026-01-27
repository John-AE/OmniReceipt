// Copy of the convertAmountToWords function for testing
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanThousand(num) {
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

function convertAmountToWords(amount, currency = 'NGN') {
  const currencyNames = {
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
  
  const roundedAmount = Math.floor(amount);
  
  if (roundedAmount < 0) return 'Invalid Amount';
  
  let result = '';
  
  if (roundedAmount >= 1000000000) {
    const billions = Math.floor(roundedAmount / 1000000000);
    result += convertLessThanThousand(billions) + ' Billion ';
  }
  
  const millions = Math.floor((roundedAmount % 1000000000) / 1000000);
  if (millions > 0) {
    result += convertLessThanThousand(millions) + ' Million ';
  }
  
  const thousands = Math.floor((roundedAmount % 1000000) / 1000);
  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + ' Thousand ';
  }
  
  const hundreds = roundedAmount % 1000;
  if (hundreds > 0) {
    result += convertLessThanThousand(hundreds);
  }
  
  result = result.trim();
  return result + ` ${currencyName} Only`;
}

console.log('Testing number to words conversion:');
console.log('==================================');

console.log('12345 NGN:', convertAmountToWords(12345, 'NGN'));
console.log('67890 NGN:', convertAmountToWords(67890, 'NGN'));
console.log('1000000 NGN:', convertAmountToWords(1000000, 'NGN'));
console.log();

console.log('12345 USD:', convertAmountToWords(12345, 'USD'));
console.log('67890 USD:', convertAmountToWords(67890, 'USD'));
console.log('1000000 USD:', convertAmountToWords(1000000, 'USD'));
console.log();

console.log('12345 EUR:', convertAmountToWords(12345, 'EUR'));
console.log('67890 EUR:', convertAmountToWords(67890, 'EUR'));
console.log('1000000 EUR:', convertAmountToWords(1000000, 'EUR'));
console.log();

console.log('12345 GBP:', convertAmountToWords(12345, 'GBP'));
console.log('67890 GBP:', convertAmountToWords(67890, 'GBP'));
console.log('1000000 GBP:', convertAmountToWords(1000000, 'GBP'));