import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Contract } from '@/types/contract';
import { 
  Coins, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Info,
  Home,
  Car,
  Wifi,
  Shield,
  Heart,
  Briefcase,
  Settings,
  Palette,
  MoreHorizontal
} from 'lucide-react';

interface ContractStatsProps {
  contracts: Contract[];
  onFilter?: (filterType: string, value: string) => void;
  activeFilters?: {
    status?: string;
    category?: string;
  };
}

export const ContractStats = ({ contracts, onFilter, activeFilters }: ContractStatsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Reset filters when switching tabs
    if (onFilter) {
      onFilter('reset', '');
    }
  };
  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiredContracts = contracts.filter(c => c.status === 'expired');
  
  const totalMonthlySpend = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, contract) => {
      let monthlyAmount = 0;
      switch (contract.frequency) {
        case 'monthly':
          monthlyAmount = contract.amount;
          break;
        case 'quarterly':
          monthlyAmount = contract.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = contract.amount / 12;
          break;
        case 'weekly':
          monthlyAmount = contract.amount * 4.33;
          break;
        case 'bi-weekly':
          monthlyAmount = contract.amount * 2.17;
          break;
        default:
          monthlyAmount = 0;
      }
      return sum + monthlyAmount;
    }, 0);

  const totalYearlySpend = totalMonthlySpend * 12;

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
      insurance: Shield,
      utilities: Wifi,
      house: Home,
      services: Briefcase,
      software: Settings,
      maintenance: Settings,
      other: MoreHorizontal,
      marketing: Palette
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
      const Icon = categoryIcons[category as keyof typeof categoryIcons] || MoreHorizontal;
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
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      clickable: true,
      filterType: 'status',
      filterValue: 'active',
    },
    {
      title: 'Expired Contracts',
      value: expiredContracts.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      clickable: true,
      filterType: 'status',
      filterValue: 'expired',
    },
    {
      title: 'Monthly Spend',
      value: `$${totalMonthlySpend.toFixed(2)}`,
      icon: Coins,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      clickable: false,
    },
    ...generateCategoryStats(),
  ];

  // Helper function to render a stat card
  const renderStatCard = (stat: StatItem, index: number) => {
    const isActive = activeFilters && (
      (stat.filterType === 'status' && activeFilters.status === stat.filterValue) ||
      (stat.filterType === 'reset' && !activeFilters.status && !activeFilters.category) ||
      (stat.filterType === 'category' && activeFilters.category === stat.filterValue)
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
        <CardContent className="p-3">
          <div className="flex flex-col items-center text-center space-y-1">
            <div className={`${stat.bgColor} p-2 rounded-lg mb-1`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-medium text-muted-foreground leading-tight">
                {stat.title}
              </p>
              {(stat.title === 'Monthly Spend' || stat.title === 'Yearly Spend') && (
                <div className="relative group">
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Different currencies are not considered in this total
                  </div>
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-foreground leading-tight">
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
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-2">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
      </Tabs>
    </div>
  );
};