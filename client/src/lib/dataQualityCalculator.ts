import { Contract } from '@/types/contract';

export interface DataQualityScore {
  score: number;
  maxScore: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  missingFields: string[];
  suggestions: string[];
}

export const calculateDataQualityScore = (contract: Contract): DataQualityScore => {
  let score = 0;
  const maxScore = 75; // Reduced from 150 since we removed 5 auto-set fields (5 × 15 = 75)
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // Critical Fields (15 points each) - Required for a basic contract
  if (contract.name?.trim()) {
    score += 15;
  } else {
    missingFields.push('Contract Name');
    suggestions.push('Add a descriptive contract name');
  }

  if (contract.company?.trim()) {
    score += 15;
  } else {
    missingFields.push('Company Name');
    suggestions.push('Specify the company or vendor name');
  }

  if (contract.amount && contract.amount > 0) {
    score += 15;
  } else {
    missingFields.push('Contract Amount');
    suggestions.push('Enter the contract amount');
  }

  // Important Fields (8 points each) - Add significant value
  if (contract.description?.trim()) {
    score += 8;
  } else {
    missingFields.push('Description');
    suggestions.push('Add a contract description');
  }

  if (contract.endDate) {
    score += 8;
  } else {
    missingFields.push('End Date');
    suggestions.push('Set an end date if applicable');
  }

  if (contract.payDate) {
    score += 8;
  } else {
    missingFields.push('Next Payment Date');
    suggestions.push('Set the next payment date');
  }

  if (contract.contactInfo?.email?.trim()) {
    score += 8;
  } else {
    missingFields.push('Contact Email');
    suggestions.push('Add a contact email');
  }

  if (contract.contactInfo?.phone?.trim()) {
    score += 8;
  } else {
    missingFields.push('Contact Phone');
    suggestions.push('Add a contact phone number');
  }

  if (contract.notes?.trim()) {
    score += 8;
  } else {
    missingFields.push('Notes');
    suggestions.push('Add relevant notes or comments');
  }

  // Nice-to-Have Fields (3 points each) - Enhance the contract
  if (contract.reference?.trim()) {
    score += 3;
  }

  if (contract.contactInfo?.address?.trim()) {
    score += 3;
  }

  if (contract.contactInfo?.website?.trim()) {
    score += 3;
  }

  if (contract.contactInfo?.contactPerson?.trim()) {
    score += 3;
  }

  if (contract.tags && contract.tags.length > 0) {
    score += 3;
  }

  if (contract.documentLink?.trim()) {
    score += 3;
  }

  if (contract.attachments && contract.attachments.length > 0) {
    score += 3;
  }

  if (contract.customFields && Object.keys(contract.customFields).length > 0) {
    score += 3;
  }

  // Bonus Points (2 points each) - Recognition for extra effort
  if (contract.priceChanges && contract.priceChanges.length > 0) {
    score += 2;
  }

  if (contract.notesHistory && contract.notesHistory.length > 0) {
    score += 2;
  }

  // Cap the score at maxScore to prevent percentages over 100%
  const cappedScore = Math.min(score, maxScore);
  const percentage = Math.round((cappedScore / maxScore) * 100);

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';
  else grade = 'F';

  return {
    score: cappedScore, // Return the capped score
    maxScore,
    percentage,
    grade,
    missingFields,
    suggestions
  };
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return 'text-green-600 dark:text-green-400';
    case 'B': return 'text-blue-600 dark:text-blue-400';
    case 'C': return 'text-yellow-600 dark:text-yellow-400';
    case 'D': return 'text-orange-600 dark:text-orange-400';
    case 'F': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
};

export const getGradeBackground = (grade: string): string => {
  switch (grade) {
    case 'A': return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    case 'B': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    case 'C': return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
    case 'D': return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
    case 'F': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    default: return 'bg-muted border-border';
  }
};
