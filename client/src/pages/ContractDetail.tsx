import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Contract } from '@/types/contract';
import { useContractStorage } from '@/hooks/useContractStorage';
import { ContractCard } from '@/components/ContractCard';
import { ContractForm } from '@/components/ContractForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ContractNavigation } from '@/components/ContractNavigation';
import { NotesSection } from '@/components/NotesSection';
import { PriceOverTimeChart } from '@/components/PriceOverTimeChart';
import { PriceChangesSection } from '@/components/PriceChangesSection';
import { useContractNavigation } from '@/hooks/useContractNavigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Download,
  Copy,
  Star,
  X
} from 'lucide-react';
import { smartApi } from '@/services/smartApi';
import { useToast } from '@/hooks/use-toast';
import { calculateNextThreePayments } from '@/lib/paymentCalculator';
import { DataQualityScore } from '@/components/DataQualityScore';

// Helper function to get the correct base path
const getBasePath = () => {
  return window.location.pathname.includes('/contracts/') ? '/contracts' : '';
};

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
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









  // Handle unsaved changes confirmation
  const handleUnsavedChangesConfirm = () => {
    setShowUnsavedChangesDialog(false);
    setIsEditFormOpen(false);
    setIsFormDirty(false);
  };

  // Handle unsaved changes cancellation
  const handleUnsavedChangesCancel = () => {
    setShowUnsavedChangesDialog(false);
    // Keep the dialog open for continued editing
  };

  // Get filtered contracts based on URL parameters for navigation context
  const filteredContracts = React.useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    let filtered = contracts;



    // Apply filters based on URL parameters
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const frequency = searchParams.get('frequency');
    const tags = searchParams.get('tags');
    const needsMoreInfo = searchParams.get('needsMoreInfo');
    const pinned = searchParams.get('pinned');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    if (status && status !== 'all') {
      filtered = filtered.filter(c => c.status === status);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }
    if (frequency && frequency !== 'all') {
      filtered = filtered.filter(c => c.frequency === frequency);
    }
    if (tags) {
      const tagArray = tags.split(',');
      filtered = filtered.filter(c => c.tags?.some(tag => tagArray.includes(tag)));
    }
    if (needsMoreInfo !== null) {
      if (needsMoreInfo === 'false') {
        // "Complete" should show contracts where needsMoreInfo is false OR null/undefined AND not draft
        filtered = filtered.filter(c => !c.needsMoreInfo && !c.draft);
      } else {
        // "Needs Attention" should show contracts where needsMoreInfo is true OR draft is true
        filtered = filtered.filter(c => c.needsMoreInfo === true || c.draft === true);
      }
    }
    if (pinned !== null) {
      filtered = filtered.filter(c => c.pinned === (pinned === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.company.toLowerCase().includes(searchLower) ||
        c.contractId.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        c.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort contracts
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'nextPaymentDate': {
          const aPayments = calculateNextThreePayments(a);
          const bPayments = calculateNextThreePayments(b);
          aValue = aPayments[0] ? new Date(aPayments[0].date).getTime() : 0;
          bValue = bPayments[0] ? new Date(bPayments[0].date).getTime() : 0;
          break;
        }
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });



    return filtered;
  }, [contracts, location.search]);

  // Use navigation hook
  const navigation = useContractNavigation({
    contracts: filteredContracts,
    currentContractId: id
  });




  


  // Find the contract by ID
  useEffect(() => {
    if (!loading && contracts.length > 0 && id) {
      const foundContract = contracts.find(c => c.id === id);
      setContract(foundContract || null);
    }
  }, [contracts, id, loading]);



  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key handling
      if (event.key === 'Escape') {
        if (isEditFormOpen) {
          // ESC should close the edit form modal
          if (isFormDirty) {
            setShowUnsavedChangesDialog(true);
          } else {
            setIsEditFormOpen(false);
            setIsFormDirty(false);
          }
          return;
        } else if (isInlineEditing) {
          setShowInlineEditingWarning(true);
        } else {
          navigate(`${getBasePath()}/`);
        }
      }
      
      // Arrow key navigation (only when not editing and navigation is ready)
      if (!isEditFormOpen && !isInlineEditing && navigation && filteredContracts.length > 1) {
        if (event.key === 'ArrowRight' && navigation.hasNext) {
          event.preventDefault();
          navigation.goToNext();
        } else if (event.key === 'ArrowLeft' && navigation.hasPrevious) {
          event.preventDefault();
          navigation.goToPrevious();
        } else if (event.key === 'Home') {
          event.preventDefault();
          navigation.goToFirst();
        } else if (event.key === 'End') {
          event.preventDefault();
          navigation.goToLast();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isEditFormOpen, isInlineEditing, navigation, filteredContracts.length, isFormDirty]);

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
      navigate(`${getBasePath()}/`);
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
    navigate(`${getBasePath()}/?${searchParams.toString()}`);
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
                <Link to={`${getBasePath()}/`}>Back to Contracts</Link>
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
      <div className="bg-black text-white border-b border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`${getBasePath()}/`)}
                className="text-white hover:bg-white/10 hover:scale-105 p-2 transition-all duration-200"
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

              {/* Navigation Bar */}
      {filteredContracts.length > 1 && navigation && navigation.currentIndex > 0 && (
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Position Indicator - Moved to front */}
                {navigation.currentIndex > 0 && navigation.totalContracts > 1 && (
                  <Badge variant="secondary" className="px-3 py-1 font-medium">
                    {navigation.currentIndex} of {navigation.totalContracts}
                  </Badge>
                )}

                {/* Show current filter context */}
                <div className="flex items-center gap-2 text-xs">
                  {location.search && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Active Filters:</span>
                      {(() => {
                        const params = new URLSearchParams(location.search);
                        const activeFilters = [];
                        
                        if (params.get('status')) activeFilters.push(`Status: ${params.get('status')}`);
                        if (params.get('category')) activeFilters.push(`Category: ${params.get('category')}`);
                        if (params.get('frequency')) activeFilters.push(`Frequency: ${params.get('frequency')}`);
                        if (params.get('tags')) activeFilters.push(`Tags: ${params.get('tags')}`);
                        if (params.get('search')) activeFilters.push(`Search: "${params.get('search')}"`);
                        if (params.get('needsMoreInfo')) {
                          const needsInfoValue = params.get('needsMoreInfo');
                          if (needsInfoValue === 'true') {
                            activeFilters.push('Needs Info: Yes');
                          } else if (needsInfoValue === 'false') {
                            activeFilters.push('Needs Info: No');
                          }
                        }
                        if (params.get('pinned')) activeFilters.push(`Pinned: ${params.get('pinned') === 'true' ? 'Yes' : 'No'}`);
                        
                        return activeFilters.map((filter, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                            {filter}
                          </Badge>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
              {navigation.currentIndex > 0 && navigation.totalContracts > 1 && (
                <ContractNavigation
                  currentIndex={navigation.currentIndex}
                  totalContracts={navigation.totalContracts}
                  hasNext={navigation.hasNext}
                  hasPrevious={navigation.hasPrevious}
                  onNext={navigation.goToNext}
                  onPrevious={navigation.goToPrevious}
                  onFirst={navigation.goToFirst}
                  onLast={navigation.goToLast}
                  onShowList={() => navigate(`${getBasePath()}/${location.search}`)}
                  previousContract={navigation.previousContract}
                  nextContract={navigation.nextContract}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Contract Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Info */}
          <div className="lg:col-span-2 space-y-6">
            <ContractCard
              contract={contract}
              onEdit={() => setIsEditFormOpen(true)}
              onDelete={() => setDeleteConfirmOpen(true)}
              onUpdate={updateContract}
              onFilter={handleFilter}
              defaultExpandCustomFields={true}
              defaultExpandPriceChanges={false}
              defaultExpandPayments={true}
              isDetailPage={true}
              onInlineEditingChange={setIsInlineEditing}
            />
            
            {/* Price Changes Section */}
            <PriceChangesSection contract={contract} />
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
                        alert('💡 Editing Tips:\n\n• Click any field to edit it inline\n• Use "Full Form Edit" button above for changing many fields at once\n• Inline editing is perfect for quick updates\n• Form editing is better for major changes');
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
                        
                        await smartApi.exportContractToMarkdown(contract.id);
                        
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

                {/* Copy Contract Button */}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Copy Contract",
                      description: "Use the copy button on the main contracts page to duplicate this contract.",
                      variant: "default",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Contract
                </Button>

                {/* Pin/Unpin Contract Button */}
                <Button 
                  variant={contract.pinned ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    if (contract) {
                      updateContract(contract.id, { pinned: !contract.pinned });
                      toast({
                        title: contract.pinned ? "Contract Unpinned!" : "Contract Pinned!",
                        description: contract.pinned ? "Contract has been unpinned." : "Contract has been pinned to the top.",
                        variant: "default",
                      });
                    }
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {contract.pinned ? 'Unpin Contract' : 'Pin Contract'}
                </Button>

                {/* Close Contract Button - Only show for expired contracts */}
                {contract.status === 'expired' && (
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-destructive hover:text-destructive-foreground" 
                    size="sm"
                    onClick={() => {
                      if (contract) {
                        updateContract(contract.id, { status: 'closed' });
                        toast({
                          title: "Contract Closed!",
                          description: "Expired contract has been marked as closed.",
                          variant: "default",
                        });
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close Contract
                  </Button>
                )}

                {/* Draft Toggle Button - Always show, toggle between draft/non-draft */}
                <Button 
                  variant={contract.draft ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    if (contract) {
                      updateContract(contract.id, { draft: !contract.draft });
                      toast({
                        title: contract.draft ? "Draft Removed!" : "Contract Converted to Draft!",
                        description: contract.draft ? "Contract is no longer a draft." : "Contract has been marked as a draft.",
                        variant: "default",
                      });
                    }
                  }}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  {contract.draft ? 'Remove Draft Status' : 'Convert to Draft'}
                </Button>

                {/* Need More Info Button - Always show, toggle the needsMoreInfo flag */}
                <Button 
                  variant={contract.needsMoreInfo ? "default" : "outline"}
                  className="w-full"
                  size="sm"
                  onClick={() => {
                    if (contract) {
                      updateContract(contract.id, { needsMoreInfo: !contract.needsMoreInfo });
                      toast({
                        title: contract.needsMoreInfo ? "Info Flag Removed!" : "Contract Flagged for More Info!",
                        description: contract.needsMoreInfo ? "Contract no longer needs more information." : "Contract has been marked as needing more information.",
                        variant: "default",
                      });
                    }
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {contract.needsMoreInfo ? 'Remove Info Flag' : 'Need More Info'}
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

            {/* Data Quality Score */}
            <DataQualityScore 
              contract={contract} 
              onEdit={() => setIsEditFormOpen(true)}
            />

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

            {/* Payment Over Time Chart */}
            <PriceOverTimeChart contract={contract} />

            {/* Notes Section */}
            <NotesSection
              contract={contract}
              onUpdate={updateContract}
            />
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (isFormDirty) {
                setShowUnsavedChangesDialog(true);
              } else {
                setIsEditFormOpen(false);
                setIsFormDirty(false);
              }
            }}
          />
          
          {/* Modal Content */}
          <div className="relative bg-background rounded-lg shadow-xl max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto scrollbar-thin border">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">Edit Contract</h2>
                <p className="text-sm text-muted-foreground">
                  Edit the contract details below. All changes will be saved when you submit the form.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isFormDirty) {
                    setShowUnsavedChangesDialog(true);
                  } else {
                    setIsEditFormOpen(false);
                    setIsFormDirty(false);
                  }
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <ContractForm
                contract={contract}
                existingContracts={contracts}
                onSubmit={handleEdit}
                onCancel={() => {
                  if (isFormDirty) {
                    setShowUnsavedChangesDialog(true);
                  } else {
                    setIsEditFormOpen(false);
                    setIsFormDirty(false);
                  }
                }}
                onDirtyStateChange={setIsFormDirty}
              />
            </div>
          </div>
        </div>
      )}

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
                  navigate(`${getBasePath()}/`);
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

