import React, { useState, useEffect, useRef } from 'react';
import { Contract } from '@/types/contract';
import { getCategories, getCategoryDisplayName } from '@/config/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}

export const ContractForm = ({ contract, onSubmit, onCancel, onDirtyStateChange }: ContractFormProps) => {
  const [formData, setFormData] = useState({
    contractId: contract?.contractId || '',
    name: contract?.name || '',
    company: contract?.company || '',
    description: contract?.description || '',
    startDate: contract?.startDate || new Date().toISOString().split('T')[0],
    endDate: contract?.endDate || '',
    amount: contract?.amount || 0,
    currency: contract?.currency || 'USD',
    frequency: contract?.frequency || 'monthly' as Contract['frequency'],
    status: contract?.status || 'active' as Contract['status'],
    category: contract?.category || 'other' as Contract['category'],
    payDate: contract?.payDate || '',
    contactInfo: {
      email: contract?.contactInfo.email || '',
      phone: contract?.contactInfo.phone || '',
      address: contract?.contactInfo.address || '',
      website: contract?.contactInfo.website || '',
    },
    notes: contract?.notes || '',
    tags: contract?.tags?.join(', ') || '',
    documentLink: contract?.documentLink || '',
  });

  // Track initial form data for dirty state detection
  const initialFormData = useRef({
    contractId: contract?.contractId || '',
    name: contract?.name || '',
    company: contract?.company || '',
    description: contract?.description || '',
    startDate: contract?.startDate || new Date().toISOString().split('T')[0],
    endDate: contract?.endDate || '',
    amount: contract?.amount || 0,
    currency: contract?.currency || 'USD',
    frequency: contract?.frequency || 'monthly' as Contract['frequency'],
    status: contract?.status || 'active' as Contract['status'],
    category: contract?.category || 'other' as Contract['category'],
    payDate: contract?.payDate || '',
    contactInfo: {
      email: contract?.contactInfo.email || '',
      phone: contract?.contactInfo.phone || '',
      address: contract?.contactInfo.address || '',
      website: contract?.contactInfo.website || '',
    },
    notes: contract?.notes || '',
    tags: contract?.tags?.join(', ') || '',
    documentLink: contract?.documentLink || '',
  });

  const [isDirty, setIsDirty] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };
    
    // Reset dirty state after successful submission
    setIsDirty(false);
    onDirtyStateChange?.(false);
    
    onSubmit(contractData);
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => updateFormData({ company: e.target.value })}
              placeholder="e.g., Netflix Inc."
              required
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                required
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
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateFormData({ amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
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
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => updateFormData({ frequency: value as Contract['frequency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData({ status: value as Contract['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
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
          {contract ? 'Update Contract' : 'Add Contract'}
        </Button>
      </div>
    </form>
  );
};