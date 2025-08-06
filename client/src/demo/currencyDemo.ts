import { formatCurrency, getCurrencySymbol } from '../lib/currencyFormatter';

console.log('💱 Currency Formatting Demo');
console.log('===========================\n');

// Test different currencies
const testAmounts = [100, 150.50, 1000, 2500.75];
const testCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'HKD', 'NZD'];

console.log('📊 Currency Formatting Examples:');
console.log('================================');

testCurrencies.forEach(currency => {
  console.log(`\n${currency} (${getCurrencySymbol(currency)}):`);
  testAmounts.forEach(amount => {
    console.log(`  ${amount} → ${formatCurrency(amount, currency)}`);
  });
});

console.log('\n🎯 Key Features:');
console.log('- ✅ Dynamic currency symbols based on currency code');
console.log('- ✅ Proper formatting with decimal places');
console.log('- ✅ Support for 50+ currencies');
console.log('- ✅ Fallback to currency code if symbol not found');
console.log('- ✅ Consistent formatting across the application');

console.log('\n🌍 Common Currencies:');
console.log('- USD: $100.00');
console.log('- EUR: €100.00');
console.log('- GBP: £100.00');
console.log('- JPY: ¥100.00');
console.log('- CAD: C$100.00');
console.log('- AUD: A$100.00');
console.log('- CHF: CHF100.00');
console.log('- CNY: ¥100.00');
console.log('- INR: ₹100.00');
console.log('- BRL: R$100.00');

console.log('\n✅ Currency formatting is now dynamic and locale-aware!'); 