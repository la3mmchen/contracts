import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Contract, ContractFilters as FilterType } from '@/types/contract';
import { getCategoryStatsColor } from '@/lib/utils';
import { getCategories } from '@/config/categories';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Tag, 
  Coins
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
          const amount = contract.amount ?? 0;
          switch (contract.frequency) {
            case 'monthly':
              return total + amount;
            case 'quarterly':
              return total + (amount / 3);
            case 'yearly':
              return total + (amount / 12);
            case 'weekly':
              return total + (amount * 4.33);
            case 'bi-weekly':
              return total + (amount * 2.17);
            case 'one-time':
              return total + (amount / 12); // Spread over a year
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



  return (
    <div className="mb-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-4">
        {stats.map((stat, index) => renderCompactStatCard(stat, index))}
      </div>
    </div>
  );
};