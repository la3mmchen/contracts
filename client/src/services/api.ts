import { Contract, CreateContractRequest } from '../types/contract';
import { loadConfig } from './config';

let API_BASE = 'http://localhost:3001/api'; // Default fallback
let configLoaded = false;

// Initialize API base URL
loadConfig().then(config => {
  API_BASE = config.API_URL;
  configLoaded = true;
}).catch(() => {
  // Keep default if config fails to load
  configLoaded = true;
});

// Helper function to ensure config is loaded
const ensureConfigLoaded = async () => {
  if (!configLoaded) {
    try {
      const config = await loadConfig();
      API_BASE = config.API_URL;
    } catch (error) {
      console.warn('Failed to load config, using default API URL');
    }
    configLoaded = true;
  }
};

export const api = {
  async checkApiHealth(): Promise<{ status: 'ok' | 'error'; message?: string; details?: unknown }> {
    await ensureConfigLoaded();
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return {
          status: 'error',
          message: `API responded with status ${response.status}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
      
      const data = await response.json();
      return {
        status: 'ok',
        message: 'API is healthy',
        details: data
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to connect to API',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  },

  async getContracts(search?: string, status?: string): Promise<Contract[]> {
    await ensureConfigLoaded();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE}/contracts?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch contracts');
    return response.json();
  },

  async getContract(id: string): Promise<Contract> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch contract');
    return response.json();
  },

  async createContract(data: CreateContractRequest): Promise<{ contract: Contract; created: boolean }> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create contract');
    return response.json();
  },

  async updateContract(id: string, data: Partial<CreateContractRequest>): Promise<Contract> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update contract');
    return response.json();
  },

  async deleteContract(id: string): Promise<void> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete contract');
  },

  async getDataInfo(): Promise<{ dataDir: string; contractsDir: string; contractCount: number; fileStructure: string }> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts/info/data`);
    if (!response.ok) throw new Error('Failed to get data info');
    return response.json();
  },

  async getFileStats(): Promise<{ totalFiles: number; totalSize: number; averageSize: number }> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/contracts/info/stats`);
    if (!response.ok) throw new Error('Failed to get file stats');
    return response.json();
  },

  async exportContracts(): Promise<Contract[]> {
    return await this.getContracts();
  },

  async importContracts(contracts: Contract[]): Promise<void> {
    // For import, we'll need to create each contract individually
    for (const contract of contracts) {
      const { id, createdAt, updatedAt, ...contractData } = contract;
      await this.createContract(contractData);
    }
  },
}; 