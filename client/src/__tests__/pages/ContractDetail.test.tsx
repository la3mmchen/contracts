import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ContractDetail from '@/pages/ContractDetail';
import { Contract } from '@/types/contract';

// Mock contract data
const mockContract: Contract = {
  id: 'test-id',
  contractId: 'TEST-001',
  name: 'Test Contract',
  company: 'Test Company',
  description: 'Test description',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  amount: 100,
  currency: 'USD',
  frequency: 'monthly',
  status: 'active',
  category: 'services',
  contactInfo: {
    email: 'test@example.com',
    phone: '+1234567890',
    website: 'https://example.com',
    address: '123 Test St',
    contactPerson: 'John Doe'
  },
  notes: 'Test notes',
  tags: ['test', 'example'],
  documentLink: 'https://example.com/contract.pdf',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
};

// Mock functions
const mockUpdateContract = jest.fn();
const mockDeleteContract = jest.fn();

// Mock the hooks with proper module factory
jest.mock('@/hooks/useContractStorage', () => ({
  useContractStorage: jest.fn(() => ({
    contracts: [mockContract],
    loading: false,
    updateContract: mockUpdateContract,
    deleteContract: mockDeleteContract
  }))
}));

// Mock the payment calculator
jest.mock('@/lib/paymentCalculator', () => ({
  calculateNextThreePayments: jest.fn(() => [
    { date: '2024-07-01', amount: 100, currency: 'USD', isNext: true },
    { date: '2024-08-01', amount: 100, currency: 'USD', isNext: false },
    { date: '2024-09-01', amount: 100, currency: 'USD', isNext: false }
  ]),
  formatPaymentDate: jest.fn((date) => date)
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  isValidCategory: jest.fn(() => true),
  formatRelativeTime: jest.fn(() => '2 days ago')
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

// Mock window.location
delete (window as any).location;
window.location = { href: 'http://localhost:3000/contract/test-id' } as any;

// Helper function to render component with router
const renderWithRouter = (initialEntries = ['/contract/test-id']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ContractDetail />
    </MemoryRouter>
  );
};

describe('ContractDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithRouter();
      // Just check that the component renders without throwing errors
      expect(document.body).toBeInTheDocument();
    });

    it('should display contract details when contract exists', () => {
      renderWithRouter();

      // These should be present when a contract is found
      expect(screen.getByText('Contract Details')).toBeInTheDocument();
      expect(screen.getByText('Test Contract')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });

    it('should display navigation and action buttons', () => {
      renderWithRouter();

      expect(screen.getByText('Back to Contracts')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Contract Not Found', () => {
    it('should display not found message when no contracts exist', () => {
      // Override the mock for this test
      const { useContractStorage } = require('@/hooks/useContractStorage');
      useContractStorage.mockImplementation(() => ({
        contracts: [],
        loading: false,
        updateContract: mockUpdateContract,
        deleteContract: mockDeleteContract
      }));

      renderWithRouter(['/contract/non-existent-id']);

      expect(screen.getByText('Contract Not Found')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.getByText('View All Contracts')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when loading', () => {
      // Override the mock for this test
      const { useContractStorage } = require('@/hooks/useContractStorage');
      useContractStorage.mockImplementation(() => ({
        contracts: [],
        loading: true,
        updateContract: mockUpdateContract,
        deleteContract: mockDeleteContract
      }));

      renderWithRouter();

      expect(screen.getByText('Loading contract details...')).toBeInTheDocument();
    });
  });

  describe('Basic Interactions', () => {
    it('should handle copy button click', () => {
      renderWithRouter();

      const copyButton = screen.getByText('Copy');
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/contract/test-id');
    });

    it('should handle navigation button clicks', () => {
      renderWithRouter();

      // Test that buttons exist and are clickable
      const backButton = screen.getByText('Back to Contracts');
      const editButton = screen.getByText('Edit');
      const deleteButton = screen.getByText('Delete');

      expect(backButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Test that they don't throw errors when clicked
      fireEvent.click(backButton);
      fireEvent.click(editButton);
      fireEvent.click(deleteButton);
    });
  });

  describe('Component Structure', () => {
    it('should have proper component structure', () => {
      renderWithRouter();

      // Check for key structural elements
      expect(screen.getByText('Direct Link')).toBeInTheDocument();
      expect(screen.getByText(/Share this link/)).toBeInTheDocument();
      
      // Check that the contract card is rendered (it should contain contract data)
      expect(screen.getByText('TEST-001')).toBeInTheDocument(); // Contract ID
      expect(screen.getByText('services')).toBeInTheDocument(); // Category
      expect(screen.getByText('active')).toBeInTheDocument(); // Status
    });
  });

  describe('URL Parameter Handling', () => {
    it('should extract contract ID from URL parameters', () => {
      renderWithRouter(['/contract/different-id']);
      
      // The component should try to find a contract with the ID from the URL
      // Since our mock only has 'test-id', it should show not found
      expect(screen.getByText('Contract Not Found')).toBeInTheDocument();
    });
  });
});