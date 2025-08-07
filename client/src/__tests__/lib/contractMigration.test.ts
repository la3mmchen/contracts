import { migrateContract, needsMigration, migrateContracts, getMigrationSummary } from '@/lib/contractMigration';

describe('Contract Migration', () => {
  const legacyContract = {
    contractId: 'LEGACY-001',
    name: 'Legacy Contract',
    company: 'Legacy Company',
    startDate: '2024-01-01',
    amount: 100,
    currency: 'USD',
    frequency: 'monthly' as const,
    status: 'pending' as const,
    category: 'utilities',
    paymentInfo: {
      nextPaymentDate: '2024-02-01',
      lastPaymentDate: '2024-01-01',
      paymentMethod: 'Credit Card',
      accountNumber: '****-****-****-1234',
      autoRenew: true,
      lateFees: 0
    },
    notes: 'Legacy contract with old format'
  };

  const newFormatContract = {
    contractId: 'NEW-001',
    name: 'New Contract',
    company: 'New Company',
    startDate: '2024-01-01',
    amount: 100,
    currency: 'USD',
    frequency: 'monthly' as const,
    status: 'active' as const,
    category: 'services',
    payDate: '2024-02-01',
    contactInfo: {
      email: 'test@example.com',
      phone: '+1234567890'
    },
    notes: 'New format contract'
  };

  describe('needsMigration', () => {
    it('should return true for legacy contracts with paymentInfo', () => {
      expect(needsMigration(legacyContract)).toBe(true);
    });

    it('should return true for contracts with pending status', () => {
      const pendingContract = { ...newFormatContract, status: 'pending' as const };
      expect(needsMigration(pendingContract)).toBe(true);
    });

    it('should return true for contracts with draft status', () => {
      const draftContract = { ...newFormatContract, status: 'draft' as const };
      expect(needsMigration(draftContract)).toBe(true);
    });

    it('should return true for contracts without contactInfo', () => {
      const noContactContract = { ...newFormatContract };
      delete (noContactContract as any).contactInfo;
      expect(needsMigration(noContactContract)).toBe(true);
    });

    it('should return false for new format contracts', () => {
      expect(needsMigration(newFormatContract)).toBe(false);
    });
  });

  describe('migrateContract', () => {
    it('should migrate legacy contract with paymentInfo', () => {
      const result = migrateContract(legacyContract);
      
      expect(result.wasMigrated).toBe(true);
      expect((result.contract as any).paymentInfo).toBeUndefined();
      expect(result.contract.payDate).toBe('2024-02-01');
      expect(result.contract.status).toBe('active');
      expect(result.contract.contactInfo).toEqual({});
      expect(result.migrationNotes).toContain('Migrated from paymentInfo object to calculated payDate');
      expect(result.migrationNotes).toContain("Migrated status from 'pending' to 'active'");
      expect(result.migrationNotes).toContain('Added missing contactInfo structure');
    });

    it('should migrate pending status to active', () => {
      const pendingContract = { ...newFormatContract, status: 'pending' as const };
      const result = migrateContract(pendingContract);
      
      expect(result.wasMigrated).toBe(true);
      expect(result.contract.status).toBe('active');
      expect(result.migrationNotes).toContain("Migrated status from 'pending' to 'active'");
    });

    it('should migrate draft status to active', () => {
      const draftContract = { ...newFormatContract, status: 'draft' as const };
      const result = migrateContract(draftContract);
      
      expect(result.wasMigrated).toBe(true);
      expect(result.contract.status).toBe('active');
      expect(result.migrationNotes).toContain("Migrated status from 'draft' to 'active'");
    });

    it('should add missing contactInfo structure', () => {
      const noContactContract = { ...newFormatContract };
      delete (noContactContract as any).contactInfo;
      const result = migrateContract(noContactContract);
      
      expect(result.wasMigrated).toBe(true);
      expect(result.contract.contactInfo).toEqual({});
      expect(result.migrationNotes).toContain('Added missing contactInfo structure');
    });

    it('should not migrate new format contracts', () => {
      const result = migrateContract(newFormatContract);
      
      expect(result.wasMigrated).toBe(false);
      expect(result.migrationNotes).toHaveLength(0);
    });

    it('should handle contracts without paymentInfo but with payDate', () => {
      const contractWithPayDate = { ...newFormatContract, paymentInfo: undefined };
      const result = migrateContract(contractWithPayDate);
      
      expect(result.wasMigrated).toBe(false);
      expect(result.contract.payDate).toBe('2024-02-01');
    });
  });

  describe('migrateContracts', () => {
    it('should migrate multiple contracts', () => {
      const contracts = [legacyContract, newFormatContract];
      const results = migrateContracts(contracts);
      
      expect(results).toHaveLength(2);
      expect(results[0].wasMigrated).toBe(true);
      expect(results[1].wasMigrated).toBe(false);
    });
  });

  describe('getMigrationSummary', () => {
    it('should provide correct migration summary', () => {
      const contracts = [legacyContract, newFormatContract];
      const results = migrateContracts(contracts);
      const summary = getMigrationSummary(results);
      
      expect(summary.total).toBe(2);
      expect(summary.migrated).toBe(1);
      expect(summary.unchanged).toBe(1);
      expect(summary.migrationNotes.length).toBeGreaterThan(0);
    });
  });

  describe('category migration', () => {
    it('should migrate common legacy categories', () => {
      const legacyCategories = [
        { input: 'subscriptions', expected: 'subscription' },
        { input: 'utility', expected: 'utilities' },
        { input: 'rental', expected: 'rent' },
        { input: 'service', expected: 'services' },
        { input: 'unknown', expected: 'other' }
      ];

      legacyCategories.forEach(({ input, expected }) => {
        const contract = { ...legacyContract, category: input };
        const result = migrateContract(contract);
        expect(result.contract.category).toBe(expected);
      });
    });
  });
}); 