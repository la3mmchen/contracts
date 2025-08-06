import { useState, useMemo } from 'react';
import { Contract, ContractFilters } from '@/types/contract';
import { appConfig } from '@/config/app';
import { useContractStorage } from '@/hooks/useContractStorage';
import { ContractCard } from '@/components/ContractCard';
import { ContractForm } from '@/components/ContractForm';
import { ContractFilters as FilterComponent } from '@/components/ContractFilters';
import { ContractStats } from '@/components/ContractStats';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Upload, Download, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { contracts, loading, addContract, updateContract, deleteContract, exportContracts, importContracts } = useContractStorage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<ContractFilters>({
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const filteredAndSortedContracts = useMemo(() => {
    let filtered = contracts;

    // Apply filters
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.name.toLowerCase().includes(searchLower) ||
        contract.company.toLowerCase().includes(searchLower) ||
        contract.contractId.toLowerCase().includes(searchLower) ||
        contract.description?.toLowerCase().includes(searchLower) ||
        contract.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(contract => contract.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(contract => contract.category === filters.category);
    }

    if (filters.frequency) {
      filtered = filtered.filter(contract => contract.frequency === filters.frequency);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const direction = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'nextPaymentDate': {
          const aDate = a.paymentInfo.nextPaymentDate ? new Date(a.paymentInfo.nextPaymentDate).getTime() : 0;
          const bDate = b.paymentInfo.nextPaymentDate ? new Date(b.paymentInfo.nextPaymentDate).getTime() : 0;
          return direction * (aDate - bDate);
        }
        case 'createdAt':
          return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        default:
          return 0;
      }
    });

    return filtered;
  }, [contracts, filters]);

  const handleAddContract = async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await addContract(contractData);
      // Only close the form if the contract was actually created
      if (result.created) {
        setIsFormOpen(false);
      }
    } catch (error) {
      // Form stays open on error
      console.error('Error adding contract:', error);
    }
  };

  const handleEditContract = (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingContract) {
      updateContract(editingContract.id, contractData);
      setEditingContract(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteContract = () => {
    if (deleteConfirmId) {
      deleteContract(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importContracts(file);
      event.target.value = ''; // Reset input
    }
  };

  const openEditForm = (contract: Contract) => {
    setEditingContract(contract);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingContract(undefined);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{appConfig.name}</h1>
              <p className="text-white/80 mt-1">Manage your contracts efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={exportContracts}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/30 hover:border-white/40 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddForm} className="bg-white text-primary hover:bg-white/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContract ? 'Edit Contract' : 'Add New Contract'}
                    </DialogTitle>
                  </DialogHeader>
                  <ContractForm
                    contract={editingContract}
                    onSubmit={editingContract ? handleEditContract : handleAddContract}
                    onCancel={() => setIsFormOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Connection Status */}
        <ConnectionStatus onStatusChange={setApiConnected} />

        {/* Statistics */}
        <ContractStats contracts={contracts} />

        {/* Filters */}
        <FilterComponent filters={filters} onFiltersChange={setFilters} />

        {/* API Connection Warning */}
        {apiConnected === false && contracts.length > 0 && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Connection Issue</AlertTitle>
              <AlertDescription>
                The application cannot connect to the API server, but contracts are still being displayed. 
                This may indicate cached data or a connection problem. Please check your API connection.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Contracts Grid */}
        <div className="mt-8">
          {filteredAndSortedContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {contracts.length === 0 ? 'No contracts yet' : 'No contracts match your filters'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {contracts.length === 0 
                  ? 'Get started by adding your first contract'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {contracts.length === 0 && (
                <Button 
                  onClick={openAddForm} 
                  className="text-white hover:bg-gradient-primary/90 [&]:text-white"
                  style={{ 
                    color: 'white',
                    background: 'linear-gradient(135deg, #42929D, #3a7bc8)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contract
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedContracts.map((contract, index) => (
                <div key={contract.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContractCard
                    contract={contract}
                    onEdit={openEditForm}
                    onDelete={(id) => setDeleteConfirmId(id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContract} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;