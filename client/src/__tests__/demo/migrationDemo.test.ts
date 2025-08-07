import { migrateContract, needsMigration } from '@/lib/contractMigration';

describe('Migration Demo', () => {
  it('should demonstrate migration of legacy contract', () => {
    // This is the legacy contract that will trigger migration
    const legacyContract = {
      contractId: 'LEGACY-MIGRATION-001',
      name: 'Legacy Migration Test Contract',
      company: 'Legacy Test Company',
      description: 'This contract demonstrates the migration utility by using the old format with paymentInfo, pending status, and legacy category',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      amount: 150.00,
      currency: 'USD',
      frequency: 'monthly' as const,
      status: 'pending' as const,
      category: 'subscriptions',
      paymentInfo: {
        nextPaymentDate: '2024-02-01',
        lastPaymentDate: '2024-01-01',
        paymentMethod: 'Credit Card',
        accountNumber: '****-****-****-5678',
        autoRenew: true,
        lateFees: 25.00
      },
      notes: 'This contract will be automatically migrated to the new format when loaded. It demonstrates: 1) paymentInfo → payDate conversion, 2) pending → active status, 3) subscriptions → subscription category, 4) missing contactInfo structure addition',
      tags: ['legacy', 'migration', 'test', 'pending'],
      documentLink: 'https://example.com/legacy-contract'
    };

    // Check if migration is needed
    console.log('🔍 Checking if contract needs migration...');
    const needsMigrating = needsMigration(legacyContract);
    console.log(`Migration needed: ${needsMigrating}`);

    // Perform migration
    console.log('🔄 Performing migration...');
    const result = migrateContract(legacyContract);

    // Log the results
    console.log('\n📊 Migration Results:');
    console.log(`- Was migrated: ${result.wasMigrated}`);
    console.log(`- Migration notes: ${result.migrationNotes.join(', ')}`);
    
    console.log('\n📋 Before Migration (Legacy Format):');
    console.log(`- Status: ${legacyContract.status}`);
    console.log(`- Category: ${legacyContract.category}`);
    console.log(`- Has paymentInfo: ${!!legacyContract.paymentInfo}`);
    console.log(`- Has contactInfo: ${!!(legacyContract as any).contactInfo}`);

    console.log('\n✅ After Migration (New Format):');
    console.log(`- Status: ${result.contract.status}`);
    console.log(`- Category: ${result.contract.category}`);
    console.log(`- Has paymentInfo: ${!!(result.contract as any).paymentInfo}`);
    console.log(`- Has contactInfo: ${!!result.contract.contactInfo}`);
    console.log(`- PayDate: ${result.contract.payDate}`);

    // Assertions to verify migration worked
    expect(needsMigrating).toBe(true);
    expect(result.wasMigrated).toBe(true);
    expect(result.contract.status).toBe('active');
    expect(result.contract.category).toBe('subscription');
    expect((result.contract as any).paymentInfo).toBeUndefined();
    expect(result.contract.contactInfo).toEqual({});
    expect(result.contract.payDate).toBe('2024-02-01');
    expect(result.migrationNotes).toContain('Migrated from paymentInfo object to calculated payDate');
    expect(result.migrationNotes).toContain("Migrated status from 'pending' to 'active'");
    expect(result.migrationNotes).toContain('Added missing contactInfo structure');

    console.log('\n🎉 Migration completed successfully!');
  });

  it('should demonstrate migration of draft status contract', () => {
    const draftContract = {
      contractId: 'DRAFT-TEST-001',
      name: 'Draft Status Test Contract',
      company: 'Draft Test Company',
      startDate: '2024-01-01',
      amount: 200.00,
      currency: 'USD',
      frequency: 'quarterly' as const,
      status: 'draft' as const,
      category: 'utility',
      paymentInfo: {
        nextPaymentDate: '2024-04-01',
        lastPaymentDate: '2024-01-01',
        paymentMethod: 'Bank Transfer',
        autoRenew: false,
        lateFees: 0
      },
      notes: 'Testing draft status migration'
    };

    console.log('\n🔄 Migrating draft status contract...');
    const result = migrateContract(draftContract);

    console.log('📊 Draft Migration Results:');
    console.log(`- Original status: ${draftContract.status}`);
    console.log(`- Migrated status: ${result.contract.status}`);
    console.log(`- Migration notes: ${result.migrationNotes.join(', ')}`);

    expect(result.wasMigrated).toBe(true);
    expect(result.contract.status).toBe('active');
    expect(result.contract.category).toBe('utilities');
    expect(result.migrationNotes).toContain("Migrated status from 'draft' to 'active'");
  });

  it('should demonstrate migration of contract without contactInfo', () => {
    const noContactContract = {
      contractId: 'NO-CONTACT-001',
      name: 'No Contact Info Contract',
      company: 'No Contact Company',
      startDate: '2024-01-01',
      amount: 100.00,
      currency: 'USD',
      frequency: 'monthly' as const,
      status: 'active' as const,
      category: 'rental',
      payDate: '2024-02-01',
      notes: 'Testing missing contactInfo migration'
    };

    console.log('\n🔄 Migrating contract without contactInfo...');
    const result = migrateContract(noContactContract);

    console.log('📊 ContactInfo Migration Results:');
    console.log(`- Has contactInfo before: ${!!(noContactContract as any).contactInfo}`);
    console.log(`- Has contactInfo after: ${!!result.contract.contactInfo}`);
    console.log(`- ContactInfo structure: ${JSON.stringify(result.contract.contactInfo)}`);

    expect(result.wasMigrated).toBe(true);
    expect(result.contract.contactInfo).toEqual({});
    expect(result.contract.category).toBe('rent');
    expect(result.migrationNotes).toContain('Added missing contactInfo structure');
  });
}); 