import { Contract, CreateContractRequest } from '../types/contract';
import { api } from './api';
import { demoApi } from './demoData';

// Smart API service that automatically falls back to demo data
export class SmartApiService {
  private isApiAvailable: boolean | null = null;
  private lastApiCheck: number = 0;
  private readonly API_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private async checkApiAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Cache the result for 5 minutes to avoid constant checking
    if (this.isApiAvailable !== null && (now - this.lastApiCheck) < this.API_CHECK_INTERVAL) {
      return this.isApiAvailable;
    }

    try {
      const healthCheck = await api.checkApiHealth();
      this.isApiAvailable = healthCheck.status === 'ok';
      this.lastApiCheck = now;
      return this.isApiAvailable;
    } catch (error) {
      console.warn('API health check failed, falling back to demo mode:', error);
      this.isApiAvailable = false;
      this.lastApiCheck = now;
      return false;
    }
  }

  private async getActiveApi() {
    const apiAvailable = await this.checkApiAvailability();
    return apiAvailable ? api : demoApi;
  }

  // Contract operations
  async getContracts(search?: string, status?: string): Promise<Contract[]> {
    const activeApi = await this.getActiveApi();
    return activeApi.getContracts(search, status);
  }

  async getContract(id: string): Promise<Contract> {
    const activeApi = await this.getActiveApi();
    return activeApi.getContract(id);
  }

  async createContract(data: CreateContractRequest): Promise<{ contract: Contract; created: boolean }> {
    const activeApi = await this.getActiveApi();
    return activeApi.createContract(data);
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    const activeApi = await this.getActiveApi();
    return activeApi.updateContract(id, data);
  }

  async deleteContract(id: string): Promise<void> {
    const activeApi = await this.getActiveApi();
    return activeApi.deleteContract(id);
  }

  // Data info operations
  async getDataInfo(): Promise<{ dataDir: string; contractsDir: string; contractCount: number; fileStructure: string }> {
    const activeApi = await this.getActiveApi();
    return activeApi.getDataInfo();
  }

  async getFileStats(): Promise<{ totalFiles: number; totalSize: number; averageSize: number }> {
    const activeApi = await this.getActiveApi();
    return activeApi.getFileStats();
  }

  // Export operations
  async exportContracts(): Promise<Contract[]> {
    const activeApi = await this.getActiveApi();
    return activeApi.exportContracts();
  }

  async exportContractToMarkdown(id: string): Promise<void> {
    const activeApi = await this.getActiveApi();
    return activeApi.exportContractToMarkdown(id);
  }

  // Import operations
  async importContracts(contracts: Contract[]): Promise<void> {
    const activeApi = await this.getActiveApi();
    return activeApi.importContracts(contracts);
  }

  // Utility methods
  async isDemoMode(): Promise<boolean> {
    return !(await this.checkApiAvailability());
  }

  async getApiStatus(): Promise<{ available: boolean; mode: 'live' | 'demo' }> {
    const available = await this.checkApiAvailability();
    return {
      available,
      mode: available ? 'live' : 'demo'
    };
  }

  // Force refresh API availability check
  async refreshApiStatus(): Promise<boolean> {
    this.isApiAvailable = null;
    this.lastApiCheck = 0;
    return await this.checkApiAvailability();
  }

  // Health check method for API availability
  async checkApiHealth(): Promise<{ status: 'ok' | 'error'; message?: string; details?: unknown }> {
    try {
      const healthCheck = await api.checkApiHealth();
      this.isApiAvailable = healthCheck.status === 'ok';
      this.lastApiCheck = Date.now();
      return healthCheck;
    } catch (error) {
      console.warn('API health check failed, falling back to demo mode:', error);
      this.isApiAvailable = false;
      this.lastApiCheck = Date.now();
      // Return error status for demo mode detection
      return {
        status: 'error',
        message: 'API server not available - using demo mode',
        details: { mode: 'demo', error: error instanceof Error ? error.message : 'Network error' }
      };
    }
  }
}

// Export singleton instance
export const smartApi = new SmartApiService();
