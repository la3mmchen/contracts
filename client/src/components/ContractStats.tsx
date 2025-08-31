import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Contract, ContractFilters as FilterType } from '@/types/contract';
import { ContractFilters } from '@/components/ContractFilters';
import { isValidCategory, getCategoryStatsColor } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCategories } from '@/config/categories';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Tag, 
  Coins, 
  Building2,
  User
} from 'lucide-react';

interface ContractStatsProps {
  contracts: Contract[];
  onFilter?: (filterType: string, value: string) => void;
  activeFilters?: {
    status?: string;
    category?: string;
    familyMember?: string;
    company?: string;
    needsMoreInfo?: boolean;
    pinned?: boolean;
    optimizable?: boolean;
    hasAdditionalFields?: boolean;
  };
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableTags: string[];
  filteredContracts?: Contract[];
}

export const ContractStats = ({ 
  contracts, 
  onFilter, 
  activeFilters, 
  filters, 
  onFiltersChange, 
  availableTags,
  filteredContracts
}: ContractStatsProps) => {
  const [activeTab, setActiveTab] = useState('quickFilters');

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Reset filters when switching to advanced filters tab
    if (newTab === 'filters' && onFilter) {
      onFilter('reset', '');
    }
    // Reset filters when switching to persons tab
    if (newTab === 'persons' && onFilter) {
      onFilter('reset', '');
    }
    // Reset filters when switching to companies tab
    if (newTab === 'companies' && onFilter) {
      onFilter('reset', '');
    }
  };
  const activeContracts = contracts.filter(c => c.status === 'active');
  

  type StatItem = {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    clickable: boolean;
    filterType?: string;
    filterValue?: string;
    tooltip?: string;
  };

  const generateCategoryStats = (): StatItem[] => {
    // Use actual available categories from config instead of hardcoded list
    // This fixes the issue where contracts with categories like 'rent' wouldn't show up
    // in the dashboard because they weren't in the hardcoded category list
    const categories = getCategories();
    
    // Map categories to appropriate icons
    const categoryIcons: Record<string, React.ComponentType<any>> = {
      subscription: Coins,
      insurance: AlertTriangle,
      utilities: DollarSign,
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
      const Icon = categoryIcons[category] || Tag; // Default to Tag icon for unknown categories
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

  const generateFamilyMemberStats = (): StatItem[] => {
    // Extract unique family members from contracts
    const familyMembers = new Set<string>();
    contracts.forEach(contract => {
      if (contract.familyMember?.trim()) {
        familyMembers.add(contract.familyMember.trim());
      }
    });

    return Array.from(familyMembers)
      .map(member => {
        // Count contracts with trimmed family member names for accurate counting
        const count = contracts.filter(c => c.familyMember?.trim() === member).length;
        return {
          title: member,
          value: count,
          icon: User, // Using User icon for family members
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          clickable: count > 0,
          filterType: 'familyMember',
          filterValue: member
        };
      })
      .sort((a, b) => (b.value as number) - (a.value as number)); // Sort by count descending
  };

  const generateCompanyStats = (): StatItem[] => {
    // Extract unique companies from contracts
    const companies = new Set<string>();
    contracts.forEach(contract => {
      if (contract.company?.trim()) {
        companies.add(contract.company.trim());
      }
    });

    console.log('All company names found:', Array.from(companies).sort());
    console.log('All contracts with company names:', contracts.map(c => ({ name: c.name, company: c.company })).filter(c => c.company));

    return Array.from(companies)
      .map(company => {
        // Count contracts with trimmed company names for accurate counting
        const count = contracts.filter(c => c.company?.trim() === company).length;
        return {
          title: company,
          value: count,
          icon: Building2, // Using Building2 icon for companies
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          clickable: count > 0,
          filterType: 'company',
          filterValue: company
        };
      })
      .sort((a, b) => (b.value as number) - (a.value as number)); // Sort by count descending
  };

  const stats: StatItem[] = [
    {
      title: 'Total Contracts',
      value: contracts.length,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      clickable: true,
      filterType: 'viewMode',
      filterValue: 'all',
    },
    {
      title: 'Active Contracts',
      value: activeContracts.length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      clickable: true,
      filterType: 'viewMode',
      filterValue: 'active',
    },
    {
      title: 'Needs Attention',
      value: contracts.filter(c => c.needsMoreInfo || c.draft).length,
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      clickable: true,
      filterType: 'viewMode',
      filterValue: 'needsAttention',
    },

    {
      title: filteredContracts ? 'Filtered Monthly Spend' : 'Total Monthly Spend',
      value: `$${(filteredContracts ?? contracts)
        .filter(c => c.status === 'active')
        .reduce((total, contract) => {
          switch (contract.frequency) {
            case 'monthly':
              return total + contract.amount;
            case 'quarterly':
              return total + (contract.amount / 3);
            case 'yearly':
              return total + (contract.amount / 12);
            case 'weekly':
              return total + (contract.amount * 4.33);
            case 'bi-weekly':
              return total + (contract.amount * 2.17);
            case 'one-time':
              return total + (contract.amount / 12); // Spread over a year
            default:
              return total;
          }
        }, 0)
        .toFixed(0)}`,
      icon: Coins,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      clickable: false,
    },

    ...generateCategoryStats(),
  ];

  // Helper function to render a compact stat card
  const renderCompactStatCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'viewMode' && (
        (stat.filterValue === 'all' && !activeFilters.status && !activeFilters.needsMoreInfo) ||
        (stat.filterValue === 'active' && activeFilters.status === 'active') ||
        (stat.filterValue === 'needsAttention' && activeFilters.needsMoreInfo === true)
      )) ||
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue) ||
      (stat.filterType === 'pinned' && activeFilters.pinned === (stat.filterValue === 'true'))
    );
    
    return (
      <Card 
        key={`compact-${stat.filterType}-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-200 ${
          stat.clickable && onFilter ? 'cursor-pointer hover:scale-[1.02] border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary bg-primary/5 border-primary/50' : ''}`} 
        onClick={stat.clickable && onFilter ? () => onFilter(stat.filterType!, stat.filterValue!) : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`${stat.bgColor} p-2 rounded-lg flex-shrink-0`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground leading-tight truncate">
                {stat.title}
              </p>
              <p className="text-lg font-bold text-foreground leading-tight">
                {stat.value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Helper function to render a stat card
  const renderStatCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'viewMode' && (
        (stat.filterValue === 'all' && !activeFilters.status && !activeFilters.needsMoreInfo) ||
        (stat.filterValue === 'active' && activeFilters.status === 'active') ||
        (stat.filterValue === 'needsAttention' && activeFilters.needsMoreInfo === true)
      )) ||
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue) ||
      (stat.filterType === 'pinned' && activeFilters.pinned === (stat.filterValue === 'true'))
    );
    
    const cardContent = (
      <Card 
        key={`${stat.filterType}-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 animate-fade-in ${
          stat.clickable && onFilter ? 'cursor-pointer hover:scale-105 border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary bg-primary/5 border-primary/50' : ''}`} 
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={stat.clickable && onFilter ? () => onFilter(stat.filterType!, stat.filterValue!) : undefined}
      >
        <CardContent className="p-2">
          <div className="flex flex-col items-center text-center space-y-1">
            <div className={`${stat.bgColor} p-1.5 rounded-lg mb-1`}>
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-medium text-muted-foreground leading-tight">
                {stat.title}
              </p>

            </div>
            <p className="text-base font-bold text-foreground leading-tight">
              {stat.value}
            </p>
          </div>
        </CardContent>
      </Card>
    );

    // If the stat has a tooltip, wrap it with a tooltip
    if (stat.tooltip) {
      return (
        <TooltipProvider key={`${stat.filterType}-${index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              {cardContent}
            </TooltipTrigger>
            <TooltipContent>
              <p>{stat.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
  };

  // Helper function to render compact category, family member, and company cards
  const renderCategoryCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue) ||
      (stat.filterType === 'familyMember' && activeFilters.familyMember === stat.filterValue) ||
      (stat.filterType === 'company' && activeFilters.company === stat.filterValue)
    );
    
    return (
      <Card 
        key={`${stat.filterType}-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-200 ${
          stat.clickable && onFilter ? 'cursor-pointer hover:scale-[1.02] border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary bg-primary/5 border-primary/50' : ''}`} 
        onClick={stat.clickable && onFilter ? () => onFilter(stat.filterType!, stat.filterValue!) : undefined}
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
    <div className="mb-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="quickFilters" className="text-xs sm:text-sm">Quick Filters</TabsTrigger>
          <TabsTrigger value="companies" className="text-xs sm:text-sm">Show by Company</TabsTrigger>
          <TabsTrigger value="persons" className="text-xs sm:text-sm">Show by Person</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs sm:text-sm">Advanced Filters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quickFilters" className="space-y-3">
          {/* Quick Filter - Categories Only */}
          <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Filter by Category</h3>
              <span className="text-xs text-muted-foreground">Click to filter</span>
            </div>
            
            {/* Categories Only */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {stats.filter(stat => stat.filterType === 'category')
                .filter(stat => typeof stat.value === 'number' && stat.value > 0)
                .sort((a, b) => (b.value as number) - (a.value as number))
                .map((stat, index) => renderCategoryCard(stat, index))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="companies" className="space-y-3">
          {/* Company Filter */}
          <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Filter by Company</h3>
              <span className="text-xs text-muted-foreground">Click to filter</span>
            </div>
            
            {/* Company Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {generateCompanyStats().map((stat, index) => renderCategoryCard(stat, index))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="persons" className="space-y-3">
          {/* Person Filter */}
          <div className="p-3 bg-muted/10 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Filter by Person</h3>
              <span className="text-xs text-muted-foreground">Click to filter</span>
            </div>
            
            {/* Person Filter Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {generateFamilyMemberStats().map((stat, index) => renderCategoryCard(stat, index))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="filters" className="space-y-2">
          {/* Advanced Filters Section */}
          <div className="w-full">
            <ContractFilters 
              filters={filters} 
              onFiltersChange={onFiltersChange} 
              availableTags={availableTags}
              existingContracts={contracts}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};