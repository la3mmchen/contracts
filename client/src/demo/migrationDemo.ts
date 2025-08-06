import { migrateContract, needsMigration } from '../lib/contractMigration';

console.log('🚀 Migration Utility Demo');
console.log('========================\n');

// Demo 1: Legacy contract with paymentInfo, pending status, and legacy category
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

console.log('📋 Demo 1: Legacy Contract Migration');
console.log('=====================================');

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

console.log('\n🎉 Migration completed successfully!');

// Demo 2: Draft status contract
console.log('\n\n📋 Demo 2: Draft Status Migration');
console.log('===================================');

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

console.log('🔄 Migrating draft status contract...');
const draftResult = migrateContract(draftContract);

console.log('📊 Draft Migration Results:');
console.log(`- Original status: ${draftContract.status}`);
console.log(`- Migrated status: ${draftResult.contract.status}`);
console.log(`- Original category: ${draftContract.category}`);
console.log(`- Migrated category: ${draftResult.contract.category}`);
console.log(`- Migration notes: ${draftResult.migrationNotes.join(', ')}`);

// Demo 3: Contract without contactInfo
console.log('\n\n📋 Demo 3: Missing ContactInfo Migration');
console.log('===========================================');

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

console.log('🔄 Migrating contract without contactInfo...');
const contactResult = migrateContract(noContactContract);

console.log('📊 ContactInfo Migration Results:');
console.log(`- Has contactInfo before: ${!!(noContactContract as any).contactInfo}`);
console.log(`- Has contactInfo after: ${!!contactResult.contract.contactInfo}`);
console.log(`- ContactInfo structure: ${JSON.stringify(contactResult.contract.contactInfo)}`);
console.log(`- Original category: ${noContactContract.category}`);
console.log(`- Migrated category: ${contactResult.contract.category}`);

console.log('\n🎉 All migration demos completed successfully!');
console.log('\n📝 Summary:');
console.log('- Demo 1: Legacy contract with paymentInfo, pending status, and legacy category');
console.log('- Demo 2: Draft status contract with utility category');
console.log('- Demo 3: Contract without contactInfo structure');
console.log('\n✅ All contracts were successfully migrated to the new format!'); 