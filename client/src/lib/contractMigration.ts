import { Contract } from '@/types/contract';
import { calculateNextPaymentDate } from './paymentCalculator';

// Legacy contract interface for backward compatibility
interface LegacyContract {
  id?: string;
  contractId: string;
  name: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time' | 'weekly' | 'bi-weekly';
  status: 'active' | 'expired' | 'cancelled' | 'terminated' | 'closed' | 'pending' | 'draft';
  category: string;
  payDate?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
  };
  paymentInfo?: {
    nextPaymentDate?: string | null;
    lastPaymentDate?: string;
    paymentMethod?: string;
    accountNumber?: string;
    autoRenew?: boolean;
    lateFees?: number;
  };
  notes?: string;
  tags?: string[];
  attachments?: any[];
  documentLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MigrationResult {
  contract: Contract;
  wasMigrated: boolean;
  migrationNotes: string[];
}

/**
 * Migrates a legacy contract to the new format
 */
export const migrateContract = (legacyContract: LegacyContract): MigrationResult => {
  const migrationNotes: string[] = [];
  let wasMigrated = false;

  // Create a copy of the contract
  const migratedContract: Contract = {
    id: legacyContract.id || '',
    contractId: legacyContract.contractId,
    name: legacyContract.name,
    company: legacyContract.company,
    description: legacyContract.description,
    startDate: legacyContract.startDate,
    endDate: legacyContract.endDate,
    amount: legacyContract.amount,
    currency: legacyContract.currency,
    frequency: legacyContract.frequency,
    status: migrateStatus(legacyContract.status, migrationNotes),
    category: migrateCategory(legacyContract.category),
    payDate: legacyContract.payDate,
    contactInfo: migrateContactInfo(legacyContract, migrationNotes),
    notes: legacyContract.notes,
    tags: legacyContract.tags || [],
    attachments: legacyContract.attachments || [],
    documentLink: legacyContract.documentLink,
    createdAt: legacyContract.createdAt || new Date().toISOString(),
    updatedAt: legacyContract.updatedAt || new Date().toISOString(),
  };

  // Handle payment info migration
  if (legacyContract.paymentInfo) {
    wasMigrated = true;
    migrationNotes.push('Migrated from paymentInfo object to calculated payDate');
    
    // If we have a nextPaymentDate, use it as payDate
    if (legacyContract.paymentInfo.nextPaymentDate) {
      migratedContract.payDate = legacyContract.paymentInfo.nextPaymentDate;
    } else {
      // Calculate the next payment date
      migratedContract.payDate = calculateNextPaymentDate(
        legacyContract.startDate,
        legacyContract.frequency,
        legacyContract.paymentInfo.lastPaymentDate
      );
    }
  }

  // Handle missing contactInfo
  if (legacyContract.contactInfo === undefined) {
    wasMigrated = true;
    migrationNotes.push('Added missing contactInfo structure');
    migratedContract.contactInfo = {};
  }

  // Handle status migration
  if (legacyContract.status === 'pending' || legacyContract.status === 'draft') {
    wasMigrated = true;
    migrationNotes.push(`Migrated status from '${legacyContract.status}' to 'active'`);
  }

  return {
    contract: migratedContract,
    wasMigrated,
    migrationNotes,
  };
};

/**
 * Migrates contract status from legacy to new format
 */
const migrateStatus = (
  legacyStatus: string,
  migrationNotes: string[]
): Contract['status'] => {
  switch (legacyStatus) {
    case 'pending':
    case 'draft':
      return 'active';
    case 'active':
    case 'expired':
    case 'cancelled':
    case 'terminated':
    case 'closed':
      return legacyStatus as Contract['status'];
    default:
      migrationNotes.push(`Unknown status '${legacyStatus}', defaulting to 'active'`);
      return 'active';
  }
};

/**
 * Migrates category to ensure it's valid
 */
const migrateCategory = (legacyCategory: string): Contract['category'] => {
  const validCategories = [
    'subscription',
    'insurance',
    'utilities',
    'rent',
    'services',
    'software',
    'maintenance',
    'other'
  ];

  if (validCategories.includes(legacyCategory)) {
    return legacyCategory as Contract['category'];
  }

  // Map common legacy categories
  const categoryMap: Record<string, Contract['category']> = {
    'subscriptions': 'subscription',
    'insurance': 'insurance',
    'utility': 'utilities',
    'utilities': 'utilities',
    'rental': 'rent',
    'rent': 'rent',
    'service': 'services',
    'services': 'services',
    'maintenance': 'maintenance',
    'other': 'other',
  };

  return categoryMap[legacyCategory.toLowerCase()] || 'other';
};

/**
 * Migrates contact info to ensure proper structure
 */
const migrateContactInfo = (
  legacyContract: LegacyContract,
  migrationNotes: string[]
): Contract['contactInfo'] => {
  if (!legacyContract.contactInfo) {
    return {};
  }

  // Check if contactInfo is properly structured
  const hasValidStructure = typeof legacyContract.contactInfo === 'object' &&
    (legacyContract.contactInfo.email !== undefined ||
     legacyContract.contactInfo.phone !== undefined ||
     legacyContract.contactInfo.address !== undefined ||
     legacyContract.contactInfo.website !== undefined ||
     legacyContract.contactInfo.contactPerson !== undefined);

  if (!hasValidStructure) {
    migrationNotes.push('Fixed malformed contactInfo structure');
    return {};
  }

  return {
    email: legacyContract.contactInfo.email,
    phone: legacyContract.contactInfo.phone,
    address: legacyContract.contactInfo.address,
    website: legacyContract.contactInfo.website,
    contactPerson: legacyContract.contactInfo.contactPerson,
  };
};

/**
 * Checks if a contract needs migration
 */
export const needsMigration = (contract: any): boolean => {
  // Only migrate if contract has legacy paymentInfo structure
  if (contract.paymentInfo !== undefined) {
    return true;
  }
  
  // Only migrate if contract has legacy statuses
  if (contract.status === 'pending' || contract.status === 'draft') {
    return true;
  }
  
  // Only migrate if contactInfo is completely missing (not just empty)
  if (contract.contactInfo === undefined) {
    return true;
  }
  
  // Don't migrate if contactInfo exists but is empty object
  return false;
};

/**
 * Migrates an array of contracts
 */
export const migrateContracts = (legacyContracts: LegacyContract[]): MigrationResult[] => {
  return legacyContracts.map(migrateContract);
};

/**
 * Gets migration summary for a batch of contracts
 */
export const getMigrationSummary = (results: MigrationResult[]) => {
  const migrated = results.filter(r => r.wasMigrated);
  const total = results.length;
  
  return {
    total,
    migrated: migrated.length,
    unchanged: total - migrated.length,
    migrationNotes: migrated.flatMap(r => r.migrationNotes),
  };
}; 