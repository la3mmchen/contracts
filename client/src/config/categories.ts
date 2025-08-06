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

// Load categories from environment variable or use defaults
export const getCategories = (): readonly string[] => {
  // Handle test environment where import.meta might not be available
  let envCategories: string | undefined;
  
  try {
    // @ts-ignore - import.meta is available in Vite but not in Jest
    envCategories = import.meta?.env?.VITE_CATEGORIES;
  } catch {
    // Fallback for test environment
    envCategories = undefined;
  }
  
  if (envCategories) {
    // Parse comma-separated categories from environment variable
    return envCategories.split(',').map(cat => cat.trim()) as readonly string[];
  }
  
  return DEFAULT_CATEGORIES;
};

// Get category display names (capitalized)
export const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Type for category values
export type Category = ReturnType<typeof getCategories>[number]; 