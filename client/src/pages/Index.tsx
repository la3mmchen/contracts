import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Contract, ContractFilters as FilterType } from '@/types/contract';
import { useContractStorage } from '@/hooks/useContractStorage';
import { ContractCard } from '@/components/ContractCard';
import { ContractForm } from '@/components/ContractForm';

import { ContractStats } from '@/components/ContractStats';
import { NotificationBanner } from '@/components/NotificationBanner';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Plus, 
  Download, 
  Upload, 
  Loader2,
  FileText,
  AlertTriangle,
  Search
} from 'lucide-react';
import { appConfig } from '@/config/app';
import { calculateNextThreePayments } from '@/lib/paymentCalculator';
import { isValidCategory } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    contracts, 
    loading, 
    addContract, 
    updateContract, 
    deleteContract, 
    importContracts,
    exportContracts 
  } = useContractStorage();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | undefined>();
  const [isCopying, setIsCopying] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'asc'
  });

  // Apply URL parameters to filters on component mount
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const tagsParam = searchParams.get('tags');
    
    if (statusParam || categoryParam || tagsParam) {
      setFilters(prev => ({
        ...prev,
        ...(statusParam && { status: statusParam as Contract['status'] }),
        ...(categoryParam && { category: categoryParam as Contract['category'] }),
        ...(tagsParam && { tags: [tagsParam] })
      }));
      
      // Clear URL parameters after applying them
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Extract all available tags from contracts
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contracts.forEach(contract => {
      contract.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [contracts]);



  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    // Apply search filter
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

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(contract => contract.status === filters.status);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(contract => contract.category === filters.category);
    }

    // Apply frequency filter
    if (filters.frequency) {
      filtered = filtered.filter(contract => contract.frequency === filters.frequency);
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(contract => 
        contract.tags && contract.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // Apply needsMoreInfo filter (now includes draft contracts)
    if (filters.needsMoreInfo !== undefined) {
      if (filters.needsMoreInfo === false) {
        // "Complete" should show contracts where needsMoreInfo is false OR null/undefined AND not draft
        filtered = filtered.filter(contract => !contract.needsMoreInfo && !contract.draft);
      } else {
        // "Needs Attention" should show contracts where needsMoreInfo is true OR draft is true
        filtered = filtered.filter(contract => contract.needsMoreInfo === true || contract.draft === true);
      }
    }

    // Apply pinned filter
    if (filters.pinned !== undefined) {
      filtered = filtered.filter(contract => contract.pinned === filters.pinned);
    }

    // Apply sorting
    const direction = filters.sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      // Always prioritize pinned contracts first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // Then prioritize invalid categories (regardless of sort order)
      const aHasInvalidCategory = !isValidCategory(a.category);
      const bHasInvalidCategory = !isValidCategory(b.category);
      
      if (aHasInvalidCategory && !bHasInvalidCategory) return -1;
      if (!aHasInvalidCategory && bHasInvalidCategory) return 1;
      
      // If both have same validity status, apply normal sorting
      switch (filters.sortBy) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'nextPaymentDate': {
          const aPayments = calculateNextThreePayments(a);
          const bPayments = calculateNextThreePayments(b);
          const aDate = aPayments[0] ? new Date(aPayments[0].date).getTime() : 0;
          const bDate = bPayments[0] ? new Date(bPayments[0].date).getTime() : 0;
          return direction * (aDate - bDate);
        }
        case 'createdAt':
          return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'updatedAt':
          return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
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

  const handleEditContract = (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>, priceChangeReason?: string) => {
    if (editingContract) {
      // Check if amount changed and create price change entry
      let updatedData = { ...contractData };
      
      if (contractData.amount !== editingContract.amount) {
        // Create new price change entry
        const newPriceChange = {
          date: new Date().toISOString(),
          previousAmount: editingContract.amount,
          newAmount: contractData.amount,
          reason: priceChangeReason?.trim() || 'Amount updated via edit form',
          effectiveDate: new Date().toISOString()
        };
        
        // Add to existing price changes or create new array
        const updatedPriceChanges = [
          ...(editingContract.priceChanges || []),
          newPriceChange
        ];
        
        updatedData = {
          ...contractData,
          priceChanges: updatedPriceChanges
        };
      }
      
      updateContract(editingContract.id, updatedData);
      setEditingContract(undefined);
      setIsFormOpen(false);
    }
  };

  const handleCopyContract = (contract: Contract) => {
    // Create a copy of the contract with modified fields
    const contractCopy = {
      ...contract,
      contractId: `${contract.contractId}-copy`,
      name: `${contract.name} (Copy)`,
      startDate: new Date().toISOString().split('T')[0], // Today's date
      status: 'active' as const,
      pinned: false,
      draft: false,
      needsMoreInfo: false,
      // Remove fields that shouldn't be copied
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      priceChanges: [], // Start fresh with no price changes
    };
    
    // Remove the fields we don't want to copy
    const { id, createdAt, updatedAt, priceChanges, ...copyData } = contractCopy;
    
    // Open the form with the copied data
    setEditingContract(undefined); // Clear any existing edit
    setIsFormOpen(true);
    setIsFormDirty(false);
    setIsCopying(true);
    
    // Set the form data to the copied contract
    setEditingContract(copyData as any);
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
    setIsFormDirty(false);
  };

  const openAddForm = () => {
    setEditingContract(undefined);
    setIsFormOpen(true);
    setIsFormDirty(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && isFormDirty) {
      // User is trying to close but form has unsaved changes
      setShowUnsavedChangesDialog(true);
    } else {
      // Safe to close
      setIsFormOpen(open);
      if (!open) {
        setEditingContract(undefined);
        setIsFormDirty(false);
        setIsCopying(false);
      }
    }
  };

  const handleUnsavedChangesConfirm = () => {
    // User confirmed they want to discard changes
    setShowUnsavedChangesDialog(false);
    setIsFormOpen(false);
    setEditingContract(undefined);
    setIsFormDirty(false);
  };

  const handleUnsavedChangesCancel = () => {
    // User wants to keep editing
    setShowUnsavedChangesDialog(false);
  };

  const scrollToContract = (contract: Contract) => {
    const element = document.getElementById(`contract-${contract.id}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Add a temporary highlight effect
      element.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    }
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
      <div className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{appConfig.name}</h1>
              <p className="text-primary-foreground/80 mt-1 text-sm sm:text-base">Manage your contracts efficiently</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button
                variant="secondary"
                onClick={exportContracts}
                size="sm"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Export
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/30 hover:border-primary-foreground/40 transition-colors text-xs sm:text-sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Import
              </Button>
              <ThemeToggle />
              <Dialog open={isFormOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button onClick={openAddForm} size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs sm:text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContract && editingContract.id ? 'Edit Contract' : editingContract ? 'Copy Contract' : 'Add New Contract'}
                    </DialogTitle>
                  </DialogHeader>
                  <ContractForm
                    contract={editingContract}
                    isCopying={isCopying}
                    onSubmit={editingContract && editingContract.id ? handleEditContract : handleAddContract}
                    onCancel={() => handleDialogClose(false)}
                    onDirtyStateChange={setIsFormDirty}
                  />
                </DialogContent>
              </Dialog>

              {/* Unsaved Changes Confirmation Dialog */}
              <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                      You have unsaved changes in the form. Are you sure you want to close without saving? All changes will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleUnsavedChangesCancel}>
                      Continue Editing
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleUnsavedChangesConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Discard Changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Connection Status with Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <ConnectionStatus onStatusChange={setApiConnected} />
          
          {/* Search and Sort Fields */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 w-full"
              />
            </div>
            
            <Select value={filters.sortBy || 'name'} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="nextPaymentDate">Next Payment</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        <ContractStats 
          contracts={contracts} 
          onFilter={(filterType, value) => {
            if (filterType === 'status') {
              // If clicking the same status filter, reset it
              if (filters.status === value) {
                setFilters(prev => ({ ...prev, status: undefined, searchTerm: '' }));
              } else {
                // Clear search when applying a status filter
                setFilters(prev => ({ 
                  ...prev,
                  status: value as Contract['status'],
                  searchTerm: '' // Clear search when filtering
                }));
              }
            } else if (filterType === 'category') {
              // If clicking the same category filter, reset it
              if (filters.category === value) {
                setFilters(prev => ({ ...prev, category: undefined, searchTerm: '' }));
              } else {
                // Clear search when applying a category filter
                setFilters(prev => ({ 
                  ...prev,
                  category: value as Contract['category'],
                  searchTerm: '' // Clear search when filtering
                }));
              }
            } else if (filterType === 'tags') {
              // If clicking the same tag filter, reset it
              if (filters.tags?.includes(value)) {
                setFilters(prev => ({ ...prev, tags: undefined, searchTerm: '' }));
              } else {
                // Clear search when applying a tag filter
                setFilters(prev => ({ 
                  ...prev,
                  tags: [value],
                  searchTerm: '' // Clear search when filtering
                }));
              }
            } else if (filterType === 'needsMoreInfo') {
              // If clicking the same needsMoreInfo filter, reset it
              if (filters.needsMoreInfo === (value === 'true')) {
                setFilters(prev => ({ ...prev, needsMoreInfo: undefined, searchTerm: '' }));
              } else {
                // Clear search when applying a needsMoreInfo filter
                setFilters(prev => ({ 
                  ...prev,
                  needsMoreInfo: value === 'true',
                  searchTerm: '' // Clear search when filtering
                }));
              }
            } else if (filterType === 'pinned') {
              // If clicking the same pinned filter, reset it
              if (filters.pinned === (value === 'true')) {
                setFilters(prev => ({ ...prev, pinned: undefined, searchTerm: '' }));
              } else {
                // Clear search when applying a pinned filter
                setFilters(prev => ({ 
                  ...prev,
                  pinned: value === 'true',
                  searchTerm: '' // Clear search when filtering
                }));
              }
            } else if (filterType === 'invalidCategories') {
              // Filter to show only contracts with invalid categories
              const invalidCategoryContracts = contracts.filter(contract => !isValidCategory(contract.category));
              const invalidCategories = [...new Set(invalidCategoryContracts.map(c => c.category))];
              setFilters(prev => ({
                ...prev,
                searchTerm: invalidCategories.join(' '),
                status: undefined,
                category: undefined,
                frequency: undefined,
                tags: undefined,
                needsMoreInfo: undefined,
                pinned: undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              }));
            } else if (filterType === 'reset') {
              setFilters(prev => ({
                ...prev,
                searchTerm: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
              }));
            }
          }}
          activeFilters={{
            status: filters.status,
            category: filters.category,
            needsMoreInfo: filters.needsMoreInfo,
            pinned: filters.pinned
          }}
          filters={filters}
          onFiltersChange={(newFilters) => {
            // Clear search when any filter is applied through ContractFilters
            const hasFilterChanges = 
              newFilters.status !== filters.status ||
              newFilters.category !== filters.category ||
              newFilters.frequency !== filters.frequency ||
              newFilters.tags !== filters.tags ||
              newFilters.needsMoreInfo !== filters.needsMoreInfo ||
              newFilters.pinned !== filters.pinned;
            
            if (hasFilterChanges) {
              setFilters({ ...newFilters, searchTerm: '' });
            } else {
              setFilters(newFilters);
            }
          }}
          availableTags={availableTags}
        />

        {/* Notifications */}
        <NotificationBanner contracts={contracts} onEdit={scrollToContract} />

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

        {/* Invalid Categories Warning */}
        {(() => {
          const invalidCategoryContracts = contracts.filter(contract => !isValidCategory(contract.category));
          
          if (invalidCategoryContracts.length > 0) {
            return (
              <div className="mb-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Invalid Categories Detected</AlertTitle>
                  <AlertDescription>
                    You have {invalidCategoryContracts.length} contract{invalidCategoryContracts.length > 1 ? 's' : ''} with categories that are no longer available. These contracts are displayed at the top of the list and should be updated with valid categories:
                    <div className="mt-2 space-y-1">
                      {invalidCategoryContracts.slice(0, 3).map((contract) => (
                        <div key={contract.id} className="flex items-center justify-between text-sm">
                          <span 
                            className="cursor-pointer hover:text-primary hover:underline"
                            onClick={() => scrollToContract(contract)}
                          >
                            {contract.name}
                          </span>
                          <span className="font-mono text-xs">
                            {contract.contractId}
                          </span>
                        </div>
                      ))}
                      {invalidCategoryContracts.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {invalidCategoryContracts.length - 3} more
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            );
          }
          return null;
        })()}



        {/* Contracts Grid */}
        <div className="mt-8">
          {filteredContracts.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <FileText className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {contracts.length === 0 ? 'No contracts yet' : 'No contracts match your filters'}
              </h3>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredContracts.map((contract, index) => (
                <div key={contract.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContractCard
                    contract={contract}
                    onEdit={openEditForm}
                    onDelete={(id) => setDeleteConfirmId(id)}
                    onCopy={handleCopyContract}
                    onUpdate={updateContract}
                    onFilter={(filterType, value) => {
                      if (filterType === 'status') {
                        // If clicking the same status filter, reset it
                        if (filters.status === value) {
                          setFilters(prev => ({ ...prev, status: undefined, searchTerm: '' }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev,
                            status: value as Contract['status'],
                            searchTerm: '' // Clear search when filtering
                          }));
                        }
                      } else if (filterType === 'category') {
                        // If clicking the same category filter, reset it
                        if (filters.category === value) {
                          setFilters(prev => ({ ...prev, category: undefined, searchTerm: '' }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev,
                            category: value as Contract['category'],
                            searchTerm: '' // Clear search when filtering
                          }));
                        }
                      } else if (filterType === 'tags') {
                        // If clicking the same tag filter, reset it
                        if (filters.tags?.includes(value)) {
                          setFilters(prev => ({ ...prev, tags: undefined, searchTerm: '' }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev,
                            tags: [value],
                            searchTerm: '' // Clear search when filtering
                          }));
                        }
                      } else if (filterType === 'needsMoreInfo') {
                        // If clicking the same needsMoreInfo filter, reset it
                        if (filters.needsMoreInfo === (value === 'true')) {
                          setFilters(prev => ({ ...prev, needsMoreInfo: undefined, searchTerm: '' }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev,
                            needsMoreInfo: value === 'true',
                            searchTerm: '' // Clear search when filtering
                          }));
                        }
                      } else if (filterType === 'pinned') {
                        // If clicking the same pinned filter, reset it
                        if (filters.pinned === (value === 'true')) {
                          setFilters(prev => ({ ...prev, pinned: undefined, searchTerm: '' }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev,
                            pinned: value === 'true',
                            searchTerm: '' // Clear search when filtering
                          }));
                        }
                      }
                    }}
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