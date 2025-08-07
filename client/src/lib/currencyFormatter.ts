/**
 * Currency formatting utility
 * Formats amounts based on currency code with appropriate symbols and formatting
 */

export const formatCurrency = (amount: number, currency: string): string => {
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': 'MX$',
    'KRW': '₩',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'TRY': '₺',
    'ZAR': 'R',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
    'NGN': '₦',
    'EGP': 'E£',
    'KES': 'KSh',
    'GHS': 'GH₵',
    'UGX': 'USh',
    'TZS': 'TSh',
    'ZMW': 'ZK',
    'BWP': 'P',
    'NAD': 'N$',
    'MUR': 'Rs',
    'LKR': 'Rs',
    'BDT': '৳',
    'PKR': '₨',
    'NPR': '₨',
    'MMK': 'K',
    'KHR': '៛',
    'LAK': '₭',
    'MNT': '₮',
    'KZT': '₸',
    'UZS': 'so\'m',
    'TJS': 'ЅM',
    'KGS': 'с',
    'TMT': 'T',
    'AZN': '₼',
    'GEL': '₾',
    'AMD': '֏',
    'BYN': 'Br',
    'MDL': 'L',
    'UAH': '₴',
    'BGN': 'лв',
    'RON': 'lei',
    'HRK': 'kn',
    'RSD': 'дин',
    'MKD': 'ден',
    'ALL': 'L',
    'BAM': 'KM',
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  
  // Format the amount with appropriate decimal places
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedAmount}`;
};

/**
 * Format currency amount without the currency symbol
 */
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format currency for display in tooltips and other contexts
 */
export const formatCurrencyForDisplay = (amount: number, currency: string): string => {
  return formatCurrency(amount, currency);
};

/**
 * Get currency symbol only
 */
export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': 'MX$',
    'KRW': '₩',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'TRY': '₺',
    'ZAR': 'R',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
    'NGN': '₦',
    'EGP': 'E£',
    'KES': 'KSh',
    'GHS': 'GH₵',
    'UGX': 'USh',
    'TZS': 'TSh',
    'ZMW': 'ZK',
    'BWP': 'P',
    'NAD': 'N$',
    'MUR': 'Rs',
    'LKR': 'Rs',
    'BDT': '৳',
    'PKR': '₨',
    'NPR': '₨',
    'MMK': 'K',
    'KHR': '៛',
    'LAK': '₭',
    'MNT': '₮',
    'KZT': '₸',
    'UZS': 'so\'m',
    'TJS': 'ЅM',
    'KGS': 'с',
    'TMT': 'T',
    'AZN': '₼',
    'GEL': '₾',
    'AMD': '֏',
    'BYN': 'Br',
    'MDL': 'L',
    'UAH': '₴',
    'BGN': 'лв',
    'RON': 'lei',
    'HRK': 'kn',
    'RSD': 'дин',
    'MKD': 'ден',
    'ALL': 'L',
    'BAM': 'KM',
  };

  return currencySymbols[currency.toUpperCase()] || currency;
}; 