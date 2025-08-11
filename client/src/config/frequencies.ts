import { getConfig } from '../services/config';

// Default frequencies if no environment variable is provided
const DEFAULT_FREQUENCIES = [
  'monthly',
  'quarterly',
  'yearly',
  'weekly',
  'bi-weekly',
  'one-time'
] as const;

// Load frequencies from runtime config or use defaults
export const getFrequencies = (): readonly string[] => {
  // Try to get frequencies from runtime config
  const config = getConfig();
  if (config?.FREQUENCIES) {
    return config.FREQUENCIES.split(',').map(frequency => frequency.trim()) as readonly string[];
  }
  
  return DEFAULT_FREQUENCIES;
};

// Get frequency display names (capitalized)
export const getFrequencyDisplayName = (frequency: string): string => {
  // Handle special cases
  if (frequency === 'bi-weekly') return 'Bi-Weekly';
  if (frequency === 'one-time') return 'One-Time';
  
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
};

// Type for frequency values
export type Frequency = ReturnType<typeof getFrequencies>[number];
