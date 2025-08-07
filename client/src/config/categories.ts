import { getConfig } from '../services/config';

// Default categories if no environment variable is provided
const DEFAULT_CATEGORIES = [
  'subscription',
  'insurance', 
  'utilities',
  'rent',
  'services',
  'software',
  'maintenance',
  'other'
] as const;

// Load categories from runtime config or use defaults
export const getCategories = (): readonly string[] => {
  // Try to get categories from runtime config
  const config = getConfig();
  if (config?.CATEGORIES) {
    return config.CATEGORIES.split(',').map(cat => cat.trim()) as readonly string[];
  }
  
  return DEFAULT_CATEGORIES;
};

// Get category display names (capitalized)
export const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Type for category values
export type Category = ReturnType<typeof getCategories>[number]; 