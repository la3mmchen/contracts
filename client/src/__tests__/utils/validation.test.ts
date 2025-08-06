// Simple validation utility functions for testing
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount: number): boolean => {
  return amount >= 0 && Number.isFinite(amount);
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Tests
describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('simple@test.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should validate correct amounts', () => {
      expect(isValidAmount(0)).toBe(true);
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(99.99)).toBe(true);
      expect(isValidAmount(1000000)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(-Infinity)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct dates', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2024-06-15')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('2024-00-01')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });
}); 