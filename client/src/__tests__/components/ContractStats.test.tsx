import React from 'react';
import { render } from '@testing-library/react';
import { ContractStats } from '@/components/ContractStats';
import { Contract } from '@/types/contract';

const mockContracts: Contract[] = [
  {
    id: '1',
    contractId: 'ACTIVE-001',
    name: 'Active Contract',
    company: 'Active Company',
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
  },
  {
    id: '2',
    contractId: 'EXPIRED-001',
    name: 'Expired Contract',
    company: 'Expired Company',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    amount: 200,
    currency: 'USD',
    frequency: 'monthly',
    status: 'expired',
    category: 'utilities',
    contactInfo: {},
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  },
  {
    id: '3',
    contractId: 'CLOSED-001',
    name: 'Closed Contract',
    company: 'Closed Company',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    amount: 150,
    currency: 'USD',
    frequency: 'monthly',
    status: 'closed',
    category: 'insurance',
    contactInfo: {},
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

describe('ContractStats', () => {
  it('should render without crashing', () => {
    const { container } = render(<ContractStats contracts={mockContracts} />);
    expect(container).toBeTruthy();
  });

  it('should render with empty contracts array', () => {
    const { container } = render(<ContractStats contracts={[]} />);
    expect(container).toBeTruthy();
  });

  it('should render with different contract statuses', () => {
    const { container } = render(<ContractStats contracts={mockContracts} />);
    expect(container).toBeTruthy();
  });
}); 