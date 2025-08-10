import { Category } from '@/config/categories';

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
  category: Category;
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

export interface ContractFilters {
  status?: Contract['status'];
  category?: Contract['category'];
  frequency?: Contract['frequency'];
  searchTerm?: string;
  tags?: string[];
  sortBy?: 'name' | 'amount' | 'nextPaymentDate' | 'createdAt' | 'updatedAt' | 'company' | 'endDate';
  sortOrder?: 'asc' | 'desc';
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface ContractStats {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  monthlyExpenses: number;
  upcomingPayments: number;
  expiredContracts: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface CreateContractRequest {
  contractId: string;
  name: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
  frequency: Contract['frequency'];
  status: Contract['status'];
  category: Contract['category'];
  payDate?: string;
  contactInfo: Contract['contactInfo'];
  notes?: string;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
}