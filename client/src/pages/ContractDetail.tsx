import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Contract } from '@/types/contract';
import { useContractStorage } from '@/hooks/useContractStorage';
import { ContractCard } from '@/components/ContractCard';
import { ContractForm } from '@/components/ContractForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Loader2,
  FileX,
  ExternalLink
} from 'lucide-react';

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    contracts, 
    loading, 
    updateContract, 
    deleteContract 
  } = useContractStorage();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);

  // Find the contract by ID
  useEffect(() => {
    if (!loading && contracts.length > 0 && id) {
      const foundContract = contracts.find(c => c.id === id);
      setContract(foundContract || null);
    }
  }, [contracts, id, loading]);

  // Handle ESC key to go back to main view
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isEditFormOpen) {
        navigate('/');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isEditFormOpen]);

  const handleEdit = (updatedContract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (contract) {
      updateContract(contract.id, updatedContract);
      setIsEditFormOpen(false);
    }
  };

  const handleDelete = async () => {
    if (contract) {
      await deleteContract(contract.id);
      navigate('/');
    }
  };

  const handleFilter = (filterType: string, value: string) => {
    // Navigate back to home with filter applied
    const searchParams = new URLSearchParams();
    if (filterType === 'tags') {
      searchParams.set('tags', value);
    } else {
      searchParams.set(filterType, value);
    }
    navigate(`/?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading contract details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <FileX className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground" />
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Contract Not Found</h1>
              <p className="text-muted-foreground text-sm sm:text-base">The contract you're looking for doesn't exist or has been deleted.</p>
              <Button asChild className="mt-4">
                <Link to="/">Back to Contracts</Link>
              </Button>
            </div>
          </div>
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
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-primary-foreground hover:bg-primary-foreground/10 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{contract.name}</h1>
                <p className="text-primary-foreground/80 text-sm sm:text-base">{contract.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Contract Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Info */}
          <div className="lg:col-span-2">
            <ContractCard
              contract={contract}
              onEdit={() => setIsEditFormOpen(true)}
              onDelete={() => setDeleteConfirmOpen(true)}
              onUpdate={updateContract}
              onFilter={handleFilter}
              defaultExpandCustomFields={true}
              defaultExpandPriceChanges={true}
              defaultExpandPayments={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setIsEditFormOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contract
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contract
                </Button>
              </CardContent>
            </Card>

            {/* Contract Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contract ID:</span>
                  <span className="text-sm font-mono font-medium">{contract.contractId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Start Date:</span>
                  <span className="text-sm font-medium">{new Date(contract.startDate).toLocaleDateString()}</span>
                </div>
                {contract.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">End Date:</span>
                    <span className="text-sm font-medium">{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated:</span>
                  <span className="text-sm font-medium">{new Date(contract.updatedAt).toLocaleDateString()}</span>
                </div>
                {contract.pinned && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pinned:</span>
                    <span className="text-sm font-medium text-yellow-600">✓ Yes</span>
                  </div>
                )}
                {contract.draft && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Draft:</span>
                    <span className="text-sm font-medium text-blue-600">✓ Yes</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={(open) => {
        if (!open && isFormDirty) {
          setShowUnsavedChangesDialog(true);
        } else {
          setIsEditFormOpen(open);
          if (!open) setIsFormDirty(false);
        }
      }}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={contract}
            onSubmit={handleEdit}
            onCancel={() => {
              if (isFormDirty) {
                setShowUnsavedChangesDialog(true);
              } else {
                setIsEditFormOpen(false);
              }
            }}
            onDirtyStateChange={setIsFormDirty}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contract.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogCancel onClick={() => setShowUnsavedChangesDialog(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowUnsavedChangesDialog(false);
                setIsEditFormOpen(false);
                setIsFormDirty(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractDetail;

