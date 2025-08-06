import React from 'react';
import { 
  DollarSign, 
  Euro, 
  PoundSterling, 
  IndianRupee, 
  Coins,
  CreditCard,
  Wallet
} from 'lucide-react';

/**
 * Get appropriate icon for currency
 */
export const getCurrencyIcon = (currency: string) => {
  const currencyMap: Record<string, React.ComponentType<any>> = {
    'USD': DollarSign,
    'EUR': Euro,
    'GBP': PoundSterling,
    'JPY': Coins,
    'INR': IndianRupee,
    'CNY': Coins, // Chinese Yuan
    'KRW': Coins, // Korean Won
    'THB': Coins, // Thai Baht
    'SGD': DollarSign, // Singapore Dollar
    'HKD': DollarSign, // Hong Kong Dollar
    'CAD': DollarSign, // Canadian Dollar
    'AUD': DollarSign, // Australian Dollar
    'NZD': DollarSign, // New Zealand Dollar
    'CHF': Coins, // Swiss Franc
    'SEK': Coins, // Swedish Krona
    'NOK': Coins, // Norwegian Krone
    'DKK': Coins, // Danish Krone
    'PLN': Coins, // Polish Złoty
    'CZK': Coins, // Czech Koruna
    'HUF': Coins, // Hungarian Forint
    'RUB': Coins, // Russian Ruble
    'TRY': Coins, // Turkish Lira
    'ZAR': Coins, // South African Rand
    'BRL': Coins, // Brazilian Real
    'MXN': Coins, // Mexican Peso
    'ARS': Coins, // Argentine Peso
    'CLP': Coins, // Chilean Peso
    'COP': Coins, // Colombian Peso
    'PEN': Coins, // Peruvian Sol
    'UYU': Coins, // Uruguayan Peso
    'VEF': Coins, // Venezuelan Bolívar
    'BBD': DollarSign, // Barbados Dollar
    'BMD': DollarSign, // Bermudian Dollar
    'BND': DollarSign, // Brunei Dollar
    'FJD': DollarSign, // Fijian Dollar
    'GYD': DollarSign, // Guyanese Dollar
    'JMD': DollarSign, // Jamaican Dollar
    'LRD': DollarSign, // Liberian Dollar
    'NAD': DollarSign, // Namibian Dollar
    'SRD': DollarSign, // Surinamese Dollar
    'TTD': DollarSign, // Trinidad and Tobago Dollar
    'TWD': DollarSign, // Taiwan Dollar
    'XCD': DollarSign, // East Caribbean Dollar
    'XPF': Coins, // CFP Franc
    'XOF': Coins, // West African CFA Franc
    'XAF': Coins, // Central African CFA Franc
    'XAU': Coins, // Gold
    'XAG': Coins, // Silver
    'XPT': Coins, // Platinum
    'XPD': Coins, // Palladium
  };

  return currencyMap[currency.toUpperCase()] || CreditCard;
};

/**
 * Currency Icon Component
 */
export const CurrencyIcon: React.FC<{ 
  currency: string; 
  className?: string;
  size?: number;
}> = ({ currency, className = "h-5 w-5 text-success", size }) => {
  const IconComponent = getCurrencyIcon(currency);
  
  return <IconComponent className={className} size={size} />;
}; 