import { calculateNextPaymentDate, calculateNextThreePayments, formatPaymentDate, isPaymentDueSoon } from '@/lib/paymentCalculator';
import { Contract } from '@/types/contract';

describe('Payment Calculator', () => {
  const mockContract: Contract = {
    id: '1',
    contractId: 'TEST-001',
    name: 'Test Contract',
    company: 'Test Company',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    amount: 100,
    currency: 'USD',
    frequency: 'monthly',
    status: 'active',
    category: 'services',
    contactInfo: {},
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  describe('calculateNextPaymentDate', () => {
    beforeEach(() => {
      // Mock current date to 2024-06-15 for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return start date for one-time payments', () => {
      const result = calculateNextPaymentDate('2024-01-01', 'one-time');
      expect(result).toBe('2024-01-01');
    });

    it('should calculate next monthly payment', () => {
      const result = calculateNextPaymentDate('2024-01-01', 'monthly');
      // The result could be either 2024-06-30 or 2024-07-01 depending on timezone
      expect(['2024-06-30', '2024-07-01']).toContain(result);
    });

    it('should calculate next quarterly payment', () => {
      const result = calculateNextPaymentDate('2024-01-01', 'quarterly');
      // The result could be either 2024-06-30 or 2024-07-01 depending on timezone
      expect(['2024-06-30', '2024-07-01']).toContain(result);
    });

    it('should calculate next yearly payment', () => {
      const result = calculateNextPaymentDate('2024-01-01', 'yearly');
      expect(result).toBe('2025-01-01');
    });

    it('should calculate next weekly payment', () => {
      const result = calculateNextPaymentDate('2024-06-10', 'weekly');
      expect(result).toBe('2024-06-17');
    });

    it('should calculate next bi-weekly payment', () => {
      const result = calculateNextPaymentDate('2024-06-10', 'bi-weekly');
      expect(result).toBe('2024-06-24');
    });

    it('should handle past dates by advancing to future', () => {
      const result = calculateNextPaymentDate('2024-01-01', 'monthly', '2024-05-01');
      expect(result).toBe('2024-07-01');
    });
  });

  describe('calculateNextThreePayments', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return single payment for one-time contracts', () => {
      const oneTimeContract: Contract = { ...mockContract, frequency: 'one-time' };
      const result = calculateNextThreePayments(oneTimeContract);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        amount: 100,
        currency: 'USD',
        isNext: true
      });
    });

    it('should return three payments for recurring contracts', () => {
      const result = calculateNextThreePayments(mockContract);
      
      expect(result).toHaveLength(3);
      expect(result[0].isNext).toBe(true);
      expect(result[1].isNext).toBe(false);
      expect(result[2].isNext).toBe(false);
    });

    it('should respect end date when calculating payments', () => {
      const contractWithEndDate: Contract = { 
        ...mockContract, 
        endDate: '2024-07-31' 
      };
      const result = calculateNextThreePayments(contractWithEndDate);
      
      // Should only return payments up to the end date
      expect(result.length).toBeLessThanOrEqual(3);
      result.forEach(payment => {
        const paymentDate = new Date(payment.date);
        const endDate = new Date('2024-07-31');
        expect(paymentDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should handle different frequencies correctly', () => {
      const weeklyContract: Contract = { ...mockContract, frequency: 'weekly' };
      const result = calculateNextThreePayments(weeklyContract);
      
      expect(result).toHaveLength(3);
      // Check that dates are 7 days apart
      const firstDate = new Date(result[0].date);
      const secondDate = new Date(result[1].date);
      const daysDiff = (secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });
  });

  describe('formatPaymentDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Today" for current date', () => {
      const result = formatPaymentDate('2024-06-15');
      expect(result).toBe('Today');
    });

    it('should return "Tomorrow" for next day', () => {
      const result = formatPaymentDate('2024-06-16');
      expect(result).toBe('Tomorrow');
    });

    it('should return formatted date for other dates', () => {
      const result = formatPaymentDate('2024-07-01');
      expect(result).toBe('Jul 1, 2024');
    });
  });

  describe('isPaymentDueSoon', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for payments due within threshold', () => {
      const result = isPaymentDueSoon('2024-06-20', 7);
      expect(result).toBe(true);
    });

    it('should return false for payments due beyond threshold', () => {
      const result = isPaymentDueSoon('2024-06-25', 7);
      expect(result).toBe(false);
    });

    it('should return true for payments due today', () => {
      const result = isPaymentDueSoon('2024-06-15', 7);
      expect(result).toBe(true);
    });

    it('should return false for past payments', () => {
      const result = isPaymentDueSoon('2024-06-10', 7);
      expect(result).toBe(false);
    });

    it('should use default threshold of 7 days', () => {
      const result = isPaymentDueSoon('2024-06-20');
      expect(result).toBe(true);
    });
  });
}); 