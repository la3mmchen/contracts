import React, { useState, useEffect, useRef } from 'react';
import { Contract } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { getStatuses, getStatusDisplayName } from '@/config/statuses';
import { getFrequencies, getFrequencyDisplayName } from '@/config/frequencies';
import { getCurrencies, getCurrencyDisplayName } from '@/config/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, X, FileEdit } from 'lucide-react';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>, priceChangeReason?: string) => void;
  onCancel: () => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export const ContractForm = ({ contract, onSubmit, onCancel, onDirtyStateChange }: ContractFormProps) => {
  const isEditing = !!contract;
  
  // Get available options and determine smart defaults
  const availableCategories = getCategories();
  const availableStatuses = getStatuses();
  const availableFrequencies = getFrequencies();
  
  // Smart defaults that ensure valid values
  const smartDefaultCategory = availableCategories.length > 0 ? availableCategories[0] : 'other';
  const smartDefaultStatus = availableStatuses.length > 0 ? availableStatuses[0] : 'active';
  const smartDefaultFrequency = availableFrequencies.length > 0 ? availableFrequencies[0] : 'monthly';
  
  // Debug warnings if no options are available
  if (availableCategories.length === 0) {
    console.warn('ContractForm: No categories available, using fallback "other"');
  }
  if (availableStatuses.length === 0) {
    console.warn('ContractForm: No statuses available, using fallback "active"');
  }
  if (availableFrequencies.length === 0) {
    console.warn('ContractForm: No frequencies available, using fallback "monthly"');
  }
  
  const [formData, setFormData] = useState({
    contractId: contract?.contractId || '',
    name: contract?.name || '',
    company: contract?.company || '',
    description: contract?.description || '',
    startDate: contract?.startDate || new Date().toISOString().split('T')[0],
    endDate: contract?.endDate || '',
    amount: contract?.amount || '',
    currency: contract?.currency || 'USD',
    frequency: contract?.frequency || smartDefaultFrequency as Contract['frequency'],
    status: contract?.status || smartDefaultStatus as Contract['status'],
    category: contract?.category || smartDefaultCategory as Contract['category'],
    payDate: contract?.payDate || '',
    contactInfo: {
      email: contract?.contactInfo.email || '',
      phone: contract?.contactInfo.phone || '',
      address: contract?.contactInfo.address || '',
      website: contract?.contactInfo.website || '',
      contactPerson: contract?.contactInfo.contactPerson || '',
    },
    notes: contract?.notes || '',
    tags: contract?.tags?.join(', ') || '',
    needsMoreInfo: contract?.needsMoreInfo || false,
    pinned: contract?.pinned || false,
    draft: contract?.draft || false,
    customFields: contract?.customFields || {},
    documentLink: contract?.documentLink || '',
    priceChangeReason: '',
  });

  // Track initial form data for dirty state detection
  const initialFormData = useRef({
    contractId: contract?.contractId || '',
    name: contract?.name || '',
    company: contract?.company || '',
    description: contract?.description || '',
    startDate: contract?.startDate || new Date().toISOString().split('T')[0],
    endDate: contract?.endDate || '',
    amount: contract?.amount || '',
    currency: contract?.currency || 'USD',
    frequency: contract?.frequency || smartDefaultFrequency as Contract['frequency'],
    status: contract?.status || smartDefaultStatus as Contract['status'],
    category: contract?.category || smartDefaultCategory as Contract['category'],
    payDate: contract?.payDate || '',
    contactInfo: {
      email: contract?.contactInfo.email || '',
      phone: contract?.contactInfo.phone || '',
      address: contract?.contactInfo.address || '',
      website: contract?.contactInfo.website || '',
      contactPerson: contract?.contactInfo.contactPerson || '',
    },
    notes: contract?.notes || '',
    tags: contract?.tags?.join(', ') || '',
    needsMoreInfo: contract?.needsMoreInfo || false,
    pinned: contract?.pinned || false,
    customFields: contract?.customFields || {},
    documentLink: contract?.documentLink || '',
    priceChangeReason: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [customFieldIds, setCustomFieldIds] = useState<string[]>([]);
  const [customFieldNames, setCustomFieldNames] = useState<Record<string, string>>({});
  const [customFieldError, setCustomFieldError] = useState<string>('');

  // Initialize custom field IDs and names from existing custom fields
  useEffect(() => {
    if (contract?.customFields) {
      const keys = Object.keys(contract.customFields);
      setCustomFieldIds(keys);
      
      // Create a mapping where the key is the field name and value is the field value
      const fieldNames: Record<string, string> = {};
      const fieldValues: Record<string, string> = {};
      
      keys.forEach(key => {
        fieldNames[key] = key; // Use the key as both name and ID
        fieldValues[key] = contract.customFields[key];
      });
      
      setCustomFieldNames(fieldNames);
      setFormData(prev => ({
        ...prev,
        customFields: fieldValues
      }));
    }
  }, [contract?.customFields]);

  // Check if form is dirty (has unsaved changes)
  const checkDirtyState = (newFormData: typeof formData) => {
    const isFormDirty = JSON.stringify(newFormData) !== JSON.stringify(initialFormData.current);
    if (isFormDirty !== isDirty) {
      setIsDirty(isFormDirty);
      onDirtyStateChange?.(isFormDirty);
    }
  };

  // Update formData and check dirty state
  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    checkDirtyState(newFormData);
  };

  // Check for duplicate custom field names
  const checkForDuplicateFields = (): boolean => {
    const fieldNames = Object.values(customFieldNames).filter(name => name.trim() !== '');
    const uniqueNames = new Set(fieldNames);
    
    if (fieldNames.length !== uniqueNames.size) {
      setCustomFieldError('Duplicate field names are not allowed. Please ensure each custom field has a unique name.');
      return true;
    }
    
    setCustomFieldError('');
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate field names
    if (checkForDuplicateFields()) {
      return; // Stop submission if duplicates found
    }
    
    // Convert custom fields from ID-based structure to key-value pairs
    const finalCustomFields: Record<string, string> = {};
    customFieldIds.forEach(id => {
      if (customFieldNames[id] && customFieldNames[id].trim() !== '') {
        finalCustomFields[customFieldNames[id].trim()] = formData.customFields[id] || '';
      }
    });
    
    const contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      customFields: finalCustomFields,
    };
    
    // Reset dirty state after successful submission
    setIsDirty(false);
    onDirtyStateChange?.(false);
    
    onSubmit(contractData, formData.priceChangeReason);
  };

  // Get available options from config
  const currencies = getCurrencies();
  const statuses = getStatuses();
  const frequencies = getFrequencies();

  // Helper function to show required indicator
  const showRequired = (fieldName: string) => {
    if (formData.draft) return false;
    const requiredFields = ['company', 'startDate', 'amount', 'currency', 'frequency', 'status', 'category'];
    return requiredFields.includes(fieldName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Smart Header */}
      {isEditing && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileEdit className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Full Form Edit Mode</p>
              <p>You're editing all fields at once. This is perfect for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>Changing multiple fields simultaneously</li>
                <li>Major contract updates or corrections</li>
                <li>Mobile users (better on small screens)</li>
                <li>Complex validation and error checking</li>
              </ul>
              <p className="text-amber-600 dark:text-amber-400 mt-2 text-xs">
                💡 For quick single-field updates, close this and use inline editing instead!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractId">Contract ID</Label>
              <Input
                id="contractId"
                value={formData.contractId}
                onChange={(e) => updateFormData({ contractId: e.target.value })}
                placeholder="e.g., NETFLIX-2024-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Contract Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="e.g., Netflix Subscription"
                required
              />
            </div>
          </div>

            <div>
              <Label htmlFor="company">
                Company
                {showRequired('company') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => updateFormData({ company: e.target.value })}
                placeholder="e.g., Netflix Inc."
                required={!formData.draft}
              />
            </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Brief description of the contract"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="draft"
              type="checkbox"
              checked={formData.draft}
              onChange={(e) => updateFormData({ draft: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="draft" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Draft Contract
            </Label>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Draft contracts only require a name and ID. Other fields can be filled in later.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">
                Start Date
                {showRequired('startDate') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                required={!formData.draft}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">
                Amount
                {showRequired('amount') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateFormData({ amount: e.target.value || '' })}
                placeholder="0.00"
                required={!formData.draft}
              />
            </div>
            <div>
              <Label htmlFor="currency">
                Currency
                {showRequired('currency') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => updateFormData({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {getCurrencyDisplayName(currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">
                Frequency
                {showRequired('frequency') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => updateFormData({ frequency: value as Contract['frequency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((frequency) => (
                    <SelectItem key={frequency} value={frequency}>
                      {getFrequencyDisplayName(frequency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Change Reason - Only show when amount has changed */}
          {contract && formData.amount !== contract.amount.toString() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceChangeReason">Reason for Price Change</Label>
                <Input
                  id="priceChangeReason"
                  type="text"
                  value={formData.priceChangeReason}
                  onChange={(e) => updateFormData({ priceChangeReason: e.target.value })}
                  placeholder="e.g., Annual price increase, Plan upgrade, etc."
                  maxLength={100}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">
                Status
                {showRequired('status') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData({ status: value as Contract['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">
                Category
                {showRequired('category') && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData({ category: value as Contract['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="payDate">Pay Date (Optional)</Label>
            <Input
              id="payDate"
              type="date"
              value={formData.payDate}
              onChange={(e) => updateFormData({ payDate: e.target.value })}
              placeholder="Leave empty for auto-calculation"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to automatically calculate based on start date and frequency
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactInfo.contactPerson}
                onChange={(e) => updateFormData({ 
                  contactInfo: { ...formData.contactInfo, contactPerson: e.target.value }
                })}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => updateFormData({ 
                  contactInfo: { ...formData.contactInfo, email: e.target.value }
                })}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.contactInfo.phone}
                onChange={(e) => updateFormData({ 
                  contactInfo: { ...formData.contactInfo, phone: e.target.value }
                })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.contactInfo.website}
              onChange={(e) => updateFormData({ 
                contactInfo: { ...formData.contactInfo, website: e.target.value }
              })}
              placeholder="https://www.company.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.contactInfo.address}
              onChange={(e) => updateFormData({ 
                contactInfo: { ...formData.contactInfo, address: e.target.value }
              })}
              placeholder="123 Main St, City, State, ZIP"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="documentLink">Document Management Link</Label>
            <Input
              id="documentLink"
              type="url"
              value={formData.documentLink}
              onChange={(e) => updateFormData({ documentLink: e.target.value })}
              placeholder="https://docs.company.com/contract/123 or https://drive.google.com/file/..."
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateFormData({ tags: e.target.value })}
              placeholder="e.g., streaming, entertainment, monthly (comma-separated)"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              placeholder="Additional notes about this contract"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="needsMoreInfo"
              type="checkbox"
              checked={formData.needsMoreInfo}
              onChange={(e) => updateFormData({ needsMoreInfo: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="needsMoreInfo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Needs More Information
            </Label>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Check this box if you need to gather more details about this contract
          </p>

          <div className="flex items-center space-x-2">
            <input
              id="pinned"
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => updateFormData({ pinned: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="pinned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Pin Contract
            </Label>
          </div>
          <p className="text-sm text-muted-foreground -mt-2">
            Pinned contracts will appear at the top of your contract list
          </p>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newId = `field_${customFieldIds.length + 1}`;
                  setCustomFieldIds(prev => [...prev, newId]);
                  setCustomFieldNames(prev => ({ ...prev, [newId]: '' }));
                  updateFormData({
                    customFields: { ...formData.customFields, [newId]: '' }
                  });
                  setCustomFieldError(''); // Clear error when adding new field
                }}
                className="h-8 px-3"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Field
              </Button>
            </div>
            
            {customFieldError && (
              <div className="mb-3 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {customFieldError}
              </div>
            )}
            
            {customFieldIds.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed border-muted rounded-lg">
                No custom fields added yet. Click "Add Field" to add custom information like contract numbers, login URLs, etc.
              </div>
            ) : (
              <div className="space-y-3">
                {customFieldIds.map((id, index) => (
                  <div key={id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Field name (e.g., Contract Number, Login URL)"
                        value={customFieldNames[id] || ''}
                        onChange={(e) => {
                          const newCustomFieldNames = { ...customFieldNames };
                          newCustomFieldNames[id] = e.target.value;
                          setCustomFieldNames(newCustomFieldNames);
                          setCustomFieldError(''); // Clear error when user types
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Field value"
                        value={formData.customFields[id] || ''}
                        onChange={(e) => {
                          updateFormData({
                            customFields: { ...formData.customFields, [id]: e.target.value }
                          });
                        }}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCustomFields = { ...formData.customFields };
                        delete newCustomFields[id];
                        setCustomFieldIds(prev => prev.filter(fid => fid !== id));
                        setCustomFieldNames(prev => {
                          const newNames = { ...prev };
                          delete newNames[id];
                          return newNames;
                        });
                        updateFormData({ customFields: newCustomFields });
                        setCustomFieldError(''); // Clear error when removing field
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          style={{ 
            background: 'linear-gradient(135deg, #42929D, #3a7bc8)',
            color: 'white'
          }}
        >
          {contract ? 'Update Contract' : formData.draft ? 'Create Draft' : 'Add Contract'}
        </Button>
      </div>
    </form>
  );
};