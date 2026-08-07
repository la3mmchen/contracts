import { useState, useRef, useEffect } from 'react';
import { ContractFilters as FilterType, Contract } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { getStatuses, getStatusDisplayName } from '@/config/statuses';
import { getFrequencies, getFrequencyDisplayName } from '@/config/frequencies';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Menu, Search, Download, Upload, Plus, Tag, Building2, User, TrendingUp, Coins, LogOut, Pin, PinOff } from 'lucide-react';
import { appConfig } from '@/config/app';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetPortal, SheetOverlay } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { isValidCategory, getCategoryStatsColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SlideInMenuProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableTags?: string[];
  existingContracts?: Contract[];
  onExport: () => void;
  onImport: () => void;
  onAddContract: () => void;
  contracts: Contract[];
}

export const SlideInMenu = ({ 
  filters, 
  onFiltersChange, 
  availableTags = [], 
  existingContracts = [],
  onExport,
  onImport,
  onAddContract,
  contracts
}: SlideInMenuProps) => {
  const [activeTab, setActiveTab] = useState('quickFilters');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { authEnabled, logout } = useAuth();

  // When "kept open" (pinned), the menu will not auto-close on outside click,
  // Escape, or focus changes. Persisted so the choice survives reloads.
  // Defaults to pinned on non-mobile viewports when the user has no saved choice.
  const KEEP_OPEN_STORAGE_KEY = 'contracts:menuKeepOpen';
  const [keepOpen, setKeepOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(KEEP_OPEN_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // Ignore storage access failures.
    }
    // No saved preference: pin by default on non-mobile viewports.
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  // When defaulting to pinned (desktop, no saved choice), also open the menu.
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      if (localStorage.getItem(KEEP_OPEN_STORAGE_KEY) !== null) {
        return false;
      }
    } catch {
      return false;
    }
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  const toggleKeepOpen = () => {
    setKeepOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem(KEEP_OPEN_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage failures (e.g. private mode).
      }
      return next;
    });
  };

  // Focus search input when sheet opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the sheet is fully rendered
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 200);
    }
  }, [isOpen]);

  // Handle Ctrl+F keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Try both Ctrl+F and Cmd+F (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        // Only intercept when menu is closed
        if (!isOpen) {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(true);
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 300);
        }
        // When menu is open, let browser handle Ctrl+F normally
      }
    };

    // Always add event listener to document (use bubbling phase, not capture)
    document.addEventListener('keydown', handleKeyDown, false);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [isOpen]);

  const updateFilter = (key: keyof FilterType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof FilterType) => {
    updateFilter(key, undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: undefined,
      category: undefined,
      company: undefined,
      frequency: undefined,
      tags: undefined,
      needsMoreInfo: undefined,
      pinned: undefined,
      draft: undefined,
      hasAdditionalFields: undefined,
      optimizable: undefined,
      sortBy: 'name'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.company) count++;
    if (filters.frequency) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.needsMoreInfo !== undefined) count++;
    if (filters.pinned !== undefined) count++;
    if (filters.draft !== undefined) count++;
    if (filters.hasAdditionalFields !== undefined) count++;
    if (filters.optimizable !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Calculate stats
  const activeContracts = contracts.filter(c => c.status === 'active');
  const monthlySpend = contracts
    .filter(c => c.status === 'active')
    .reduce((total, contract) => {
      switch (contract.frequency) {
        case 'monthly': return total + contract.amount;
        case 'quarterly': return total + (contract.amount / 3);
        case 'yearly': return total + (contract.amount / 12);
        case 'weekly': return total + (contract.amount * 4.33);
        case 'bi-weekly': return total + (contract.amount * 2.17);
        case 'one-time': return total + (contract.amount / 12);
        default: return total;
      }
    }, 0);

  // Tab change handler
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Reset filters when switching to advanced filters tab
    if (newTab === 'filters') {
      clearAllFilters();
    }
  };

  // Helper function to get tab label and icon
  const getTabContent = (tabType: string) => {
    switch (tabType) {
      case 'quickFilters':
        return { icon: Tag, label: 'Quick Filters' };
      case 'companies':
        return { icon: Building2, label: 'Companies' };
      case 'persons':
        return { icon: User, label: 'Persons' };
      case 'filters':
        return { icon: TrendingUp, label: 'Advanced' };
      default:
        return { icon: Tag, label: tabType };
    }
  };

  // Generate category stats
  const generateCategoryStats = () => {
    const categories = getCategories();
    const categoryIcons: Record<string, React.ComponentType<any>> = {
      subscription: Tag,
      insurance: TrendingUp,
      utilities: TrendingUp,
      rent: Building2,
      house: Building2,
      services: Tag,
      software: TrendingUp,
      maintenance: TrendingUp,
      other: Tag,
      marketing: TrendingUp,
      internet: Building2,
      phone: Building2,
      gym: Building2,
      streaming: Building2,
      transportation: Building2,
      food: Building2,
      entertainment: Building2,
      education: Building2,
      healthcare: Building2,
      legal: Building2,
    };

    return categories.map(category => {
      const count = contracts.filter(c => c.category === category).length;
      const Icon = categoryIcons[category] || Tag;
      const { color, bgColor } = getCategoryStatsColor(category);
      
      return {
        title: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        icon: Icon,
        color,
        bgColor,
        clickable: count > 0,
        filterType: 'category',
        filterValue: category
      };
    });
  };

  // Generate family member stats
  const generateFamilyMemberStats = () => {
    const familyMembers = new Set<string>();
    contracts.forEach(contract => {
      if (contract.familyMember?.trim()) {
        familyMembers.add(contract.familyMember.trim());
      }
    });

    return Array.from(familyMembers)
      .map(member => {
        const count = contracts.filter(c => c.familyMember?.trim() === member).length;
        return {
          title: member,
          value: count,
          icon: User,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          clickable: count > 0,
          filterType: 'familyMember',
          filterValue: member
        };
      })
      .sort((a, b) => (b.value as number) - (a.value as number));
  };

  // Generate company stats
  const generateCompanyStats = () => {
    const companies = new Set<string>();
    contracts.forEach(contract => {
      if (contract.company?.trim()) {
        companies.add(contract.company.trim());
      }
    });

    return Array.from(companies)
      .map(company => {
        const count = contracts.filter(c => c.company?.trim() === company).length;
        return {
          title: company,
          value: count,
          icon: Building2,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          clickable: count > 0,
          filterType: 'company',
          filterValue: company
        };
      })
      .sort((a, b) => (b.value as number) - (a.value as number));
  };

  // Render category/company/person card
  const renderFilterCard = (stat: any, index: number) => {
    const isActive = filters && (
      (stat.filterType === 'category' && filters.category === stat.filterValue) ||
      (stat.filterType === 'familyMember' && filters.familyMember === stat.filterValue) ||
      (stat.filterType === 'company' && filters.company === stat.filterValue)
    );
    
    return (
      <Card 
        key={`${stat.filterType}-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-200 ${
          stat.clickable ? 'cursor-pointer hover:scale-[1.02] border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary bg-primary/5 border-primary/50' : ''}`} 
        onClick={stat.clickable ? () => updateFilter(stat.filterType, stat.filterValue) : undefined}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className={`${stat.bgColor} p-1.5 rounded flex-shrink-0`}>
              <stat.icon className={`h-3 w-3 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {stat.title}
                </span>
                <span className="text-xs font-bold text-foreground ml-1">
                  {stat.value}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={!keepOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 hover:scale-105"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetPortal>
        <SheetOverlay
          className={
            keepOpen
              ? 'bg-transparent pointer-events-none'
              : 'bg-black/10 backdrop-blur-[1px]'
          }
        />
        <SheetContent 
          side="left" 
          className="w-[90vw] max-w-[400px] sm:w-[500px] overflow-y-auto"
          onInteractOutside={(e) => {
            if (keepOpen) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (keepOpen) e.preventDefault();
          }}
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">{appConfig.name}</h1>
                <Button
                  variant={keepOpen ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8 mr-8 shrink-0"
                  onClick={toggleKeepOpen}
                  title={keepOpen ? 'Menu stays open (click to allow closing)' : 'Keep menu open'}
                  aria-label={keepOpen ? 'Unpin menu' : 'Keep menu open'}
                  aria-pressed={keepOpen}
                >
                  {keepOpen ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </Button>
              </div>
              {/* Overview Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Total: {contracts.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Active: {activeContracts.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Monthly: ${monthlySpend.toFixed(0)}</span>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

        <div className="space-y-6">
          {/* Add Contract Button */}
          <div className="space-y-3">
            <Button onClick={onAddContract} size="lg" className="w-full bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5 mr-2" />
              Add Contract
            </Button>
          </div>

          <Separator />

          {/* Search Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search contracts..."
                value={filters.searchTerm || ''}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
              {filters.searchTerm && (
                <button
                  onClick={() => updateFilter('searchTerm', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Order By Section */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Order by</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="nextPaymentDate">Next Payment</SelectItem>
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="updatedAt">Updated</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="endDate">End Date</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Order..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Filter Tabs */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Filters</h3>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quickFilters" className="text-xs flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="hidden sm:inline">Quick</span>
                </TabsTrigger>
                <TabsTrigger value="companies" className="text-xs flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Company</span>
                </TabsTrigger>
                <TabsTrigger value="persons" className="text-xs flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline">Person</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="quickFilters" className="space-y-3 mt-3">
                {/* Quick Filter - Categories Only */}
                <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-foreground">Filter by Category</h4>
                    <span className="text-xs text-muted-foreground">Click to filter</span>
                  </div>
                  
                  {/* Categories Only */}
                  <div className="grid grid-cols-2 gap-2">
                    {generateCategoryStats()
                      .filter(stat => typeof stat.value === 'number' && stat.value > 0)
                      .sort((a, b) => (b.value as number) - (a.value as number))
                      .map((stat, index) => renderFilterCard(stat, index))}
                  </div>
                </div>

                {/* Quick Filter - Need More Info & Draft */}
                <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-foreground">Quick Status Filters</h4>
                    <span className="text-xs text-muted-foreground">Click to filter</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Need More Info Filter */}
                    <Button
                      variant={filters.needsMoreInfo === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (filters.needsMoreInfo === true) {
                          // If already active, clear just this filter
                          updateFilter('needsMoreInfo', undefined);
                        } else {
                          // Clear all other filters and set this one
                          onFiltersChange({
                            searchTerm: '',
                            status: undefined,
                            category: undefined,
                            company: undefined,
                            frequency: undefined,
                            tags: undefined,
                            needsMoreInfo: true,
                            pinned: undefined,
                            draft: undefined,
                            hasAdditionalFields: undefined,
                            optimizable: undefined,
                            hasConnections: undefined,
                            connectedTo: undefined,
                            sortBy: 'name'
                          });
                        }
                      }}
                      className="w-full h-8 text-xs justify-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>Need More Info</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {contracts.filter(c => c.needsMoreInfo).length}
                        </span>
                      </div>
                    </Button>

                    {/* Draft Filter */}
                    <Button
                      variant={filters.draft === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (filters.draft === true) {
                          // If already active, clear just this filter
                          updateFilter('draft', undefined);
                        } else {
                          // Clear all other filters and set this one
                          onFiltersChange({
                            searchTerm: '',
                            status: undefined,
                            category: undefined,
                            company: undefined,
                            frequency: undefined,
                            tags: undefined,
                            needsMoreInfo: undefined,
                            pinned: undefined,
                            draft: true,
                            hasAdditionalFields: undefined,
                            optimizable: undefined,
                            hasConnections: undefined,
                            connectedTo: undefined,
                            sortBy: 'name'
                          });
                        }
                      }}
                      className="w-full h-8 text-xs justify-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Draft</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {contracts.filter(c => c.draft).length}
                        </span>
                      </div>
                    </Button>

                    {/* Optimization Filter */}
                    <Button
                      variant={filters.optimizable === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (filters.optimizable === true) {
                          // If already active, clear just this filter
                          updateFilter('optimizable', undefined);
                        } else {
                          // Clear all other filters and set this one
                          onFiltersChange({
                            searchTerm: '',
                            status: undefined,
                            category: undefined,
                            company: undefined,
                            frequency: undefined,
                            tags: undefined,
                            needsMoreInfo: undefined,
                            pinned: undefined,
                            draft: undefined,
                            hasAdditionalFields: undefined,
                            optimizable: true,
                            hasConnections: undefined,
                            connectedTo: undefined,
                            sortBy: 'name'
                          });
                        }
                      }}
                      className="w-full h-8 text-xs justify-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Coins className="h-3 w-3 text-purple-500" />
                        <span>Optimization</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {contracts.filter(c => c.optimizable).length}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="companies" className="space-y-3 mt-3">
                {/* Company Filter */}
                <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-foreground">Filter by Company</h4>
                    <span className="text-xs text-muted-foreground">Click to filter</span>
                  </div>
                  
                  {/* Company Filter Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {generateCompanyStats().map((stat, index) => renderFilterCard(stat, index))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="persons" className="space-y-3 mt-3">
                {/* Person Filter */}
                <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-foreground">Filter by Person</h4>
                    <span className="text-xs text-muted-foreground">Click to filter</span>
                  </div>
                  
                  {/* Person Filter Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {generateFamilyMemberStats().map((stat, index) => renderFilterCard(stat, index))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="filters" className="space-y-3 mt-3">
                {/* Advanced Filters Section */}
                <div className="w-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-foreground">Advanced Filters</h4>
                      {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground h-6 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Clear All ({activeFilterCount})
                        </Button>
                      )}
                    </div>

                    {/* Core Filters */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="status-filter" className="text-xs font-medium">Status</Label>
                        <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
                          <SelectTrigger id="status-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {getStatuses().map(status => (
                              <SelectItem key={status} value={status}>
                                {getStatusDisplayName(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category-filter" className="text-xs font-medium">Category</Label>
                        <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}>
                          <SelectTrigger id="category-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {getCategories().map(category => (
                              <SelectItem key={category} value={category}>
                                {getCategoryDisplayName(category)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="company-filter" className="text-xs font-medium">Company</Label>
                        <Select value={filters.company || 'all'} onValueChange={(value) => updateFilter('company', value === 'all' ? undefined : value)}>
                          <SelectTrigger id="company-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Companies" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Companies</SelectItem>
                            {existingContracts && Array.from(new Set(existingContracts.map(c => c.company).filter(Boolean))).sort().map(company => (
                              <SelectItem key={company} value={company}>
                                {company}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="frequency-filter" className="text-xs font-medium">Frequency</Label>
                        <Select value={filters.frequency || 'all'} onValueChange={(value) => updateFilter('frequency', value === 'all' ? undefined : value)}>
                          <SelectTrigger id="frequency-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Frequencies" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Frequencies</SelectItem>
                            {getFrequencies().map(frequency => (
                              <SelectItem key={frequency} value={frequency}>
                                {getFrequencyDisplayName(frequency)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="needs-more-info-filter" className="text-xs font-medium">Contract Status</Label>
                        <Select value={(() => {
                          if (filters.needsMoreInfo === true) return 'true';
                          if (filters.optimizable === true) return 'optimizable';
                          if (filters.needsMoreInfo === false) return 'false';
                          return 'all';
                        })()} onValueChange={(value) => {
                          if (value === 'all') {
                            const newFilters = { ...filters, needsMoreInfo: undefined, optimizable: undefined };
                            onFiltersChange(newFilters);
                          } else if (value === 'true') {
                            const newFilters = { ...filters, needsMoreInfo: true, optimizable: undefined };
                            onFiltersChange(newFilters);
                          } else if (value === 'false') {
                            const newFilters = { ...filters, needsMoreInfo: false, optimizable: undefined };
                            onFiltersChange(newFilters);
                          } else if (value === 'optimizable') {
                            const newFilters = { ...filters, needsMoreInfo: undefined, optimizable: true };
                            onFiltersChange(newFilters);
                          }
                        }}>
                          <SelectTrigger id="needs-more-info-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Contracts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Contracts</SelectItem>
                            <SelectItem value="true">Needs Attention</SelectItem>
                            <SelectItem value="false">Complete</SelectItem>
                            <SelectItem value="optimizable">Needs Optimization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="pinned-filter" className="text-xs font-medium">Pinned</Label>
                        <Select value={filters.pinned === undefined ? 'all' : filters.pinned.toString()} onValueChange={(value) => updateFilter('pinned', value === 'all' ? undefined : value === 'true')}>
                          <SelectTrigger id="pinned-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Contracts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Contracts</SelectItem>
                            <SelectItem value="true">Pinned Only</SelectItem>
                            <SelectItem value="false">Not Pinned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="additional-fields-filter" className="text-xs font-medium">Additional Fields</Label>
                        <Select value={filters.hasAdditionalFields === undefined ? 'all' : filters.hasAdditionalFields.toString()} onValueChange={(value) => updateFilter('hasAdditionalFields', value === 'all' ? undefined : value === 'true')}>
                          <SelectTrigger id="additional-fields-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Contracts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Contracts</SelectItem>
                            <SelectItem value="true">With Additional Fields</SelectItem>
                            <SelectItem value="false">No Additional Fields</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tags-filter" className="text-xs font-medium">Tags</Label>
                        <Select value={filters.tags?.[0] || 'all'} onValueChange={(value) => updateFilter('tags', value === 'all' ? undefined : [value])}>
                          <SelectTrigger id="tags-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All Tags" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {availableTags.map(tag => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* New: Has Connections */}
                      <div>
                        <Label htmlFor="has-connections-filter" className="text-xs font-medium">Has Connections</Label>
                        <Select value={filters.hasConnections === undefined ? 'all' : filters.hasConnections ? 'true' : 'false'} onValueChange={(value) => updateFilter('hasConnections', value === 'all' ? undefined : value === 'true')}>
                          <SelectTrigger id="has-connections-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="true">With Connections</SelectItem>
                            <SelectItem value="false">Without Connections</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* New: Connected To */}
                      <div>
                        <Label htmlFor="connected-to-filter" className="text-xs font-medium">Connected To (Contract ID)</Label>
                        <Select value={filters.connectedTo || 'all'} onValueChange={(value) => updateFilter('connectedTo', value === 'all' ? undefined : value)}>
                          <SelectTrigger id="connected-to-filter" className="w-full h-8 text-xs">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Any</SelectItem>
                            {existingContracts && Array.from(new Set(existingContracts.map(c => c.contractId))).sort().map(id => (
                              <SelectItem key={id} value={id}>{id}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onExport} size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={onImport} size="sm" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          <Separator />

          {/* Theme Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          {authEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Account</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    void logout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};
