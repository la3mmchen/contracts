import { Contract } from '@/types/contract';

export interface PaymentDate {
  date: string;
  amount: number;
  currency: string;
  isNext: boolean;
}

export const calculateNextPaymentDate = (
  startDate: string,
  frequency: Contract['frequency'],
  lastPaymentDate?: string
): string => {
  const start = new Date(startDate);
  const last = lastPaymentDate ? new Date(lastPaymentDate) : start;
  const now = new Date();
  
  // For one-time payments, return the start date
  if (frequency === 'one-time') {
    return startDate;
  }
  
  let nextDate = new Date(last);
  
  // Calculate the next payment date based on frequency
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      // Preserve the day of month when possible
      const currentDay = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 1);
      // If the day changed (e.g., Jan 31 -> Feb 28), keep the last day of the new month
      if (nextDate.getDate() !== currentDay) {
        nextDate.setDate(0); // Go to last day of previous month
      }
      break;
    case 'quarterly':
      // Preserve the day of month when possible
      const currentDayQuarterly = nextDate.getDate();
      nextDate.setMonth(nextDate.getMonth() + 3);
      if (nextDate.getDate() !== currentDayQuarterly) {
        nextDate.setDate(0);
      }
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      return startDate;
  }
  
  // If the calculated next date is in the past, keep adding periods until we get a future date
  while (nextDate <= now) {
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        // Preserve the day of month when possible
        const currentDay = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);
        if (nextDate.getDate() !== currentDay) {
          nextDate.setDate(0);
        }
        break;
      case 'quarterly':
        // Preserve the day of month when possible
        const currentDayQuarterly = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 3);
        if (nextDate.getDate() !== currentDayQuarterly) {
          nextDate.setDate(0);
        }
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
  }
  
  return nextDate.toISOString().split('T')[0];
};

export const calculateNextThreePayments = (
  contract: Contract
): PaymentDate[] => {
  const { startDate, frequency, amount, currency, endDate } = contract;
  
  if (frequency === 'one-time') {
    return [{
      date: startDate,
      amount,
      currency,
      isNext: true
    }];
  }
  
  const payments: PaymentDate[] = [];
  let currentDate = new Date(startDate);
  const now = new Date();
  const end = endDate ? new Date(endDate) : null;
  
  // Find the next payment date
  let nextPaymentDate = calculateNextPaymentDate(startDate, frequency);
  let currentPaymentDate = new Date(nextPaymentDate);
  
  // Generate the next 3 payments
  for (let i = 0; i < 3; i++) {
    // Check if we've reached the end date
    if (end && currentPaymentDate > end) {
      break;
    }
    
    payments.push({
      date: currentPaymentDate.toISOString().split('T')[0],
      amount,
      currency,
      isNext: i === 0
    });
    
    // Calculate the next payment date
    switch (frequency) {
      case 'weekly':
        currentPaymentDate.setDate(currentPaymentDate.getDate() + 7);
        break;
      case 'bi-weekly':
        currentPaymentDate.setDate(currentPaymentDate.getDate() + 14);
        break;
      case 'monthly':
        // Preserve the day of month when possible
        const currentDay = currentPaymentDate.getDate();
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 1);
        if (currentPaymentDate.getDate() !== currentDay) {
          currentPaymentDate.setDate(0);
        }
        break;
      case 'quarterly':
        // Preserve the day of month when possible
        const currentDayQuarterly = currentPaymentDate.getDate();
        currentPaymentDate.setMonth(currentPaymentDate.getMonth() + 3);
        if (currentPaymentDate.getDate() !== currentDayQuarterly) {
          currentPaymentDate.setDate(0);
        }
        break;
      case 'yearly':
        currentPaymentDate.setFullYear(currentPaymentDate.getFullYear() + 1);
        break;
    }
  }
  
  return payments;
};

export const formatPaymentDate = (date: string): string => {
  const paymentDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (paymentDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (paymentDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return paymentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

export const isPaymentDueSoon = (date: string, daysThreshold: number = 7): boolean => {
  const paymentDate = new Date(date);
  const today = new Date();
  const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilPayment >= 0 && daysUntilPayment <= daysThreshold;
}; 