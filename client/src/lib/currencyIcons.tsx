import React from 'react';
import { 
  Coins, 
  Euro, 
  PoundSterling, 
  IndianRupee, 
  CreditCard,
  Wallet
} from 'lucide-react';

/**
 * Get appropriate icon for currency
 */
export const getCurrencyIcon = (currency: string) => {
  const currencyMap: Record<string, React.ComponentType<any>> = {
    'USD': Coins,
    'EUR': Euro,
    'GBP': PoundSterling,
    'JPY': Coins,
    'INR': IndianRupee,
    'CNY': Coins, // Chinese Yuan
    'KRW': Coins, // Korean Won
    'THB': Coins, // Thai Baht
    'SGD': Coins, // Singapore Dollar
    'HKD': Coins, // Hong Kong Dollar
    'CAD': Coins, // Canadian Dollar
    'AUD': Coins, // Australian Dollar
    'NZD': Coins, // New Zealand Dollar
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
    'BBD': Coins, // Barbados Dollar
    'BMD': Coins, // Bermudian Dollar
    'BND': Coins, // Brunei Dollar
    'FJD': Coins, // Fijian Dollar
    'GYD': Coins, // Guyanese Dollar
    'JMD': Coins, // Jamaican Dollar
    'LRD': Coins, // Liberian Dollar
    'NAD': Coins, // Namibian Dollar
    'SRD': Coins, // Surinamese Dollar
    'TTD': Coins, // Trinidad and Tobago Dollar
    'TWD': Coins, // Taiwan Dollar
    'XCD': Coins, // East Caribbean Dollar
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