import { useState } from 'react';
import { ContractFilters as FilterType } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { getStatuses, getStatusDisplayName } from '@/config/statuses';
import { getFrequencies, getFrequencyDisplayName } from '@/config/frequencies';
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
      pinned: undefined,
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
    if (filters.pinned !== undefined) count++;
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

      {/* All Filter Options - Responsive Layout */}
      <div className="bg-muted/50 rounded-lg p-4 border w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
            <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
              <SelectTrigger id="status-filter" className="w-full">
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

          <div>
            <Label htmlFor="frequency-filter" className="text-sm font-medium">Frequency</Label>
            <Select value={filters.frequency || 'all'} onValueChange={(value) => updateFilter('frequency', value === 'all' ? undefined : value)}>
              <SelectTrigger id="frequency-filter" className="w-full">
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
            <Label htmlFor="needs-more-info-filter" className="text-sm font-medium">Needs More Info</Label>
            <Select value={filters.needsMoreInfo === undefined ? 'all' : filters.needsMoreInfo.toString()} onValueChange={(value) => updateFilter('needsMoreInfo', value === 'all' ? undefined : value === 'true')}>
              <SelectTrigger id="needs-more-info-filter" className="w-full">
                <SelectValue placeholder="All Contracts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contracts</SelectItem>
                <SelectItem value="true">Needs More Info</SelectItem>
                <SelectItem value="false">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pinned-filter" className="text-sm font-medium">Pinned</Label>
            <Select value={filters.pinned === undefined ? 'all' : filters.pinned.toString()} onValueChange={(value) => updateFilter('pinned', value === 'all' ? undefined : value === 'true')}>
              <SelectTrigger id="pinned-filter" className="w-full">
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
            <Label htmlFor="tags-filter" className="text-sm font-medium">Tags</Label>
            <Select value={filters.tags?.[0] || 'all'} onValueChange={(value) => updateFilter('tags', value === 'all' ? undefined : [value])}>
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
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('status')}>
              Status: {filters.status}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('category')}>
              Category: {filters.category}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.frequency && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('frequency')}>
              Frequency: {filters.frequency}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.needsMoreInfo !== undefined && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('needsMoreInfo')}>
              Needs More Info: {filters.needsMoreInfo ? 'Yes' : 'No'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.pinned !== undefined && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('pinned')}>
              Pinned: {filters.pinned ? 'Yes' : 'No'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => clearFilter('tags')}>
              Tags: {filters.tags.join(', ')}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};