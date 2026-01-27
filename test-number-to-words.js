import { convertAmountToWords } from './src/utils/numberToWords.js';

console.log('Testing number to words conversion:');
console.log('==================================');

// Test NGN (Nigerian Naira)
console.log('12345 NGN:', convertAmountToWords(12345, 'NGN'));
console.log('67890 NGN:', convertAmountToWords(67890, 'NGN'));
console.log('1000000 NGN:', convertAmountToWords(1000000, 'NGN'));
console.log();

// Test USD (US Dollars)
console.log('12345 USD:', convertAmountToWords(12345, 'USD'));
console.log('67890 USD:', convertAmountToWords(67890, 'USD'));
console.log('1000000 USD:', convertAmountToWords(1000000, 'USD'));
console.log();

// Test EUR (Euros)
console.log('12345 EUR:', convertAmountToWords(12345, 'EUR'));
console.log('67890 EUR:', convertAmountToWords(67890, 'EUR'));
console.log('1000000 EUR:', convertAmountToWords(1000000, 'EUR'));
console.log();

// Test GBP (British Pounds)
console.log('12345 GBP:', convertAmountToWords(12345, 'GBP'));
console.log('67890 GBP:', convertAmountToWords(67890, 'GBP'));
console.log('1000000 GBP:', convertAmountToWords(1000000, 'GBP'));