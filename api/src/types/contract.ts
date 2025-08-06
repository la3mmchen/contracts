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
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'draft' | 'terminated';
  category: 'subscription' | 'insurance' | 'utilities' | 'rent' | 'services' | 'software' | 'maintenance' | 'other';
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    contactPerson?: string;
  };
  paymentInfo: {
    nextPaymentDate?: string;
    lastPaymentDate?: string;
    paymentMethod?: string;
    accountNumber?: string;
    autoRenew?: boolean;
    lateFees?: number;
  };
  notes?: string;
  tags?: string[];
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
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string;
  frequency: Contract['frequency'];
  status: Contract['status'];
  category: Contract['category'];
  contactInfo: Contract['contactInfo'];
  paymentInfo: Contract['paymentInfo'];
  notes?: string;
  tags?: string[];
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
} 