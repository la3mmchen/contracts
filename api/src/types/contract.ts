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
  category: 'subscription' | 'insurance' | 'utilities' | 'rent' | 'services' | 'software' | 'maintenance' | 'other';
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
  paperlessTag?: string; // Custom Paperless tag (falls back to c:<short-uuid> if not set)
  paperlessCorrespondent?: string; // Custom Paperless correspondent name (falls back to company)
  connections?: string[]; // Array of contractIds for connected contracts
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
  notesHistory?: NotesHistoryEntry[];
  customFields?: Record<string, string>;
  documentLink?: string;
  paperlessTag?: string; // Custom Paperless tag (falls back to c:<short-uuid> if not set)
  paperlessCorrespondent?: string; // Custom Paperless correspondent name (falls back to company)
  connections?: string[]; // Array of contractIds for connected contracts
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
} 