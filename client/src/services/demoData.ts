import { Contract } from '../types/contract';

// Simple demo contracts for when API is not available
export const demoContracts: Contract[] = [
  {
    id: 'demo-netflix',
    contractId: 'NFLX-2024-002',
    reference: 'PO-2024-001',
    name: 'Netflix Premium',
    company: 'Netflix, Inc.',
    description: 'Premium streaming plan with 4K Ultra HD and 4 simultaneous streams',
    startDate: '2024-01-01',
    endDate: null,
    amount: 22.99,
    currency: 'USD',
    frequency: 'monthly',
    status: 'active',
    category: 'subscription',
    payDate: '2024-12-15',
    contactInfo: {
      email: 'help@netflix.com',
      phone: '+1-866-579-7172',
      website: 'https://netflix.com',
      address: '100 Winchester Circle, Los Gatos, CA 95032'
    },
    notes: 'Premium plan with 4K Ultra HD quality and 4 simultaneous streams. Shared account with family.',
    tags: ['streaming', 'entertainment', '4K'],
    pinned: true,
    priceChanges: [
      {
        date: '2024-07-01',
        previousAmount: 19.99,
        newAmount: 22.99,
        reason: 'Annual price increase',
        effectiveDate: '2024-07-01'
      }
    ],
    customFields: {
      'Account Email': 'family@example.com',
      'Plan Type': 'Premium',
      'Streams': '4',
      'Quality': '4K Ultra HD'
    },
    documentLink: 'https://netflix.com/account/billing',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2025-09-15T10:00:00.000Z'
  },
  {
    id: 'demo-spotify',
    contractId: 'SPOT-2024-001',
    name: 'Spotify Premium Family',
    company: 'Spotify Technology S.A.',
    description: 'Family plan with 6 premium accounts, ad-free music and offline downloads',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    amount: 16.99,
    currency: 'EUR',
    frequency: 'monthly',
    status: 'active',
    category: 'subscription',
    payDate: '2024-12-15',
    contactInfo: {
      email: 'support@spotify.com',
      phone: '+1-800-456-9374',
      website: 'https://spotify.com',
      address: '4 World Trade Center, 150 Greenwich Street, New York, NY 10007'
    },
    notes: 'Family plan with 6 accounts. Shared payment method.',
    tags: ['music', 'streaming', 'family'],
    customFields: {
      'Account Email': 'family@example.com',
      'Family Members': '6',
      'Account ID': 'SP-78901'
    },
    documentLink: 'https://drive.google.com/file/d/2DEF456GHI789/view?usp=sharing',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2025-06-15T10:00:00.000Z'
  },
  {
    id: 'demo-gym',
    contractId: 'GYM-2024-001',
    name: 'Fitness First Premium Membership',
    company: 'Fitness First International',
    description: 'Premium gym membership with access to all facilities, classes, and personal training sessions',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    amount: 89.99,
    currency: 'EUR',
    frequency: 'monthly',
    status: 'active',
    category: 'services',
    payDate: '2024-12-01',
    contactInfo: {
      email: 'membership@fitnessfirst.com',
      phone: '+49-30-12345678',
      website: 'https://fitnessfirst.de',
      address: 'Alexanderplatz 1, 10178 Berlin, Germany'
    },
    notes: 'Premium membership includes access to all gym locations, unlimited classes, personal training sessions, and spa facilities.',
    tags: ['fitness', 'health', 'premium'],
    customFields: {
      'Membership Level': 'Premium',
      'Home Location': 'Alexanderplatz',
      'Personal Trainer': 'Yes',
      'Spa Access': 'Yes'
    },
    createdAt: '2024-01-01T09:00:00.000Z',
    updatedAt: '2024-09-15T11:00:00.000Z'
  },
  {
    id: 'demo-internet',
    contractId: 'TEL-2024-001',
    name: 'Fiber Internet 1Gbps',
    company: 'Deutsche Telekom AG',
    description: 'High-speed fiber internet connection with unlimited data and included TV package',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    amount: 59.99,
    currency: 'EUR',
    frequency: 'monthly',
    status: 'active',
    category: 'utilities',
    payDate: '2024-12-01',
    contactInfo: {
      email: 'service@telekom.de',
      phone: '+49-800-3301000',
      website: 'https://telekom.de',
      address: 'Friedrich-Ebert-Allee 140, 53113 Bonn, Germany'
    },
    notes: '1Gbps fiber connection with unlimited data. Includes basic TV package with 100+ channels.',
    tags: ['internet', 'fiber', 'TV'],
    customFields: {
      'Connection Type': 'Fiber',
      'Speed': '1Gbps',
      'Data Limit': 'Unlimited',
      'TV Channels': '100+'
    },
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-09-15T10:00:00.000Z'
  }
];

// Demo data service that mimics the real API
export const demoApi = {
  async getContracts(search?: string, status?: string): Promise<Contract[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredContracts = [...demoContracts];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContracts = filteredContracts.filter(contract =>
        contract.name.toLowerCase().includes(searchLower) ||
        contract.company.toLowerCase().includes(searchLower) ||
        contract.reference?.toLowerCase().includes(searchLower) ||
        contract.contractId.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      filteredContracts = filteredContracts.filter(contract => contract.status === status);
    }
    
    return filteredContracts;
  },

  async getContract(id: string): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const contract = demoContracts.find(c => c.id === id);
    if (!contract) {
      throw new Error('Contract not found');
    }
    return contract;
  },

  async createContract(data: any): Promise<{ contract: Contract; created: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newContract: Contract = {
      ...data,
      id: `demo-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to in-memory demo contracts (not persisted)
    demoContracts.push(newContract);
    
    return { contract: newContract, created: true };
  },

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = demoContracts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }
    
    const updatedContract = {
      ...demoContracts[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    demoContracts[index] = updatedContract;
    return updatedContract;
  },

  async deleteContract(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = demoContracts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contract not found');
    }
    demoContracts.splice(index, 1);
  },

  async getDataInfo(): Promise<{ dataDir: string; contractsDir: string; contractCount: number; fileStructure: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      dataDir: '/demo/data',
      contractsDir: '/demo/contracts',
      contractCount: demoContracts.length,
      fileStructure: 'Demo Mode - Using sample contracts'
    };
  },

  async getFileStats(): Promise<{ totalFiles: number; totalSize: number; averageSize: number }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      totalFiles: demoContracts.length,
      totalSize: 0,
      averageSize: 0
    };
  },

  async exportContracts(): Promise<Contract[]> {
    return demoContracts;
  },

  async exportContractToMarkdown(id: string): Promise<void> {
    const contract = await this.getContract(id);
    const markdown = `# ${contract.name}

**Company:** ${contract.company}
**Category:** ${contract.category}
**Status:** ${contract.status}
**Amount:** ${contract.amount} ${contract.currency}
**Frequency:** ${contract.frequency}
**Start Date:** ${contract.startDate}
**End Date:** ${contract.endDate || 'N/A'}
**Pay Date:** ${contract.payDate || 'N/A'}
**Reference:** ${contract.reference || 'N/A'}

## Notes
${contract.notes || 'No notes available'}

---
*Generated on ${new Date().toLocaleDateString()}*`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async importContracts(contracts: Contract[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    for (const contract of contracts) {
      const { id, createdAt, updatedAt, ...contractData } = contract;
      await this.createContract(contractData);
    }
  }
};
