import { useState, useEffect } from 'react';
import { Contract, ContractStats } from '@/types/contract';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { migrateContract, needsMigration } from '@/lib/contractMigration';

export const useContractStorage = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Load contracts from API on component mount
  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await api.getContracts();
      
      // Migrate legacy contracts if needed and save them back to the API
      const migratedContracts = [];
      const contractsToUpdate = [];
      
      for (const contract of data) {
        if (needsMigration(contract)) {
          const result = migrateContract(contract);
          if (result.wasMigrated) {
            console.log(`Migrated contract ${contract.contractId}:`, result.migrationNotes);
            contractsToUpdate.push(result.contract);
          }
          migratedContracts.push(result.contract);
        } else {
          migratedContracts.push(contract);
        }
      }
      
      // Save migrated contracts back to the API
      if (contractsToUpdate.length > 0) {
        console.log(`Saving ${contractsToUpdate.length} migrated contracts back to API...`);
        for (const contract of contractsToUpdate) {
          try {
            const { id, createdAt, updatedAt, ...updateData } = contract;
            // Create a clean update data object without legacy fields
            const cleanUpdateData = { ...updateData };
            // Explicitly mark legacy fields for removal by setting them to null
            (cleanUpdateData as any).paymentInfo = null;
            
            await api.updateContract(id, cleanUpdateData);
          } catch (updateError) {
            console.error(`Failed to save migrated contract ${contract.contractId}:`, updateError);
          }
        }
        console.log('Migration complete - contracts saved to disk');
      }
      
      setContracts(migratedContracts);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: "Error loading contracts",
        description: "There was an issue loading your contracts from the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContract = async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await api.createContract(contract);
      
      if (result.created) {
        // New contract was created
        setContracts(prev => [...prev, result.contract]);
        toast({
          title: "Contract added",
          description: `${contract.name} has been added successfully.`,
        });
      } else {
        // Contract already existed
        toast({
          title: "Contract already exists",
          description: `${contract.name} already exists in your contracts.`,
          variant: "default",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error adding contract:', error);
      toast({
        title: "Error adding contract",
        description: "There was an issue adding your contract.",
        variant: "destructive",
      });
      throw error;
    }
  };

      const updateContract = async (id: string, updates: Partial<Contract>) => {
      try {
        const updatedContract = await api.updateContract(id, updates);

        setContracts(prev => prev.map(contract =>
          contract.id === id ? updatedContract : contract
        ));

        toast({
          title: "Contract updated",
          description: "Contract has been updated successfully.",
        });
      } catch (error) {
        console.error('Error updating contract:', error);
        toast({
          title: "Error updating contract",
          description: "There was an issue updating your contract.",
          variant: "destructive",
        });
        throw error;
      }
    };

  const deleteContract = async (id: string) => {
    try {
      const contractToDelete = contracts.find(c => c.id === id);
      await api.deleteContract(id);
      setContracts(prev => prev.filter(contract => contract.id !== id));
      
      toast({
        title: "Contract deleted",
        description: `${contractToDelete?.name || 'Contract'} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error deleting contract",
        description: "There was an issue deleting your contract.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const exportContracts = async () => {
    try {
      const dataStr = JSON.stringify(contracts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `contracts-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast({
        title: "Export successful",
        description: `${contracts.length} contracts have been exported.`,
      });
    } catch (error) {
      console.error('Error exporting contracts:', error);
      toast({
        title: "Export failed",
        description: "There was an issue exporting your contracts.",
        variant: "destructive",
      });
    }
  };

  const importContracts = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedContracts = JSON.parse(content);
        
        if (!Array.isArray(importedContracts)) {
          throw new Error('Invalid file format');
        }
        
        // Migrate imported contracts if needed
        const migratedContracts = importedContracts.map((contract: any) => {
          if (needsMigration(contract)) {
            const result = migrateContract(contract);
            if (result.wasMigrated) {
              console.log(`Migrated imported contract ${contract.contractId}:`, result.migrationNotes);
            }
            return result.contract;
          }
          return contract;
        });
        
        // Import contracts one by one
        for (const contract of migratedContracts) {
          const { id, createdAt, updatedAt, ...contractData } = contract;
          await api.createContract(contractData);
        }
        
        // Reload contracts
        await loadContracts();
        
        toast({
          title: "Import successful",
          description: `${importedContracts.length} contracts have been imported successfully.`,
        });
      } catch (error) {
        console.error('Error importing contracts:', error);
        toast({
          title: "Import failed",
          description: "The file format is invalid or corrupted.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const getContractStats = (): ContractStats => {
    const now = new Date();

    const stats = contracts.reduce((acc, contract) => {
      // Count by status
      acc.statusBreakdown[contract.status] = (acc.statusBreakdown[contract.status] || 0) + 1;
      
      // Count by category
      acc.categoryBreakdown[contract.category] = (acc.categoryBreakdown[contract.category] || 0) + 1;
      
      // Total contracts
      acc.totalContracts++;
      
      // Active contracts
      if (contract.status === 'active') {
        acc.activeContracts++;
      }
      
      // Expired contracts
      if (contract.status === 'expired') {
        acc.expiredContracts++;
      }
      
      // Total value
      acc.totalValue += contract.amount;
      
      // Monthly expenses (only for active contracts)
      if (contract.status === 'active') {
        switch (contract.frequency) {
          case 'monthly':
            acc.monthlyExpenses += contract.amount;
            break;
          case 'quarterly':
            acc.monthlyExpenses += contract.amount / 3;
            break;
          case 'yearly':
            acc.monthlyExpenses += contract.amount / 12;
            break;
          case 'weekly':
            acc.monthlyExpenses += contract.amount * 4.33;
            break;
          case 'bi-weekly':
            acc.monthlyExpenses += contract.amount * 2.17;
            break;
        }
      }
      
      // Upcoming payments (next 30 days) - using new payDate field
      if (contract.payDate) {
        const nextPayment = new Date(contract.payDate);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        if (nextPayment <= thirtyDaysFromNow && contract.status === 'active') {
          acc.upcomingPayments++;
        }
      }
      
      return acc;
    }, {
      totalContracts: 0,
      activeContracts: 0,
      totalValue: 0,
      monthlyExpenses: 0,
      upcomingPayments: 0,
      expiredContracts: 0,
      categoryBreakdown: {} as Record<string, number>,
      statusBreakdown: {} as Record<string, number>,
    });

    return stats;
  };

  return {
    contracts,
    loading,
    addContract,
    updateContract,
    deleteContract,
    exportContracts,
    importContracts,
    getContractStats,
  };
};