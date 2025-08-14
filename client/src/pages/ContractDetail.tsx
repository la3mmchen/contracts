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
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Loader2,
  FileX,
  ExternalLink,
  Settings,
  PenTool,
  Download
} from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [showInlineEditingWarning, setShowInlineEditingWarning] = useState(false);
  


  // Find the contract by ID
  useEffect(() => {
    if (!loading && contracts.length > 0 && id) {
      const foundContract = contracts.find(c => c.id === id);
      setContract(foundContract || null);
    }
  }, [contracts, id, loading]);

  // Debug: Log when contract changes
  useEffect(() => {
    console.log('Contract state updated:', contract);
  }, [contract]);

  // Handle ESC key to go back to main view
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isEditFormOpen) {
        if (isInlineEditing) {
          setShowInlineEditingWarning(true);
        } else {
          navigate('/');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isEditFormOpen, isInlineEditing]);

  // Navigation protection when inline editing is active
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isInlineEditing) {
        event.preventDefault();
        event.returnValue = 'You have unsaved inline editing changes. Are you sure you want to leave?';
        return 'You have unsaved inline editing changes. Are you sure you want to leave?';
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isInlineEditing) {
        event.preventDefault();
        setShowInlineEditingWarning(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isInlineEditing]);

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
      {/* Inline Editing Active Banner */}
      {isInlineEditing && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
              <PenTool className="h-4 w-4" />
              <span className="text-sm font-medium">
                Inline editing active - Save your changes before leaving the page!
              </span>
            </div>
          </div>
        </div>
      )}
      
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
              isDetailPage={true}
              onInlineEditingChange={setIsInlineEditing}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => setIsEditFormOpen(true)}
                      className="cursor-pointer"
                    >
                                          <Edit className="h-4 w-4 mr-2" />
                    Full Form Edit
                      <span className="ml-auto text-xs text-muted-foreground">All fields</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        // Scroll to first editable field and show hint
                        const firstEditableField = document.querySelector('[data-editable="true"]');
                        if (firstEditableField) {
                          firstEditableField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // Add a temporary highlight effect
                          firstEditableField.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
                          setTimeout(() => {
                            firstEditableField.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
                          }, 2000);
                        }
                      }}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Quick Inline Edit
                      <span className="ml-auto text-xs text-muted-foreground">Single fields</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        // Show a helpful tooltip about editing modes
                        alert('💡 Editing Tips:\n\n• Click any field to edit it inline\n• Use "Full Form Edit" for changing many fields at once\n• Inline editing is perfect for quick updates\n• Form editing is better for major changes');
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Editing Help
                    </DropdownMenuItem>
                    
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={async () => {
                    if (contract) {
                      try {
                        toast({
                          title: "Generating Markdown...",
                          description: "Please wait while we generate your markdown document.",
                        });
                        
                        await api.exportContractToMarkdown(contract.id);
                        
                        toast({
                          title: "Markdown Generated Successfully!",
                          description: "Your contract markdown has been downloaded.",
                          variant: "default",
                        });
                      } catch (error) {
                        console.error('Failed to export contract:', error);
                        
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        toast({
                          title: "Markdown Generation Failed",
                          description: errorMessage,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Markdown
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
                <CardTitle className="text-lg flex items-center gap-2">
                  Overview
                  <Edit 
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                    onClick={() => setIsEditFormOpen(true)}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <PenTool className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Quick Inline Editing Available!</p>
                      <p>Click on any field below to edit it directly. Perfect for quick updates!</p>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">
                        💡 Use "Full Form Edit" button above for changing multiple fields at once.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contract ID:</span>
                  <span className="text-sm font-mono font-medium">{contract.contractId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Start Date:</span>
                  <span 
                    className="text-sm font-medium cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                    onClick={() => setIsEditFormOpen(true)}
                    title="Click to edit contract"
                  >
                    {new Date(contract.startDate).toLocaleDateString()}
                  </span>
                </div>
                {contract.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">End Date:</span>
                    <span 
                      className="text-sm font-medium cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors"
                      onClick={() => setIsEditFormOpen(true)}
                      title="Click to edit contract"
                    >
                      {new Date(contract.endDate).toLocaleDateString()}
                    </span>
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

      {/* Inline Editing Warning Dialog */}
      <AlertDialog open={showInlineEditingWarning} onOpenChange={setShowInlineEditingWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Inline Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved inline editing changes. If you leave now, all your changes will be lost. 
              Please save your changes first or continue editing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowInlineEditingWarning(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowInlineEditingWarning(false);
                // Allow navigation but warn about data loss
                if (window.confirm('Are you sure you want to discard your unsaved changes? This action cannot be undone.')) {
                  navigate('/');
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractDetail;

