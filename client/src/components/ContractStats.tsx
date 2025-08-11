import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Contract, ContractFilters as FilterType } from '@/types/contract';
import { ContractFilters } from '@/components/ContractFilters';
import { isValidCategory } from '@/lib/utils';
import { 
  TrendingUp, 
  Calendar, 
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
  };

  const generateCategoryStats = (): StatItem[] => {
    const categories = ['subscription', 'insurance', 'utilities', 'house', 'services', 'software', 'maintenance', 'other', 'marketing'];
    const categoryIcons = {
      subscription: Coins,
      insurance: AlertTriangle,
      utilities: DollarSign,
      house: Building2,
      services: Tag,
      software: TrendingUp,
      maintenance: TrendingUp,
      other: Tag,
      marketing: TrendingUp
    };
    const categoryColors = {
      subscription: 'text-blue-600',
      insurance: 'text-green-600',
      utilities: 'text-purple-600',
      house: 'text-orange-600',
      services: 'text-indigo-600',
      software: 'text-pink-600',
      maintenance: 'text-yellow-600',
      other: 'text-gray-600',
      marketing: 'text-red-600'
    };
    const categoryBgColors = {
      subscription: 'bg-blue-100',
      insurance: 'bg-green-100',
      utilities: 'bg-purple-100',
      house: 'bg-orange-100',
      services: 'bg-indigo-100',
      software: 'bg-pink-100',
      maintenance: 'bg-yellow-100',
      other: 'bg-gray-100',
      marketing: 'bg-red-100'
    };

    return categories.map(category => {
      const count = contracts.filter(c => c.category === category).length;
      const Icon = categoryIcons[category as keyof typeof categoryIcons] || Tag;
      const color = categoryColors[category as keyof typeof categoryColors] || 'text-gray-600';
      const bgColor = categoryBgColors[category as keyof typeof categoryBgColors] || 'bg-gray-100';

      return {
        title: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        icon: Icon,
        color,
        bgColor,
        clickable: true,
        filterType: 'category',
        filterValue: category,
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
      title: 'Needs More Info',
      value: contracts.filter(c => c.needsMoreInfo).length,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      clickable: true,
      filterType: 'needsMoreInfo',
      filterValue: 'true',
    },

    ...generateCategoryStats(),
  ];

  // Helper function to render a stat card
  const renderStatCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'status' && activeFilters.status === stat.filterValue) ||
      (stat.filterType === 'reset' && !activeFilters.status && !activeFilters.category) ||
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue) ||
      (stat.filterType === 'needsMoreInfo' && activeFilters.needsMoreInfo === (stat.filterValue === 'true'))
    );
    
    return (
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-2">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stats.filter(stat => stat.filterType !== 'category').map((stat, index) => 
              renderStatCard(stat, index)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-2">
          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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