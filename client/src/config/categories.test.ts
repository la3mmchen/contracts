// Test-specific categories configuration (no import.meta)
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

// Load categories from environment variable or use defaults
export const getCategories = (): readonly string[] => {
  // In test environment, always use defaults
  return DEFAULT_CATEGORIES;
};

// Get category display names (capitalized)
export const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Type for category values
export type Category = ReturnType<typeof getCategories>[number]; 