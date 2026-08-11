import { Category } from '@/config/categories';

export interface NotesHistoryEntry {
  timestamp: string;
  notes: string;
}

export interface Contract {
  id: string;
  contractId: string;
  reference?: string; // Reference number for the contract
  name: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time' | 'weekly' | 'bi-weekly';
  status: 'active' | 'expired' | 'cancelled' | 'terminated' | 'closed';
  category: Category;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
  };
  notes?: string;
  notesHistory?: NotesHistoryEntry[]; // Track notes changes with timestamps
  tags?: string[];
  needsMoreInfo?: boolean; // Flag to indicate contract needs more information
  pinned?: boolean; // Flag to pin contract to the top of the list
  draft?: boolean; // Flag to indicate contract is in draft state
  optimizable?: boolean; // Flag to indicate contract could be optimized
  familyMember?: string; // Which family member the contract is for
  customFields?: Record<string, string>; // Dynamic key-value pairs for additional info
  attachments?: ContractAttachment[];
  documentLink?: string;
  // Custom Paperless tag (falls back to c:<short-uuid> if not set)
  paperlessTag?: string;
  // Custom Paperless correspondent name to also match documents by
  // (falls back to the contract's company if not set)
  paperlessCorrespondent?: string;
  // New: loosely coupled connections to other contracts via user-created contractId
  connections?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadedAt: string;
}

export interface ContractFilters {
  status?: Contract['status'];
  category?: Contract['category'];
  familyMember?: string; // Filter by family member
  company?: string; // Filter by company
  frequency?: Contract['frequency'];
  searchTerm?: string;
  tags?: string[];
  needsMoreInfo?: boolean;
  pinned?: boolean;
  draft?: boolean; // Filter contracts that are in draft state
  optimizable?: boolean; // Filter contracts that could be optimized
  hasAdditionalFields?: boolean; // Filter contracts that have custom fields
  dataQualityGrade?: 'A' | 'B' | 'C' | 'D' | 'F'; // Filter by data quality grade
  sortBy?: 'name' | 'amount' | 'createdAt' | 'updatedAt' | 'company' | 'endDate' | 'reference';
  sortOrder?: 'asc' | 'desc';
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  // New: connection-based filtering
  hasConnections?: boolean; // true -> only with connections; false -> only without; undefined -> any
  connectedTo?: string; // show contracts connected to this contractId
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  monthlyExpenses: number;
  expiredContracts: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface CreateContractRequest {
  contractId: string;
  reference?: string; // Reference number for the contract
  name: string;
  company?: string; // Made optional for draft contracts
  description?: string;
  startDate?: string; // Made optional for draft contracts
  endDate?: string;
  amount?: number; // Made optional for draft contracts
  currency?: string; // Made optional for draft contracts
  frequency?: Contract['frequency']; // Made optional for draft contracts
  status?: Contract['status']; // Made optional for draft contracts
  category?: Contract['category']; // Made optional for draft contracts
  contactInfo?: Contract['contactInfo']; // Made optional for draft contracts
  notes?: string;
  tags?: string[];
  needsMoreInfo?: boolean;
  pinned?: boolean;
  draft?: boolean; // Flag to indicate contract is in draft state
  optimizable?: boolean; // Flag to indicate contract could be optimized
  familyMember?: string; // Which family member the contract is for
  customFields?: Record<string, string>;
  // New: connections by user-managed contractId
  connections?: string[];
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
}