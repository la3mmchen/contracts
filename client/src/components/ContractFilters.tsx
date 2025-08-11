import { useState } from 'react';
import { ContractFilters as FilterType } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ContractFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableTags?: string[];
}

export const ContractFilters = ({ filters, onFiltersChange, availableTags = [] }: ContractFiltersProps) => {
  const updateFilter = (key: keyof FilterType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof FilterType) => {
    updateFilter(key, undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      status: undefined,
      category: undefined,
      frequency: undefined,
      tags: undefined,
      needsMoreInfo: undefined,
      sortBy: 'name'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.frequency) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.needsMoreInfo !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Clear All Button */}
      {activeFilterCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear All ({activeFilterCount})
          </Button>
        </div>
      )}

      {/* All Filter Options - Always Visible */}
      <div className="bg-muted/50 rounded-lg p-4 border w-full">
        <div className="w-full" style={{ whiteSpace: 'nowrap' }}>
          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
            <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="category-filter" className="text-sm font-medium">Category</Label>
            <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}>
              <SelectTrigger id="category-filter" className="w-full">
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

          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="frequency-filter" className="text-sm font-medium">Frequency</Label>
            <Select value={filters.frequency || 'all'} onValueChange={(value) => updateFilter('frequency', value === 'all' ? undefined : value)}>
              <SelectTrigger id="frequency-filter" className="w-full">
                <SelectValue placeholder="All Frequencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="needs-info-filter" className="text-sm font-medium">Info Status</Label>
            <Select value={filters.needsMoreInfo === true ? 'yes' : filters.needsMoreInfo === false ? 'no' : 'all'} onValueChange={(value) => updateFilter('needsMoreInfo', value === 'all' ? undefined : value === 'yes')}>
              <SelectTrigger id="needs-info-filter" className="w-full">
                <SelectValue placeholder="All Info" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Info</SelectItem>
                <SelectItem value="yes">Needs Info</SelectItem>
                <SelectItem value="no">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="tags-filter" className="text-sm font-medium">Tags</Label>
            <Select 
              value={filters.tags?.length ? filters.tags[0] : 'all'} 
              onValueChange={(value) => {
                if (value === 'all') {
                  updateFilter('tags', undefined);
                } else {
                  updateFilter('tags', [value]);
                }
              }}
            >
              <SelectTrigger id="tags-filter" className="w-full">
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

          <div className="inline-block w-[16.666%] pr-2">
            <Label htmlFor="sort-filter" className="text-sm font-medium">Sort By</Label>
            <Select value={filters.sortBy || 'name'} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger id="sort-filter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="nextPaymentDate">Next Payment</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('searchTerm')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {getCategoryDisplayName(filters.category)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.frequency && (
            <Badge variant="secondary" className="gap-1">
              Frequency: {filters.frequency}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('frequency')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tags: {filters.tags.join(', ')}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('tags')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.needsMoreInfo !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Info Status: {filters.needsMoreInfo ? 'Needs Info' : 'Complete'}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter('needsMoreInfo')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};