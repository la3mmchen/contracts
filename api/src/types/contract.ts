export interface PriceChange {
  date: string;
  previousAmount: number;
  newAmount: number;
  reason: string;
  effectiveDate: string;
}

export interface Contract {
  id: string;
  contractId: string;
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
  payDate?: string; // Calculated payment date
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
  };
  notes?: string;
  tags?: string[];
  needsMoreInfo?: boolean; // Flag to indicate contract needs more information
  pinned?: boolean; // Flag to pin contract to the top of the list
  draft?: boolean; // Flag to indicate contract is in draft state
  priceChanges?: PriceChange[]; // Array of amount changes over time
  customFields?: Record<string, string>; // Dynamic key-value pairs for additional info
  attachments?: ContractAttachment[];
  documentLink?: string;
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
  payDate?: string;
  contactInfo?: Contract['contactInfo']; // Made optional for draft contracts
  notes?: string;
  tags?: string[];
  needsMoreInfo?: boolean;
  pinned?: boolean;
  draft?: boolean; // Flag to indicate contract is in draft state
  priceChanges?: PriceChange[];
  customFields?: Record<string, string>;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
} 