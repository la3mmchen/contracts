import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { Contract, CreateContractRequest, UpdateContractRequest } from '../types/contract';

class ContractService {
  private dataDir: string;
  private contractsDir: string;

  constructor() {
    // Get data directory from environment variable, default to ./data
    this.dataDir = process.env.CONTRACTS_DATA_DIR || path.join(process.cwd(), 'data');
    this.contractsDir = path.join(this.dataDir, 'contracts');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.contractsDir);
    } catch {
      await fs.mkdir(this.contractsDir, { recursive: true });
      console.log(`Created contracts directory: ${this.contractsDir}`);
    }
  }

  private getContractFilePath(id: string): string {
    return path.join(this.contractsDir, `${id}.json`);
  }

  private async loadContractFromFile(id: string): Promise<Contract | null> {
    try {
      const filePath = this.getContractFilePath(id);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private async saveContractToFile(contract: Contract): Promise<void> {
    await this.ensureDataDirectory();
    const filePath = this.getContractFilePath(contract.id);
    
    const jsonData = JSON.stringify(contract, null, 2);
    
    await fs.writeFile(filePath, jsonData);
  }

  private async deleteContractFile(id: string): Promise<void> {
    try {
      const filePath = this.getContractFilePath(id);
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  }

  private async getAllContractFiles(): Promise<string[]> {
    try {
      await this.ensureDataDirectory();
      const files = await fs.readdir(this.contractsDir);
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      return [];
    }
  }

  async getAllContracts(): Promise<Contract[]> {
    try {
      const files = await this.getAllContractFiles();
      const contracts: Contract[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.contractsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const contract = JSON.parse(data);
          contracts.push(contract);
        } catch (error) {
          console.warn(`Failed to load contract from ${file}:`, error);
        }
      }

      // Sort by pinned status first, then by creation date (newest first)
      return contracts.sort((a, b) => {
        // Pinned contracts always come first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        // If both have same pinned status, sort by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error loading contracts:', error);
      return [];
    }
  }

  async getContractById(id: string): Promise<Contract | null> {
    return await this.loadContractFromFile(id);
  }

  async createContract(data: CreateContractRequest): Promise<{ contract: Contract; created: boolean }> {
    // Check for existing contract with same contract ID
    const existingContracts = await this.getAllContracts();
    const existingContractById = existingContracts.find(
      contract => contract.contractId === data.contractId
    );

    if (existingContractById) {
      console.log(`Contract with ID already exists: ${data.contractId} (${existingContractById.id})`);
      return { contract: existingContractById, created: false };
    }

    // Check for duplicate name + company combination (for all contracts)
    if (data.company) {
      const existingContract = existingContracts.find(
        contract => contract.name === data.name && contract.company === data.company
      );

      if (existingContract) {
        console.log(`Contract already exists: ${data.name} (${existingContract.id})`);
        return { contract: existingContract, created: false };
      }
    }

    const now = new Date().toISOString();
    
    // Provide default values for required fields if they're missing
    const contract: Contract = {
      id: uuidv4(),
      contractId: data.contractId,
      name: data.name,
      company: data.company || 'Unknown Company',
      description: data.description,
      startDate: data.startDate || now,
      endDate: data.endDate,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      frequency: data.frequency || 'monthly',
      status: data.status || 'active',
      category: data.category || 'other',
      payDate: data.payDate,
      contactInfo: data.contactInfo || {},
      notes: data.notes,
      tags: data.tags,
      needsMoreInfo: data.needsMoreInfo,
      pinned: data.pinned,
      draft: data.draft,
      priceChanges: data.priceChanges,
      attachments: [],
      documentLink: undefined,
      createdAt: now,
      updatedAt: now,
    };

    await this.saveContractToFile(contract);
    console.log(`Created contract: ${contract.name} (${contract.id})`);
    return { contract, created: true };
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract | null> {
    const existingContract = await this.loadContractFromFile(id);
    if (!existingContract) {
      return null;
    }

    const updatedContract = {
      ...existingContract,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Remove fields that are explicitly set to null (for migration cleanup)
    Object.keys(updatedContract).forEach(key => {
      if (updatedContract[key as keyof Contract] === null) {
        delete updatedContract[key as keyof Contract];
      }
    });

    await this.saveContractToFile(updatedContract);
    console.log(`Updated contract: ${updatedContract.name} (${id})`);
    
    return updatedContract;
  }

  async deleteContract(id: string): Promise<boolean> {
    const existingContract = await this.loadContractFromFile(id);
    if (!existingContract) {
      return false;
    }

    await this.deleteContractFile(id);
    console.log(`Deleted contract: ${existingContract.name} (${id})`);
    return true;
  }

  async searchContracts(query: string): Promise<Contract[]> {
    const contracts = await this.getAllContracts();
    
    const searchTerm = query.toLowerCase();
    return contracts.filter(contract => 
      contract.name.toLowerCase().includes(searchTerm) ||
      (contract.company && contract.company.toLowerCase().includes(searchTerm)) ||
      contract.contractId.toLowerCase().includes(searchTerm) ||
      (contract.description && contract.description.toLowerCase().includes(searchTerm)) ||
      (contract.tags && contract.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
      (contract.notes && contract.notes.toLowerCase().includes(searchTerm)) ||
      (contract.customFields && Object.values(contract.customFields).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchTerm)
      )) ||
      (contract.documentLink && contract.documentLink.toLowerCase().includes(searchTerm))
    );
  }

  async getContractsByStatus(status: Contract['status']): Promise<Contract[]> {
    const contracts = await this.getAllContracts();
    return contracts.filter(contract => contract.status === status);
  }

  async getDataInfo(): Promise<{ dataDir: string; contractsDir: string; contractCount: number; fileStructure: string }> {
    const contracts = await this.getAllContracts();
    const files = await this.getAllContractFiles();
    
    return {
      dataDir: this.dataDir,
      contractsDir: this.contractsDir,
      contractCount: contracts.length,
      fileStructure: `Individual JSON files (${files.length} files)`
    };
  }

  async exportAllContracts(): Promise<Contract[]> {
    return await this.getAllContracts();
  }

  async importContracts(contracts: Contract[]): Promise<void> {
    for (const contract of contracts) {
      const { id, createdAt, updatedAt, ...contractData } = contract;
      await this.createContract(contractData);
    }
  }

  async getContractStats(): Promise<{ totalFiles: number; totalSize: number; averageSize: number }> {
    const files = await this.getAllContractFiles();
    let totalSize = 0;
    let fileCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(this.contractsDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        fileCount++;
      } catch (error) {
        console.warn(`Failed to get stats for ${file}:`, error);
      }
    }

    return {
      totalFiles: fileCount,
      totalSize,
      averageSize: fileCount > 0 ? Math.round(totalSize / fileCount) : 0
    };
  }

  async exportToMarkdown(contracts: Contract[]): Promise<string> {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    let markdown = `# Contracts Export\n\n`;
    markdown += `**Generated:** ${date} at ${time}\n\n`;
    markdown += `**Total Contracts:** ${contracts.length}\n\n`;
    markdown += `---\n\n`;

    // Group contracts by status
    const contractsByStatus = contracts.reduce((acc, contract) => {
      const status = contract.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(contract);
      return acc;
    }, {} as Record<string, Contract[]>);

    // Export contracts grouped by status
    for (const [status, statusContracts] of Object.entries(contractsByStatus)) {
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
      markdown += `## ${statusDisplay} Contracts (${statusContracts.length})\n\n`;

      for (const contract of statusContracts) {
        markdown += `### ${contract.name}\n\n`;
        markdown += `**Contract ID:** ${contract.contractId}\n\n`;
        markdown += `**Company:** ${contract.company}\n\n`;
        markdown += `**Status:** ${contract.status}\n\n`;
        markdown += `**Category:** ${contract.category}\n\n`;
        markdown += `**Amount:** ${contract.currency} ${contract.amount.toFixed(2)}\n\n`;
        markdown += `**Frequency:** ${contract.frequency}\n\n`;
        markdown += `**Start Date:** ${contract.startDate}\n\n`;
        
        if (contract.endDate) {
          markdown += `**End Date:** ${contract.endDate}\n\n`;
        }
        
        if (contract.payDate) {
          markdown += `**Pay Date:** ${contract.payDate}\n\n`;
        }
        
        if (contract.description) {
          markdown += `**Description:** ${contract.description}\n\n`;
        }

        if (contract.contactInfo) {
          markdown += `**Contact Information:**\n`;
          if (contract.contactInfo.email) {
            markdown += `- Email: ${contract.contactInfo.email}\n`;
          }
          if (contract.contactInfo.phone) {
            markdown += `- Phone: ${contract.contactInfo.phone}\n`;
          }
          if (contract.contactInfo.website) {
            markdown += `- Website: ${contract.contactInfo.website}\n`;
          }
          if (contract.contactInfo.address) {
            markdown += `- Address: ${contract.contactInfo.address}\n`;
          }
          if (contract.contactInfo.contactPerson) {
            markdown += `- Contact Person: ${contract.contactInfo.contactPerson}\n`;
          }
          markdown += `\n`;
        }

        if (contract.tags && contract.tags.length > 0) {
          markdown += `**Tags:** ${contract.tags.join(', ')}\n\n`;
        }

        if (contract.notes) {
          markdown += `**Notes:** ${contract.notes}\n\n`;
        }

        if (contract.documentLink) {
          markdown += `**Document Link:** ${contract.documentLink}\n\n`;
        }

        markdown += `**Created:** ${contract.createdAt}\n\n`;
        markdown += `**Last Updated:** ${contract.updatedAt}\n\n`;
        markdown += `---\n\n`;
      }
    }

    // Add summary at the end
    markdown += `## Summary\n\n`;
    markdown += `| Status | Count |\n`;
    markdown += `|--------|-------|\n`;
    
    for (const [status, statusContracts] of Object.entries(contractsByStatus)) {
      const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
      markdown += `| ${statusDisplay} | ${statusContracts.length} |\n`;
    }

    markdown += `\n**Total Value:** ${contracts.reduce((sum, contract) => sum + contract.amount, 0).toFixed(2)}\n\n`;
    markdown += `**Export completed successfully.**\n`;

    return markdown;
  }

  async exportContractsToSeparateFiles(contracts: Contract[]): Promise<Array<{ filename: string; content: string }>> {
    const exportResults: Array<{ filename: string; content: string }> = [];
    
    for (const contract of contracts) {
      const markdown = this.generateSingleContractMarkdown(contract);
      const filename = `${contract.contractId}.md`;
      exportResults.push({ filename, content: markdown });
    }
    
    return exportResults;
  }

  public generateSingleContractMarkdown(contract: Contract): string {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    let markdown = `# ${contract.name}\n\n`;
    markdown += `**Generated:** ${date} at ${time}\n\n`;
    markdown += `---\n\n`;
    
    markdown += `**Contract ID:** ${contract.contractId}\n\n`;
    markdown += `**Company:** ${contract.company}\n\n`;
    markdown += `**Status:** ${contract.status}\n\n`;
    markdown += `**Category:** ${contract.category}\n\n`;
    markdown += `**Amount:** ${contract.currency} ${contract.amount.toFixed(2)}\n\n`;
    markdown += `**Frequency:** ${contract.frequency}\n\n`;
    markdown += `**Start Date:** ${contract.startDate}\n\n`;
    
    if (contract.endDate) {
      markdown += `**End Date:** ${contract.endDate}\n\n`;
    }
    
    if (contract.payDate) {
      markdown += `**Pay Date:** ${contract.payDate}\n\n`;
    }
    
    if (contract.description) {
      markdown += `**Description:** ${contract.description}\n\n`;
    }

    if (contract.contactInfo) {
      markdown += `**Contact Information:**\n`;
      if (contract.contactInfo.email) {
        markdown += `- Email: ${contract.contactInfo.email}\n`;
      }
      if (contract.contactInfo.phone) {
        markdown += `- Phone: ${contract.contactInfo.phone}\n`;
      }
      if (contract.contactInfo.website) {
        markdown += `- Website: ${contract.contactInfo.website}\n`;
      }
      if (contract.contactInfo.address) {
        markdown += `- Address: ${contract.contactInfo.address}\n`;
      }
      if (contract.contactInfo.contactPerson) {
        markdown += `- Contact Person: ${contract.contactInfo.contactPerson}\n`;
      }
      markdown += `\n`;
    }

    if (contract.tags && contract.tags.length > 0) {
      markdown += `**Tags:** ${contract.tags.join(', ')}\n\n`;
    }

    if (contract.notes) {
      markdown += `**Notes:** ${contract.notes}\n\n`;
    }

    if (contract.documentLink) {
      markdown += `**Document Link:** ${contract.documentLink}\n\n`;
    }

    // Add price changes if they exist
    if (contract.priceChanges && contract.priceChanges.length > 0) {
      markdown += `**Price Changes:**\n\n`;
      for (const change of contract.priceChanges) {
        markdown += `- **${change.effectiveDate}**: ${contract.currency} ${change.previousAmount.toFixed(2)} → ${contract.currency} ${change.newAmount.toFixed(2)}\n`;
        if (change.reason) {
          markdown += `  - Reason: ${change.reason}\n`;
        }
        markdown += `\n`;
      }
    }

    markdown += `**Created:** ${contract.createdAt}\n\n`;
    markdown += `**Last Updated:** ${contract.updatedAt}\n\n`;

    return markdown;
  }

  async createExportZip(exportResults: Array<{ filename: string; content: string }>): Promise<Buffer> {
    const zip = new JSZip();
    
    // Add each contract as a separate markdown file
    for (const result of exportResults) {
      zip.file(result.filename, result.content);
    }
    
    // Add a README file with export information
    const readmeContent = `# Contracts Export

**Generated:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
**Total Contracts:** ${exportResults.length}

## Files Included

${exportResults.map(result => `- \`${result.filename}\` - ${result.filename.replace('.md', '')}`).join('\n')}

## Usage

Each markdown file contains the complete information for one contract.
Open any .md file in your preferred markdown viewer or editor.

## Export Details

- Export Date: ${new Date().toISOString().split('T')[0]}
- Total Contracts: ${exportResults.length}
- Format: Individual Markdown Files
`;
    
    zip.file('README.md', readmeContent);
    
    // Generate the zip file as a buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    return zipBuffer;
  }
}

export const contractService = new ContractService(); 