import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContractCard } from '@/components/ContractCard';
import { Contract } from '@/types/contract';

// Mock the payment calculator
jest.mock('@/lib/paymentCalculator', () => ({
  calculateNextThreePayments: jest.fn(() => [
    { date: '2024-07-01', amount: 100, currency: 'USD', isNext: true },
    { date: '2024-08-01', amount: 100, currency: 'USD', isNext: false },
    { date: '2024-09-01', amount: 100, currency: 'USD', isNext: false }
  ]),
  formatPaymentDate: jest.fn((date) => date)
}));

const mockContract: Contract = {
  id: '1',
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

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onClose: jest.fn()
};

describe('ContractCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contract information correctly', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('Test Contract')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('ID: TEST-001')).toBeInTheDocument();
    // Use getAllByText since there are multiple instances of the currency
    const currencyElements = screen.getAllByText('$100.00');
    expect(currencyElements.length).toBeGreaterThan(0);
    expect(screen.getByText('/ monthly')).toBeInTheDocument();
  });

  it('should display status and category badges', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('services')).toBeInTheDocument();
  });

  it('should display contact information when available', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
  });

  it('should display description when available', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should display notes when available', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('should display tags when available', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#example')).toBeInTheDocument();
  });

  it('should display document link when available', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    const documentLink = screen.getByText('View Contract Document');
    expect(documentLink).toBeInTheDocument();
    expect(documentLink).toHaveAttribute('href', 'https://example.com/contract.pdf');
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockContract);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ContractCard contract={mockContract} {...mockHandlers} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  describe('Closed Status Functionality', () => {
    it('should display close button for expired contracts', () => {
      const expiredContract: Contract = { ...mockContract, status: 'expired' };
      render(<ContractCard contract={expiredContract} {...mockHandlers} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const expiredContract: Contract = { ...mockContract, status: 'expired' };
      render(<ContractCard contract={expiredContract} {...mockHandlers} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(mockHandlers.onClose).toHaveBeenCalledWith(expiredContract);
    });

    it('should not display close button for non-expired contracts', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('should not display close button when onClose is not provided', () => {
      const expiredContract: Contract = { ...mockContract, status: 'expired' };
      const { onClose, ...handlersWithoutClose } = mockHandlers;
      
      render(<ContractCard contract={expiredContract} {...handlersWithoutClose} />);
      
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('should display closed status correctly', () => {
      const closedContract: Contract = { ...mockContract, status: 'closed' };
      render(<ContractCard contract={closedContract} {...mockHandlers} />);
      
      expect(screen.getByText('closed')).toBeInTheDocument();
    });
  });

  describe('Contract Period Display', () => {
    it('should display start and end dates when both are available', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      expect(screen.getByText('Contract Period:')).toBeInTheDocument();
      expect(screen.getByText('Start: Jan 01, 2024')).toBeInTheDocument();
      expect(screen.getByText('End: Dec 31, 2024')).toBeInTheDocument();
    });

    it('should display only start date when end date is not available', () => {
      const contractWithoutEndDate = { ...mockContract, endDate: undefined };
      render(<ContractCard contract={contractWithoutEndDate} {...mockHandlers} />);
      
      expect(screen.getByText('Start: Jan 01, 2024')).toBeInTheDocument();
      expect(screen.queryByText(/End:/)).not.toBeInTheDocument();
    });
  });

  describe('Contact Information Links', () => {
    it('should make email clickable with mailto link', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      const emailLink = screen.getByText('test@example.com');
      expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
    });

    it('should make phone clickable with tel link', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      const phoneLink = screen.getByText('+1234567890');
      expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890');
    });

    it('should make website clickable with proper link', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      const websiteLink = screen.getByText('https://example.com');
      expect(websiteLink).toHaveAttribute('href', 'https://example.com');
    });

    it('should make address clickable with Google Maps link', () => {
      render(<ContractCard contract={mockContract} {...mockHandlers} />);
      
      const addressLink = screen.getByText('123 Test St');
      expect(addressLink).toHaveAttribute('href', 'https://maps.google.com/?q=123%20Test%20St');
    });
  });
}); 