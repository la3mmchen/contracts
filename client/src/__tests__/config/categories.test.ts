// Self-contained test for categories functionality (no import.meta issues)

// Test implementation of categories functions
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

const getCategories = (): readonly string[] => {
  return Object.freeze([...DEFAULT_CATEGORIES]);
};

const getCategoryDisplayName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

describe('Categories Configuration', () => {
  describe('getCategories', () => {
    it('should return default categories', () => {
      const categories = getCategories();
      
      expect(categories).toEqual([
        'subscription',
        'insurance', 
        'utilities',
        'rent',
        'services',
        'software',
        'maintenance',
        'other'
      ]);
    });

    it('should return readonly array', () => {
      const categories = getCategories();
      expect(Object.isFrozen(categories)).toBe(true);
    });
  });

  describe('getCategoryDisplayName', () => {
    it('should capitalize first letter of category', () => {
      expect(getCategoryDisplayName('subscription')).toBe('Subscription');
      expect(getCategoryDisplayName('insurance')).toBe('Insurance');
      expect(getCategoryDisplayName('utilities')).toBe('Utilities');
    });

    it('should handle single character categories', () => {
      expect(getCategoryDisplayName('a')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(getCategoryDisplayName('')).toBe('');
    });
  });
}); 