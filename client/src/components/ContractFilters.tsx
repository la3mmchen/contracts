import { useState } from 'react';
import { ContractFilters as FilterType, Contract } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { getStatuses, getStatusDisplayName } from '@/config/statuses';
import { getFrequencies, getFrequencyDisplayName } from '@/config/frequencies';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ContractFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  availableTags?: string[];
  existingContracts?: Contract[];
}

export const ContractFilters = ({ filters, onFiltersChange, availableTags = [], existingContracts = [] }: ContractFiltersProps) => {
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
    if (filters.hasAdditionalFields !== undefined) count++;
    if (filters.optimizable !== undefined) count++;
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
        {/* Row 1: Core Contract Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            <Label htmlFor="company-filter" className="text-sm font-medium">Company</Label>
            <Select value={filters.company || 'all'} onValueChange={(value) => updateFilter('company', value === 'all' ? undefined : value)}>
              <SelectTrigger id="company-filter" className="w-full">
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
        </div>

        {/* Row 2: Metadata Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="needs-more-info-filter" className="text-sm font-medium">Contract Status</Label>
            <Select value={(() => {
              if (filters.needsMoreInfo === true) return 'true';
              if (filters.optimizable === true) return 'optimizable';
              if (filters.needsMoreInfo === false) return 'false';
              return 'all';
            })()} onValueChange={(value) => {
              if (value === 'all') {
                // Batch update: clear both filters at once
                const newFilters = { ...filters, needsMoreInfo: undefined, optimizable: undefined };
                onFiltersChange(newFilters);
              } else if (value === 'true') {
                // Batch update: set needsMoreInfo and clear optimizable
                const newFilters = { ...filters, needsMoreInfo: true, optimizable: undefined };
                onFiltersChange(newFilters);
              } else if (value === 'false') {
                // Batch update: set needsMoreInfo to false and clear optimizable
                const newFilters = { ...filters, needsMoreInfo: false, optimizable: undefined };
                onFiltersChange(newFilters);
              } else if (value === 'optimizable') {
                // Batch update: set optimizable and clear needsMoreInfo
                const newFilters = { ...filters, needsMoreInfo: undefined, optimizable: true };
                onFiltersChange(newFilters);
              }
            }}>
              <SelectTrigger id="needs-more-info-filter" className="w-full">
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
            <Label htmlFor="additional-fields-filter" className="text-sm font-medium">Additional Fields</Label>
            <Select value={filters.hasAdditionalFields === undefined ? 'all' : filters.hasAdditionalFields.toString()} onValueChange={(value) => updateFilter('hasAdditionalFields', value === 'all' ? undefined : value === 'true')}>
              <SelectTrigger id="additional-fields-filter" className="w-full">
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

      {/* Active Filters display removed (redundant with header badges) */}
    </div>
  );
};