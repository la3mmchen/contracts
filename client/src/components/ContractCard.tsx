import { Contract, PriceChange } from '@/types/contract';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Coins, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Edit,
  Trash2,
  FileText,
  User,
  Clock,
  CalendarDays,
  X,
  AlertTriangle,
  Clock3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Tag,
  Save,
  Check,
  Pin,
  Star,
  Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { calculateNextThreePayments, formatPaymentDate } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';
import { CurrencyIcon } from '@/lib/currencyIcons';
import { isValidCategory, formatRelativeTime, getCategoryBadgeColor } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onCopy?: (contract: Contract) => void; // New prop for copying contracts

  onFilter?: (filterType: string, value: string) => void;
  defaultExpandCustomFields?: boolean;
  defaultExpandPriceChanges?: boolean;
  defaultExpandPayments?: boolean;
  onUpdate?: (id: string, updates: Partial<Contract>) => Promise<void>;
  isDetailPage?: boolean; // New prop to determine if we're on detail page
  onInlineEditingChange?: (isEditing: boolean) => void; // New prop to track inline editing state
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800',
  closed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800',
  terminated: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800',
};

export const ContractCard = ({ contract, onEdit, onDelete, onCopy, onFilter, defaultExpandCustomFields = false, defaultExpandPriceChanges = false, defaultExpandPayments = false, onUpdate, isDetailPage = false, onInlineEditingChange }: ContractCardProps) => {
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(defaultExpandCustomFields);
  const [isPriceChangesOpen, setIsPriceChangesOpen] = useState(defaultExpandPriceChanges);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(defaultExpandPayments);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editingAmount, setEditingAmount] = useState(contract.amount.toString());
  const [editingReason, setEditingReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Inline editing states for other fields
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(contract.name || '');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState(contract.company || '');
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [editingStartDate, setEditingStartDate] = useState(contract.startDate);
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(contract.endDate || '');
  const [isEditingFrequency, setIsEditingFrequency] = useState(false);
  const [editingFrequency, setEditingFrequency] = useState(contract.frequency);
  const [isEditingContactPerson, setIsEditingContactPerson] = useState(false);
  const [editingContactPerson, setEditingContactPerson] = useState(contract.contactInfo.contactPerson || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(contract.contactInfo.address || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescription, setEditingDescription] = useState(contract.description || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editingNotes, setEditingNotes] = useState(contract.notes || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState(contract.contactInfo.email || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editingPhone, setEditingPhone] = useState(contract.contactInfo.phone || '');
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(contract.contactInfo.website || '');
  
  // Additional editing states for missing fields
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(contract.currency);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editingStatus, setEditingStatus] = useState(contract.status);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(contract.category);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editingTags, setEditingTags] = useState(contract.tags?.join(', ') || '');
  const [isEditingDocumentLink, setIsEditingDocumentLink] = useState(false);
  const [editingDocumentLink, setEditingDocumentLink] = useState(contract.documentLink || '');
  const [isEditingCustomFields, setIsEditingCustomFields] = useState(false);
  const [editingCustomFields, setEditingCustomFields] = useState<Record<string, string>>(contract.customFields || {});
  const [newCustomFieldKey, setNewCustomFieldKey] = useState('');
  const [newCustomFieldValue, setNewCustomFieldValue] = useState('');
  
  const isMobile = useIsMobile();
  
  // Check if any inline editing is currently active
  const isAnyInlineEditing = isEditingName || isEditingCompany || isEditingStartDate || 
    isEditingEndDate || isEditingAmount || isEditingFrequency || isEditingContactPerson || 
    isEditingAddress || isEditingDescription || isEditingNotes || isEditingEmail || 
    isEditingPhone || isEditingWebsite || isEditingCurrency || isEditingStatus || 
    isEditingCategory || isEditingTags || isEditingDocumentLink || isEditingCustomFields;
  
  // Notify parent component about inline editing state changes
  useEffect(() => {
    if (onInlineEditingChange) {
      onInlineEditingChange(isAnyInlineEditing);
    }
  }, [isAnyInlineEditing, onInlineEditingChange]);
  
  // Get the category color using the shared utility function
  const categoryColor = useMemo(() => getCategoryBadgeColor(contract.category), [contract.category]);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleAmountSave = async () => {
    if (!onUpdate) {
      console.error('onUpdate function is not available!');
      return;
    }
    
    const newAmount = parseFloat(editingAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      setEditingAmount(contract.amount.toString());
      setIsEditingAmount(false);
      return;
    }

    if (newAmount === contract.amount) {
      setIsEditingAmount(false);
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a new price change entry
      const newPriceChange: PriceChange = {
        date: new Date().toISOString(),
        previousAmount: contract.amount,
        newAmount: newAmount,
        reason: editingReason.trim() || 'Amount updated via inline editing',
        effectiveDate: new Date().toISOString()
      };

      // Add to existing price changes or create new array
      const updatedPriceChanges = [
        ...(contract.priceChanges || []),
        newPriceChange
      ];

      const updateData = { 
        amount: newAmount,
        priceChanges: updatedPriceChanges
      };

      await onUpdate(contract.id, updateData);
      setIsEditingAmount(false);
    } catch (error) {
      console.error('Failed to update amount:', error);
      setEditingAmount(contract.amount.toString());
      setIsEditingAmount(false);
    } finally {
      setIsSaving(false);
    }
  };



  const handleAmountCancel = () => {
    setEditingAmount(contract.amount.toString());
    setEditingReason('');
    setIsEditingAmount(false);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAmountSave();
    } else if (e.key === 'Escape') {
      handleAmountCancel();
    }
  };

  const handleCopyContract = () => {
    if (onCopy) {
      onCopy(contract);
    }
  };

  // Inline editing handlers for other fields
  const handleDescriptionSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { description: editingDescription.trim() });
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update description:', error);
      setEditingDescription(contract.description || '');
      setIsEditingDescription(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescriptionCancel = () => {
    setEditingDescription(contract.description || '');
    setIsEditingDescription(false);
  };

  const handleNotesSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { notes: editingNotes.trim() });
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
      setEditingNotes(contract.notes || '');
      setIsEditingNotes(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesCancel = () => {
    setEditingNotes(contract.notes || '');
    setIsEditingNotes(false);
  };

  const handleEmailSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const updatedContactInfo = { ...contract.contactInfo, email: editingEmail.trim() };
      await onUpdate(contract.id, { contactInfo: updatedContactInfo });
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Failed to update email:', error);
      setEditingEmail(contract.contactInfo.email || '');
      setIsEditingEmail(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailCancel = () => {
    setEditingEmail(contract.contactInfo.email || '');
    setIsEditingEmail(false);
  };

  const handlePhoneSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const updatedContactInfo = { ...contract.contactInfo, phone: editingPhone.trim() };
      await onUpdate(contract.id, { contactInfo: updatedContactInfo });
      setIsEditingPhone(false);
    } catch (error) {
      console.error('Failed to update phone:', error);
      setEditingPhone(contract.contactInfo.phone || '');
      setIsEditingPhone(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneCancel = () => {
    setEditingPhone(contract.contactInfo.phone || '');
    setIsEditingPhone(false);
  };

  const handleWebsiteSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const updatedContactInfo = { ...contract.contactInfo, website: editingWebsite.trim() };
      await onUpdate(contract.id, { contactInfo: updatedContactInfo });
      setIsEditingWebsite(false);
    } catch (error) {
      console.error('Failed to update website:', error);
      setEditingWebsite(contract.contactInfo.website || '');
      setIsEditingWebsite(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWebsiteCancel = () => {
    setEditingWebsite(contract.contactInfo.website || '');
    setIsEditingWebsite(false);
  };

  // Company editing handlers
  const handleCompanySave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { company: editingCompany.trim() });
      setIsEditingCompany(false);
    } catch (error) {
      console.error('Failed to update company:', error);
      setEditingCompany(contract.company || '');
      setIsEditingCompany(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanyCancel = () => {
    setEditingCompany(contract.company || '');
    setIsEditingCompany(false);
  };

  // Name editing handlers
  const handleNameSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { name: editingName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditingName(contract.name || '');
      setIsEditingName(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameCancel = () => {
    setEditingName(contract.name || '');
    setIsEditingName(false);
  };

  // Start date editing handlers
  const handleStartDateSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { startDate: editingStartDate });
      setIsEditingStartDate(false);
    } catch (error) {
      console.error('Failed to update start date:', error);
      setEditingStartDate(contract.startDate);
      setIsEditingStartDate(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartDateCancel = () => {
    setEditingStartDate(contract.startDate);
    setIsEditingStartDate(false);
  };

  // End date editing handlers
  const handleEndDateSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { endDate: editingEndDate || null });
      setIsEditingEndDate(false);
    } catch (error) {
      console.error('Failed to update end date:', error);
      setEditingEndDate(contract.endDate || '');
      setIsEditingEndDate(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndDateCancel = () => {
    setEditingEndDate(contract.endDate || '');
    setIsEditingEndDate(false);
  };

  // Frequency editing handlers
  const handleFrequencySave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { frequency: editingFrequency });
      setIsEditingFrequency(false);
    } catch (error) {
      console.error('Failed to update frequency:', error);
      setEditingFrequency(contract.frequency);
      setIsEditingFrequency(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFrequencyCancel = () => {
    setEditingFrequency(contract.frequency);
    setIsEditingFrequency(false);
  };

  // Contact person editing handlers
  const handleContactPersonSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const updatedContactInfo = { ...contract.contactInfo, contactPerson: editingContactPerson.trim() };
      await onUpdate(contract.id, { contactInfo: updatedContactInfo });
      setIsEditingContactPerson(false);
    } catch (error) {
      console.error('Failed to update contact person:', error);
      setEditingContactPerson(contract.contactInfo.contactPerson || '');
      setIsEditingContactPerson(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactPersonCancel = () => {
    setEditingContactPerson(contract.contactInfo.contactPerson || '');
    setIsEditingContactPerson(false);
  };

  // Address editing handlers
  const handleAddressSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const updatedContactInfo = { ...contract.contactInfo, address: editingAddress.trim() };
      await onUpdate(contract.id, { contactInfo: updatedContactInfo });
      setIsEditingAddress(false);
    } catch (error) {
      console.error('Failed to update address:', error);
      setEditingAddress(contract.contactInfo.address || '');
      setIsEditingAddress(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressCancel = () => {
    setEditingAddress(contract.contactInfo.address || '');
    setIsEditingAddress(false);
  };

  // Currency editing handlers
  const handleCurrencySave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { currency: editingCurrency });
      setIsEditingCurrency(false);
    } catch (error) {
      console.error('Failed to update currency:', error);
      setEditingCurrency(contract.currency);
      setIsEditingCurrency(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyCancel = () => {
    setEditingCurrency(contract.currency);
    setIsEditingCurrency(false);
  };

  // Status editing handlers
  const handleStatusSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { status: editingStatus });
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      setEditingStatus(contract.status);
      setIsEditingStatus(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusCancel = () => {
    setEditingStatus(contract.status);
    setIsEditingStatus(false);
  };

  // Category editing handlers
  const handleCategorySave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { category: editingCategory });
      setIsEditingCategory(false);
    } catch (error) {
      console.error('Failed to update category:', error);
      setEditingCategory(contract.category);
      setIsEditingCategory(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryCancel = () => {
    setEditingCategory(contract.category);
    setIsEditingCategory(false);
  };

  // Tags editing handlers
  const handleTagsSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      const tagsArray = editingTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      await onUpdate(contract.id, { tags: tagsArray });
      setIsEditingTags(false);
    } catch (error) {
      console.error('Failed to update tags:', error);
      setEditingTags(contract.tags?.join(', ') || '');
      setIsEditingTags(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsCancel = () => {
    setEditingTags(contract.tags?.join(', ') || '');
    setIsEditingTags(false);
  };

  // Document link editing handlers
  const handleDocumentLinkSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { documentLink: editingDocumentLink.trim() || undefined });
      setIsEditingDocumentLink(false);
    } catch (error) {
      console.error('Failed to update document link:', error);
      setEditingDocumentLink(contract.documentLink || '');
      setIsEditingDocumentLink(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentLinkCancel = () => {
    setEditingDocumentLink(contract.documentLink || '');
    setIsEditingDocumentLink(false);
  };

  // Custom fields editing handlers
  const handleCustomFieldsSave = async () => {
    if (!onUpdate) return;
    
    try {
      setIsSaving(true);
      await onUpdate(contract.id, { customFields: editingCustomFields });
      setIsEditingCustomFields(false);
    } catch (error) {
      console.error('Failed to update custom fields:', error);
      setEditingCustomFields(contract.customFields || {});
      setIsEditingCustomFields(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomFieldsCancel = () => {
    setEditingCustomFields(contract.customFields || {});
    setIsEditingCustomFields(false);
  };

  const addCustomField = () => {
    if (newCustomFieldKey.trim() && newCustomFieldValue.trim()) {
      setEditingCustomFields({
        ...editingCustomFields,
        [newCustomFieldKey.trim()]: newCustomFieldValue.trim()
      });
      setNewCustomFieldKey('');
      setNewCustomFieldValue('');
    }
  };

  const removeCustomField = (key: string) => {
    const newCustomFields = { ...editingCustomFields };
    delete newCustomFields[key];
    setEditingCustomFields(newCustomFields);
  };

  const payments = calculateNextThreePayments(contract);
  const nextPayment = payments[0];

  const hasInvalidCategory = !isValidCategory(contract.category);
  const isRecentlyUpdated = new Date(contract.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
  const isStale = new Date(contract.updatedAt).getTime() < Date.now() - 6 * 30 * 24 * 60 * 60 * 1000; // 6 months ago
  const isOld = new Date(contract.updatedAt).getTime() < Date.now() - 3 * 30 * 24 * 60 * 60 * 1000; // 3 months ago
  
  return (
    <Card 
      id={`contract-${contract.id}`}
      className={`group bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 animate-fade-in ${
        contract.draft ? 'border-border bg-muted/30' : ''
      } ${
        isRecentlyUpdated && !hasInvalidCategory && !contract.draft ? 'border-border bg-muted/30' : ''
      } ${
        isOld && !isStale && !hasInvalidCategory && !contract.draft ? 'border-border bg-muted/20' : ''
      } ${isStale && !hasInvalidCategory ? 'border-destructive bg-destructive/10' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {isDetailPage && isEditingName ? (
                <div className="flex items-center gap-2" data-editable="true">
                  {!isValidCategory(contract.category) && <Pin className="h-4 w-4 inline mr-2 text-red-600" />}
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="text-base sm:text-lg font-semibold h-8 bg-background"
                    placeholder="Enter contract name..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNameSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNameCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingName(true)}
                  title="Click to edit contract name"
                >
                  {!isValidCategory(contract.category) && <Pin className="h-4 w-4 inline mr-2 text-red-600" />}
                  {contract.name}
                </div>
              ) : (
                <Link 
                  to={`/contract/${contract.id}`}
                  className="hover:underline cursor-pointer"
                >
                  {!isValidCategory(contract.category) && <Pin className="h-4 w-4 inline mr-2 text-red-600" />}
                  {contract.name}
                </Link>
              )}
            </CardTitle>
            
            {/* Draft and Needs Info indicators - show prominently below contract name */}
            {(contract.draft || contract.needsMoreInfo) && (
              <div className="flex items-center gap-2 mt-1">
                {contract.draft && (
                  <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
                    <FileText className="h-3 w-3 mr-1" />
                    Draft
                  </span>
                )}
                {contract.needsMoreInfo && (
                  <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Needs Info
                  </span>
                )}
              </div>
            )}
            
            {isDetailPage && isEditingCompany ? (
              <div className="flex items-center gap-2 mt-1" data-editable="true">
                <Input
                  type="text"
                  value={editingCompany}
                  onChange={(e) => setEditingCompany(e.target.value)}
                  className="text-sm h-7 bg-background"
                  placeholder="Enter company name..."
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCompanySave}
                  disabled={isSaving}
                  className="h-6 w-6 p-0"
                >
                  {isSaving ? '...' : '✓'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCompanyCancel}
                  disabled={isSaving}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
            ) : isDetailPage ? (
              <div 
                className="text-sm text-muted-foreground mt-1 cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                onClick={() => setIsEditingCompany(true)}
                title="Click to edit company name"
              >
                {contract.company || 'Click to add company...'}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-1">
                {contract.company}
              </div>
            )}
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded mt-2 inline-block">
              ID: {contract.contractId}
            </p>
            <p className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${isOld || isStale ? 'font-semibold' : ''}`}>
              {isStale && <AlertTriangle className="h-3 w-3 text-destructive" />}
              {isOld && !isStale && <Clock3 className="h-3 w-3 text-muted-foreground" />}
              Updated {formatRelativeTime(contract.updatedAt)}
            </p>
          </div>
          {/* Action buttons - only visible on hover for all contracts */}
          <div className={`flex gap-1 sm:gap-2 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              title="View details"
            >
              <Link to={`/contract/${contract.id}`}>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(contract)}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
              title="Edit contract"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContract}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9 transition-colors hover:bg-muted hover:border-border"
              title="Copy contract"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(contract.id)}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9 transition-colors hover:bg-muted hover:border-border"
              title="Delete contract"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            {/* Star button for non-starred contracts - only visible on hover */}
            {!contract.pinned && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onUpdate) {
                    onUpdate(contract.id, { pinned: !contract.pinned });
                  }
                }}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9 transition-colors hover:bg-yellow-50 hover:border-yellow-200"
                title="Pin contract"
              >
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            
            {/* Close button for expired contracts - positioned after star */}
            {contract.status === 'expired' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Update contract status to closed
                  if (onUpdate) {
                    onUpdate(contract.id, { ...contract, status: 'closed' });
                  }
                }}
                className="h-8 w-8 p-0 sm:h-9 sm:w-9 hover:bg-destructive hover:text-destructive-200"
                title="Close contract"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
          
          {/* Star button for starred contracts - always visible, positioned on the far right */}
          {contract.pinned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onUpdate) {
                  onUpdate(contract.id, { pinned: !contract.pinned });
                }
              }}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9 transition-colors"
              title="Unpin contract"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Status and Category Badges */}
        <div className="flex flex-wrap gap-2">
          {isDetailPage && isEditingStatus ? (
            <div className="flex items-center gap-1">
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value as typeof editingStatus)}
                className="text-xs h-6 bg-background border border-border rounded px-1"
                autoFocus
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="terminated">Terminated</option>
                <option value="closed">Closed</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStatusSave}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                {isSaving ? '...' : '✓'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStatusCancel}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                ✕
              </Button>
            </div>
          ) : (
            <span 
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[contract.status]} ${
                isDetailPage ? 'cursor-pointer hover:bg-muted/30 transition-colors' : onFilter ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
              onClick={isDetailPage ? () => setIsEditingStatus(true) : onFilter ? () => onFilter('status', contract.status) : undefined}
              title={isDetailPage ? 'Click to edit status' : onFilter ? `Filter by status: ${contract.status}` : undefined}
            >
              {contract.status}
            </span>
          )}
          
          {isDetailPage && isEditingCategory ? (
            <div className="flex items-center gap-1">
              <select
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value as typeof editingCategory)}
                className="text-xs h-6 bg-background border border-border rounded px-1"
                autoFocus
              >
                <option value="utilities">Utilities</option>
                <option value="insurance">Insurance</option>
                <option value="rent">Rent</option>
                <option value="subscription">Subscription</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCategorySave}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                {isSaving ? '...' : '✓'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCategoryCancel}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                ✕
              </Button>
            </div>
          ) : (
            <span 
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColor} ${
                isDetailPage ? 'cursor-pointer hover:bg-muted/30 transition-colors' : onFilter ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
              onClick={isDetailPage ? () => setIsEditingCategory(true) : onFilter ? () => onFilter('category', contract.category) : undefined}
              title={isDetailPage ? 'Click to edit category' : onFilter ? `Filter by category: ${contract.category}` : undefined}
            >
              {contract.category}
            </span>
          )}
          

          

        </div>

        {/* Invalid Category Warning */}
        {hasInvalidCategory && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">
              This contract uses a category that is no longer available. Please update the category.
            </span>
          </div>
        )}

        {/* Contract Period */}


                  {/* Contract Period */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Contract Period:</span>
            </div>
            <div className="space-y-1">
                          {/* Start Date */}
            {isDetailPage || contract.startDate ? (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-12">Start:</span>
                {isDetailPage && isEditingStartDate ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="date"
                      value={editingStartDate}
                      onChange={(e) => setEditingStartDate(e.target.value)}
                      className="text-xs h-6 w-32"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartDateSave}
                      disabled={isSaving}
                      className="h-5 w-5 p-0"
                    >
                      {isSaving ? '...' : '✓'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartDateCancel}
                      disabled={isSaving}
                      className="h-5 w-5 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                ) : isDetailPage ? (
                  <div 
                    className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                    onClick={() => setIsEditingStartDate(true)}
                    title="Click to edit start date"
                  >
                    {formatDate(contract.startDate)}
                  </div>
                ) : (
                  <span>{formatDate(contract.startDate)}</span>
                )}
              </div>
            ) : null}
              
              {/* End Date */}
              {isDetailPage || contract.endDate ? (
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-12">End:</span>
                  {isDetailPage && isEditingEndDate ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="date"
                        value={editingEndDate}
                        onChange={(e) => setEditingEndDate(e.target.value)}
                        className="text-xs h-6 w-32"
                        placeholder="No end date"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEndDateSave}
                        disabled={isSaving}
                        className="h-5 w-5 p-0"
                      >
                        {isSaving ? '...' : '✓'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEndDateCancel}
                        disabled={isSaving}
                        className="h-5 w-5 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : isDetailPage ? (
                    <div 
                      className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                      onClick={() => setIsEditingEndDate(true)}
                      title="Click to edit end date"
                    >
                      {contract.endDate ? formatDate(contract.endDate) : 'Click to add end date...'}
                    </div>
                  ) : (
                    <span>{formatDate(contract.endDate)}</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Amount and Frequency */}
        <div className="flex items-center gap-2 text-lg font-semibold">
          {isDetailPage && isEditingCurrency ? (
            <div className="flex items-center gap-1">
              <select
                value={editingCurrency}
                onChange={(e) => setEditingCurrency(e.target.value)}
                className="text-sm h-6 bg-background border border-border rounded px-1"
                autoFocus
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCurrencySave}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                {isSaving ? '...' : '✓'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCurrencyCancel}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                ✕
              </Button>
            </div>
          ) : isDetailPage ? (
            <div 
              className="cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded transition-colors"
              onClick={() => setIsEditingCurrency(true)}
              title="Click to edit currency"
            >
              <CurrencyIcon currency={contract.currency} />
            </div>
          ) : (
            <CurrencyIcon currency={contract.currency} />
          )}
          {isDetailPage && isEditingAmount ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                className="w-24 h-8 text-lg font-semibold"
                autoFocus
              />
              <Input
                type="text"
                placeholder="Reason for change..."
                value={editingReason}
                onChange={(e) => setEditingReason(e.target.value)}
                className="w-32 h-8 text-sm"
                maxLength={100}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAmountSave}
                  disabled={isSaving}
                  className="h-6 w-6 p-0"
                >
                  {isSaving ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAmountCancel}
                  disabled={isSaving}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : isDetailPage ? (
            <div className="group relative">
              <span 
                className="cursor-pointer hover:bg-muted/30 hover:text-foreground transition-all duration-200 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent hover:border-border font-medium"
                onClick={() => onUpdate && setIsEditingAmount(true)}
                title="Click to edit amount"
              >
                {formatCurrency(contract.amount, contract.currency)}
                <Edit className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              </span>
            </div>
          ) : (
            <span className="text-lg font-semibold">
              {formatCurrency(contract.amount, contract.currency)}
            </span>
          )}
          <span className="text-sm text-muted-foreground font-normal">/</span>
          {isDetailPage && isEditingFrequency ? (
            <div className="flex items-center gap-1">
              <select
                value={editingFrequency}
                onChange={(e) => setEditingFrequency(e.target.value as typeof editingFrequency)}
                className="text-sm h-6 bg-background border border-border rounded px-1"
                autoFocus
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="one-time">One-Time</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFrequencySave}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                {isSaving ? '...' : '✓'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFrequencyCancel}
                disabled={isSaving}
                className="h-5 w-5 p-0"
              >
                ✕
              </Button>
            </div>
          ) : isDetailPage ? (
            <div 
              className="text-sm text-muted-foreground font-normal cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
              onClick={() => setIsEditingFrequency(true)}
              title="Click to edit frequency"
            >
              {contract.frequency}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground font-normal">
              {contract.frequency}
            </span>
          )}
        </div>

        {/* Price Changes - Collapsible */}
        {contract.priceChanges && contract.priceChanges.length > 0 && (
          <Collapsible open={isPriceChangesOpen} onOpenChange={setIsPriceChangesOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between text-sm text-muted-foreground cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <span>Price Changes:</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {contract.priceChanges.length}
                  </span>
                </div>
                {isPriceChangesOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 pl-6">
                {/* Show only the last price change by default */}
                {(() => {
                  const mostRecentChange = contract.priceChanges
                    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Latest:</span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-muted/30 px-2 py-1 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {formatDate(mostRecentChange.effectiveDate)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(mostRecentChange.newAmount, contract.currency)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground max-w-24 truncate" title={mostRecentChange.reason}>
                          {mostRecentChange.reason}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Show all changes if there are more than 1 */}
                {contract.priceChanges.length > 1 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>All changes:</span>
                    </div>
                    <div className="space-y-1">
                      {contract.priceChanges
                        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                        .map((change, index) => (
                          <div key={index} className="bg-muted/20 p-2 rounded text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-muted-foreground">
                                {formatDate(change.effectiveDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="line-through">{formatCurrency(change.previousAmount, contract.currency)}</span>
                              <span className="text-foreground">→</span>
                              <span className="font-medium text-foreground">{formatCurrency(change.newAmount, contract.currency)}</span>
                            </div>
                            {change.reason && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {change.reason}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}



        {/* Payment Schedule - Collapsible */}
        {payments.length > 0 && (
          <Collapsible open={isPaymentsOpen} onOpenChange={setIsPaymentsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between text-sm text-muted-foreground cursor-pointer hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-info" />
                  <span>Next payments:</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {payments.length}
                  </span>
                </div>
                {isPaymentsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 pl-6">
                {payments.map((payment, index) => {
                  const paymentDate = new Date(payment.date);
                  const now = new Date();
                  const isPastDue = paymentDate < now;
                  
                  return (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className={`${payment.isNext ? 'font-medium' : 'text-muted-foreground'} ${isPastDue ? 'line-through text-muted-foreground/60' : ''}`}>
                        {formatPaymentDate(payment.date)}
                      </span>
                      <span className={`${payment.isNext ? 'font-medium' : 'text-muted-foreground'} ${isPastDue ? 'line-through text-muted-foreground/60' : ''}`}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          {isDetailPage || contract.contactInfo.contactPerson ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDetailPage && isEditingContactPerson ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Input
                    type="text"
                    value={editingContactPerson}
                    onChange={(e) => setEditingContactPerson(e.target.value)}
                    className="text-sm w-40"
                    placeholder="Enter contact person..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleContactPersonSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleContactPersonCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingContactPerson(true)}
                  title="Click to edit contact person"
                >
                  {contract.contactInfo.contactPerson ? (
                    <span className="text-foreground font-medium">{contract.contactInfo.contactPerson}</span>
                  ) : (
                    <span className="text-muted-foreground">Click to add contact person...</span>
                  )}
                </div>
              ) : (
                <span className="text-foreground font-medium">{contract.contactInfo.contactPerson}</span>
              )}
            </div>
          ) : null}
          {isDetailPage || contract.contactInfo.email ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDetailPage && isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={editingEmail}
                    onChange={(e) => setEditingEmail(e.target.value)}
                    className="text-sm w-48"
                    placeholder="Enter email..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmailSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmailCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingEmail(true)}
                  title="Click to edit email"
                >
                  {contract.contactInfo.email ? (
                    <div className="flex items-center gap-2">
                      <a 
                        href={`mailto:${contract.contactInfo.email}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={`Send email to ${contract.contactInfo.email}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <span 
                        className="truncate cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                        onClick={() => setIsEditingEmail(true)}
                        title="Click to edit email"
                      >
                        {contract.contactInfo.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Click to add email...</span>
                  )}
                </div>
              ) : (
                <a 
                  href={`mailto:${contract.contactInfo.email}`}
                  className="text-primary hover:underline truncate"
                  title={`Send email to ${contract.contactInfo.email}`}
                >
                  {contract.contactInfo.email}
                </a>
              )}
            </div>
          ) : null}
          {isDetailPage || contract.contactInfo.phone ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDetailPage && isEditingPhone ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    value={editingPhone}
                    onChange={(e) => setEditingPhone(e.target.value)}
                    className="text-sm w-40"
                    placeholder="Enter phone..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePhoneSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePhoneCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingPhone(true)}
                  title="Click to edit phone"
                >
                  {contract.contactInfo.phone ? (
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${contract.contactInfo.phone}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={`Call ${contract.contactInfo.phone}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                      <span 
                        className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                        onClick={() => setIsEditingPhone(true)}
                        title="Click to edit phone"
                      >
                        {contract.contactInfo.phone}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Click to add phone...</span>
                  )}
                </div>
              ) : (
                <a 
                  href={`tel:${contract.contactInfo.phone}`}
                  className="text-primary hover:underline"
                  title={`Call ${contract.contactInfo.phone}`}
                >
                  {contract.contactInfo.phone}
                </a>
              )}
            </div>
          ) : null}
          {isDetailPage || contract.contactInfo.website ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDetailPage && isEditingWebsite ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={editingWebsite}
                    onChange={(e) => setEditingWebsite(e.target.value)}
                    className="text-sm w-56"
                    placeholder="Enter website..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleWebsiteSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleWebsiteCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingWebsite(true)}
                  title="Click to edit website"
                >
                  {contract.contactInfo.website ? (
                    <div className="flex items-center gap-2">
                      <a 
                        href={contract.contactInfo.website.startsWith('http') ? contract.contactInfo.website : `https://${contract.contactInfo.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={`Visit ${contract.contactInfo.website}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                      <span 
                        className="truncate cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                        onClick={() => setIsEditingWebsite(true)}
                        title="Click to edit website"
                      >
                        {contract.contactInfo.website}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Click to add website...</span>
                  )}
                </div>
              ) : (
                <a 
                  href={contract.contactInfo.website.startsWith('http') ? contract.contactInfo.website : `https://${contract.contactInfo.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                  title={`Visit ${contract.contactInfo.website}`}
                >
                  {contract.contactInfo.website}
                </a>
              )}
            </div>
          ) : null}
          {isDetailPage || contract.contactInfo.address ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDetailPage && isEditingAddress ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingAddress}
                    onChange={(e) => setEditingAddress(e.target.value)}
                    className="text-sm w-48"
                    placeholder="Enter address..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddressSave}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddressCancel}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingAddress(true)}
                  title="Click to edit address"
                >
                  {contract.contactInfo.address ? (
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(contract.contactInfo.address)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                      title={`View ${contract.contactInfo.address} on Google Maps`}
                    >
                      {contract.contactInfo.address}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Click to add address...</span>
                  )}
                </div>
              ) : (
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contract.contactInfo.address)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                  title={`View ${contract.contactInfo.address} on Google Maps`}
                >
                  {contract.contactInfo.address}
                </a>
              )}
            </div>
          ) : null}
        </div>

        {/* Document Link */}
        {isDetailPage || contract.documentLink ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-info" />
              <span>Document Link:</span>
            </div>
            {isDetailPage && isEditingDocumentLink ? (
              <div className="pl-6 space-y-2">
                <Input
                  type="url"
                  value={editingDocumentLink}
                  onChange={(e) => setEditingDocumentLink(e.target.value)}
                  className="text-sm"
                  placeholder="Enter document URL..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDocumentLinkSave}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDocumentLinkCancel}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isDetailPage ? (
              <div 
                className="pl-6 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                onClick={() => setIsEditingDocumentLink(true)}
                title="Click to edit document link"
              >
                {contract.documentLink ? (
                  <a 
                    href={contract.documentLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                    title="View contract document"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Contract Document
                  </a>
                ) : (
                  <span className="text-muted-foreground">Click to add document link...</span>
                )}
              </div>
            ) : (
              <div className="pl-6">
                <a 
                  href={contract.documentLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                  title="View contract document"
                >
                  View Contract Document
                </a>
              </div>
            )}
          </div>
        ) : null}

        {/* Description */}
        {isDetailPage || contract.description ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Description:</span>
            </div>
            {isDetailPage && isEditingDescription ? (
              <div className="pl-6 space-y-2">
                <Textarea
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="text-sm min-h-[60px]"
                  placeholder="Enter description..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDescriptionSave}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDescriptionCancel}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isDetailPage ? (
              <div 
                className="text-sm text-muted-foreground line-clamp-2 pl-6 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                onClick={() => setIsEditingDescription(true)}
                title="Click to edit description"
              >
                {contract.description || 'Click to add description...'}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground line-clamp-2 pl-6">
                {contract.description}
              </div>
            )}
          </div>
        ) : null}

        {/* Notes */}
        {isDetailPage || contract.notes ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Notes:</span>
            </div>
            {isDetailPage && isEditingNotes ? (
              <div className="pl-6 space-y-2">
                <Textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="text-sm min-h-[80px]"
                  placeholder="Enter notes..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNotesSave}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNotesCancel}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isDetailPage ? (
              <div 
                className="text-sm text-muted-foreground line-clamp-3 pl-6 bg-muted/30 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsEditingNotes(true)}
                title="Click to edit notes"
              >
                {contract.notes || 'Click to add notes...'}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground line-clamp-3 pl-6 bg-muted/30 p-2 rounded">
                {contract.notes}
              </div>
            )}
          </div>
        ) : null}



        {/* Custom Fields */}
        {contract.customFields && Object.keys(contract.customFields).length > 0 ? (
          <div className="space-y-1">
            {isDetailPage && isEditingCustomFields ? (
              <div className="pl-6 space-y-3">
                {/* Existing custom fields */}
                {Object.entries(editingCustomFields).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newCustomFields = { ...editingCustomFields };
                        delete newCustomFields[key];
                        newCustomFields[newKey] = value;
                        setEditingCustomFields(newCustomFields);
                      }}
                      className="text-sm w-32"
                      placeholder="Field name"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setEditingCustomFields({
                          ...editingCustomFields,
                          [key]: e.target.value
                        });
                      }}
                      className="text-sm flex-1"
                      placeholder="Field value"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomField(key)}
                      className="h-7 w-7 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                
                {/* Add new custom field */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={newCustomFieldKey}
                    onChange={(e) => setNewCustomFieldKey(e.target.value)}
                    className="text-sm w-32"
                    placeholder="Field name"
                  />
                  <Input
                    type="text"
                    value={newCustomFieldValue}
                    onChange={(e) => setNewCustomFieldValue(e.target.value)}
                    className="text-sm flex-1"
                    placeholder="Field value"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addCustomField}
                    className="h-7 px-2"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Save/Cancel buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCustomFieldsSave}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCustomFieldsCancel}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isDetailPage ? (
              <div 
                className="pl-6 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                onClick={() => setIsEditingCustomFields(true)}
                title="Click to edit custom fields"
              >
                {contract.customFields && Object.keys(contract.customFields).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(contract.customFields).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground font-medium min-w-0 flex-shrink-0">
                          {key}:
                        </span>
                        <span className="text-foreground break-words">
                          {value.startsWith('http') ? (
                            <a 
                              href={value.startsWith('http') ? value : `https://${value}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              title={`Open ${value}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Click to add custom fields...</span>
                )}
              </div>
            ) : (
              <Collapsible 
                open={isCustomFieldsOpen}
                onOpenChange={setIsCustomFieldsOpen}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between text-sm text-muted-foreground cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Additional Info:</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {Object.keys(contract.customFields).length}
                      </span>
                    </div>
                    {isCustomFieldsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 pl-6">
                    {Object.entries(contract.customFields).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground font-medium min-w-0 flex-shrink-0">
                          {key}:
                        </span>
                        <span className="text-foreground break-words">
                          {value.startsWith('http') ? (
                            <a 
                              href={value.startsWith('http') ? value : `https://${value}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              title={`Open ${value}`}
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ) : null}

        {/* Tags */}
        {isDetailPage || (contract.tags && contract.tags.length > 0) ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Tags:</span>
              {contract.tags && contract.tags.length > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {contract.tags.length}
                </span>
              )}
            </div>
            {isDetailPage && isEditingTags ? (
              <div className="pl-6 space-y-2">
                <Input
                  type="text"
                  value={editingTags}
                  onChange={(e) => setEditingTags(e.target.value)}
                  className="text-sm"
                  placeholder="Enter tags separated by commas..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTagsSave}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTagsCancel}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : isDetailPage ? (
              <div 
                className="pl-6 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                onClick={() => setIsEditingTags(true)}
                title="Click to edit tags"
              >
                {contract.tags && contract.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {contract.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {`#${tag}`}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Click to add tags...</span>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 pl-6">
                {contract.tags?.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilter?.('tags', tag);
                    }}
                    title={`Filter by tag: ${tag}`}
                  >
                    {`#${tag}`}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};