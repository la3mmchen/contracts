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
        <div className="container mx-auto px-4 py-8">
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <FileX className="h-16 w-16 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Contract Not Found</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  The contract with ID "{id}" could not be found.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2"
                  >
                    View All Contracts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Contracts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contract Details</h1>
              <p className="text-muted-foreground">ID: {contract.id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditFormOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Contract Card */}
        <div className="max-w-4xl mx-auto">
          <ContractCard
            contract={contract}
            onEdit={() => setIsEditFormOpen(true)}
            onDelete={() => setDeleteConfirmOpen(true)}
            onFilter={handleFilter}
            defaultExpandCustomFields={true}
            onUpdate={updateContract}
          />
        </div>

        {/* Share URL Card */}
        <div className="max-w-4xl mx-auto mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Direct Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                  {window.location.href}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // You could add a toast notification here
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this link to give others direct access to this contract's details.
              </p>
            </CardContent>
          </Card>
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
