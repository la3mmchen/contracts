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
  Building2
} from 'lucide-react';

interface ContractStatsProps {
  contracts: Contract[];
  onFilter?: (filterType: string, value: string) => void;
  activeFilters?: {
    status?: string;
    category?: string;
    needsMoreInfo?: boolean;
    pinned?: boolean;
  };
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableTags: string[];
}

export const ContractStats = ({ 
  contracts, 
  onFilter, 
  activeFilters, 
  filters, 
  onFiltersChange, 
  availableTags 
}: ContractStatsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Reset filters when switching tabs
    if (onFilter) {
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

  const stats: StatItem[] = [
    {
      title: 'Total Contracts',
      value: contracts.length,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      clickable: true,
      filterType: 'reset',
      filterValue: '',
    },
    {
      title: 'Active Contracts',
      value: activeContracts.length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      clickable: true,
      filterType: 'status',
      filterValue: 'active',
    },
    {
      title: 'Needs Attention',
      value: contracts.filter(c => c.needsMoreInfo || c.draft).length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      clickable: true,
      filterType: 'needsMoreInfo',
      filterValue: 'true',
    },
    {
      title: 'Monthly Spend',
      value: `$${contracts
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
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      clickable: false,
      tooltip: 'Rough estimate • Based on active contracts only • For planning purposes',
    },

    ...generateCategoryStats(),
  ];

  // Helper function to render a stat card
  const renderStatCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'status' && activeFilters.status === stat.filterValue) ||
      (stat.filterType === 'reset' && !activeFilters.status && !activeFilters.category && !activeFilters.pinned) ||
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue) ||
      (stat.filterType === 'needsMoreInfo' && activeFilters.needsMoreInfo === (stat.filterValue === 'true')) ||
      (stat.filterType === 'pinned' && activeFilters.pinned === (stat.filterValue === 'true'))
    );
    
    const cardContent = (
      <Card 
        key={`${stat.filterType}-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 animate-fade-in ${
          stat.clickable && onFilter ? 'cursor-pointer hover:scale-105 border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary' : ''}`} 
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

  // Helper function to render compact category cards
  const renderCategoryCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && activeFilters.category === stat.filterValue;
    
    return (
      <Card 
        key={`category-${index}`}
        className={`bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 animate-fade-in ${
          stat.clickable && onFilter ? 'cursor-pointer hover:scale-105 border-primary/30 hover:border-primary/50' : ''
        } ${isActive ? 'ring-2 ring-primary' : ''}`} 
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={stat.clickable && onFilter ? () => onFilter(stat.filterType!, stat.filterValue!) : undefined}
      >
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`${stat.bgColor} p-1 rounded`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {stat.value}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mb-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs sm:text-sm">Filters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-2">
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {stats.filter(stat => stat.filterType !== 'category').map((stat, index) => 
              renderStatCard(stat, index)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-2">
          {/* Category Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {stats.filter(stat => stat.filterType === 'category')
              .filter(stat => typeof stat.value === 'number' && stat.value > 0)
              .sort((a, b) => (b.value as number) - (a.value as number))
              .map((stat, index) => renderCategoryCard(stat, index))}
          </div>
        </TabsContent>
        
        <TabsContent value="filters" className="space-y-2">
          {/* Filters Section */}
          <div className="w-full">
            <ContractFilters 
              filters={filters} 
              onFiltersChange={onFiltersChange} 
              availableTags={availableTags}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};