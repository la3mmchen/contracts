import { getConfig } from '../services/config';

// Default currencies if no environment variable is provided
const DEFAULT_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'SEK',
  'NOK',
  'DKK'
] as const;

// Load currencies from runtime config or use defaults
export const getCurrencies = (): readonly string[] => {
  // Try to get currencies from runtime config
  const config = getConfig();
  if (config?.CURRENCIES) {
    return config.CURRENCIES.split(',').map(currency => currency.trim()) as readonly string[];
  }
  
  return DEFAULT_CURRENCIES;
};

// Get currency display names
export const getCurrencyDisplayName = (currency: string): string => {
  // You can add custom display names here if needed
  return currency;
};

// Type for currency values
export type Currency = ReturnType<typeof getCurrencies>[number];
