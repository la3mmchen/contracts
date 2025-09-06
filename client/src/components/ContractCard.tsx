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
  ChevronUp,
  Tag,
  Save,
  Check,
  Pin,
  Star,
  Copy,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { calculateNextThreePayments, formatPaymentDate } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';
import { CurrencyIcon } from '@/lib/currencyIcons';
import { isValidCategory, formatRelativeTime, getCategoryBadgeColor } from '@/lib/utils';

import { useState, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Generate consistent color for family member based on name
const getFamilyMemberColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200 border-pink-200',
    'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200 border-teal-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border-indigo-200',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200 border-cyan-200',
  ];
  
  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onCopy?: (contract: Contract) => void;
  onFilter?: (filterType: string, value: string) => void;

  onUpdate?: (id: string, updates: Partial<Contract>) => Promise<void>;
  isDetailPage?: boolean;
  onInlineEditingChange?: (isEditing: boolean) => void;
  currentSearchParams?: string;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  cancelled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  closed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  terminated: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
};

const getBasePath = () => {
  return window.location.pathname.includes('/contracts/') ? '/contracts' : '';
};

export const ContractCard = ({ 
  contract, 
  onEdit, 
  onDelete, 
  onCopy, 
  onFilter, 
  onUpdate, 
  isDetailPage = false, 
  onInlineEditingChange, 
  currentSearchParams 
}: ContractCardProps) => {
  const [isExpanded, setIsExpanded] = useState(isDetailPage);
  
  // Inline editing states
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editingAmount, setEditingAmount] = useState(contract.amount.toString());
  const [editingReason, setEditingReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(contract.name || '');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState(contract.company || '');
  
  const isMobile = useIsMobile();
  
  // Check if any inline editing is currently active
  const isAnyInlineEditing = isEditingName || isEditingCompany || isEditingAmount;
  
  // Notify parent component about inline editing state changes
  useEffect(() => {
    if (onInlineEditingChange) {
      onInlineEditingChange(isAnyInlineEditing);
    }
  }, [isAnyInlineEditing, onInlineEditingChange]);
  
  // Reset editing states when contract changes
  useEffect(() => {
    setIsEditingName(false);
    setIsEditingCompany(false);
    setIsEditingAmount(false);
    setEditingName(contract.name || '');
    setEditingCompany(contract.company || '');
    setEditingAmount(contract.amount.toString());
    setEditingReason('');
  }, [contract]);
  
  const categoryColor = useMemo(() => getCategoryBadgeColor(contract.category), [contract.category]);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleAmountSave = async () => {
    if (!onUpdate) return;
    
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
      
      const newPriceChange: PriceChange = {
        date: new Date().toISOString(),
        previousAmount: contract.amount,
        newAmount: newAmount,
        reason: editingReason.trim() || 'Amount updated via inline editing',
        effectiveDate: new Date().toISOString()
      };

      const updatedPriceChanges = [
        ...(contract.priceChanges || []),
        newPriceChange
      ];

      await onUpdate(contract.id, { 
        amount: newAmount,
        priceChanges: updatedPriceChanges
      });
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

  const handleCopyContract = () => {
    if (onCopy) {
      onCopy(contract);
    }
  };

  const payments = calculateNextThreePayments(contract);
  const nextPayment = payments[0];
  const hasInvalidCategory = !isValidCategory(contract.category);
  const isRecentlyUpdated = new Date(contract.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
  const isStale = new Date(contract.updatedAt).getTime() < Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
  const isOld = new Date(contract.updatedAt).getTime() < Date.now() - 3 * 30 * 24 * 60 * 60 * 1000;
  
  return (
    <Card 
      id={`contract-${contract.id}`}
      className={`group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ${
        contract.draft ? 'border-t-4 border-t-blue-500' : ''
      } ${
        isRecentlyUpdated && !hasInvalidCategory && !contract.draft ? 'border-t-4 border-t-green-500' : ''
      } ${
        isOld && !isStale && !hasInvalidCategory && !contract.draft ? 'border-t-4 border-t-yellow-500' : ''
      } ${isStale && !hasInvalidCategory ? 'border-t-4 border-t-red-500' : ''}`}>
      
      {/* Header Section */}
      <CardHeader className="pb-4">
        {/* Status Indicators - Above the title */}
        <div className="flex items-center gap-2 mb-3">
          {/* Priority Warnings (Draft/Needs Info) */}
          {contract.draft && (
            <Badge 
              variant="secondary" 
              className={`bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-xs whitespace-nowrap border border-blue-200 ${
                onFilter ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={onFilter ? () => onFilter('draft', 'true') : undefined}
              title="Click to filter by draft status"
            >
              <FileText className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
          {contract.needsMoreInfo && (
            <Badge 
              variant="secondary" 
              className={`bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs whitespace-nowrap border border-yellow-200 ${
                onFilter ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={onFilter ? () => onFilter('needsMoreInfo', 'true') : undefined}
              title="Click to filter by needs info status"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Info
            </Badge>
          )}
          {contract.optimizable && (
            <Badge 
              variant="secondary" 
              className={`bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 text-xs whitespace-nowrap border border-purple-200 ${
                onFilter ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={onFilter ? () => onFilter('optimizable', 'true') : undefined}
              title="Click to filter by optimization"
            >
              <Coins className="h-3 w-3 mr-1" />
              Optimization
            </Badge>
          )}
          
          {/* Contract Status - Only show non-active states */}
          {contract.status !== 'active' && (
            <Badge 
              className={`${statusColors[contract.status]} text-xs whitespace-nowrap border ${
                onFilter ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={onFilter ? () => onFilter('status', contract.status) : undefined}
            >
              {contract.status}
            </Badge>
          )}
        </div>
        
        <div className="flex items-start justify-between gap-3">
          {/* Main Contract Info */}
          <div className="flex-1 min-w-0">
            {/* Contract Name */}
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDetailPage && isEditingName ? (
                <div className="flex items-center gap-2">
                  {contract.pinned && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="text-lg font-semibold h-9"
                    placeholder="Enter contract name..."
                    autoFocus
                  />
                  <Button size="sm" onClick={handleNameSave} disabled={isSaving}>
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingName(true)}
                  title="Click to edit contract name"
                >
                  {contract.pinned && <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />}
                  {contract.name}
                </div>
              ) : (
                <Link 
                  to={`/contract/${contract.id}${currentSearchParams ? `?${currentSearchParams}` : ''}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  {contract.pinned && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                  {contract.name}
                </Link>
              )}
            </CardTitle>
            
            {/* Company Name */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isDetailPage && isEditingCompany ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editingCompany}
                    onChange={(e) => setEditingCompany(e.target.value)}
                    className="text-sm h-8"
                    placeholder="Enter company name..."
                    autoFocus
                  />
                  <Button size="sm" onClick={handleCompanySave} disabled={isSaving}>
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingCompany(false)}>
                    ✕
                  </Button>
                </div>
              ) : isDetailPage ? (
                <div 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditingCompany(true)}
                  title="Click to edit company name"
                >
                  {contract.company || 'Click to add company...'}
                </div>
              ) : (
                contract.company ? (
                  <button
                    onClick={() => onFilter && onFilter('company', contract.company)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                    title={`Filter by company: ${contract.company}`}
                  >
                    {contract.company}
                  </button>
                ) : null
              )}
            </div>
            
                        {/* Category and Family Member Badges */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline"
                className={`${categoryColor} text-xs ${
                  onFilter ? 'cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-200' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onFilter) {
                    onFilter('category', contract.category);
                  }
                }}
              >
                {contract.category}
              </Badge>
              
              {/* Family Member Badge */}
              {contract.familyMember && (
                <Badge 
                  variant="outline"
                  className={`text-xs cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-200 ${getFamilyMemberColor(contract.familyMember)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onFilter) {
                      onFilter('familyMember', contract.familyMember!);
                    }
                  }}
                  title={`Filter by ${contract.familyMember}`}
                >
                  <User className="h-3 w-3 mr-1" />
                  {contract.familyMember}
                </Badge>
              )}
            </div>
            

          </div>
          
          {/* Action Buttons - Hidden by default, visible on hover */}
          <div className={`flex gap-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
              title="View details"
            >
              <Link to={`${getBasePath()}/contract/${contract.id}${currentSearchParams ? `?${currentSearchParams}` : ''}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(contract)}
              className="h-8 w-8 p-0"
              title="Edit contract"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContract}
              className="h-8 w-8 p-0"
              title="Copy contract"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(contract.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
              title="Delete contract"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            {/* Simple Star Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onUpdate) {
                  onUpdate(contract.id, { pinned: !contract.pinned });
                }
              }}
              className={`h-8 w-8 p-0 ${
                contract.pinned 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' 
                  : 'hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600'
              }`}
              title={contract.pinned ? 'Unpin contract' : 'Pin contract'}
            >
              <Star className={`h-4 w-4 ${contract.pinned ? 'fill-current text-yellow-500' : 'text-yellow-500'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="space-y-4">
        {/* Key Information Row */}
        <div className={`grid grid-cols-1 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg ${
          contract.reference && nextPayment 
            ? 'md:grid-cols-4' 
            : contract.reference || nextPayment 
              ? 'md:grid-cols-3' 
              : 'md:grid-cols-2'
        }`}>
          {/* Amount */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isDetailPage && isEditingAmount ? (
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingAmount}
                    onChange={(e) => setEditingAmount(e.target.value)}
                    className="w-24 h-10 text-center text-lg font-bold"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAmountSave} disabled={isSaving}>
                    {isSaving ? '...' : '✓'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleAmountCancel}>
                    ✕
                  </Button>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CurrencyIcon currency={contract.currency} />
                  {formatCurrency(contract.amount, contract.currency)}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              per {contract.frequency}
            </div>
          </div>
          
          {/* Contract Period */}
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Contract Period</div>
            <div className="text-sm font-medium">
              <div>Start: {formatDate(contract.startDate)}</div>
              {contract.endDate && <div>End: {formatDate(contract.endDate)}</div>}
            </div>
          </div>
          
          {/* Reference Number - Only show if there's a reference */}
          {contract.reference && (
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reference</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {contract.reference}
              </div>
            </div>
          )}
          
          {/* Next Payment - Only show if there's a payment */}
          {nextPayment && (
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Payment</div>
              <div className="text-sm font-medium">
                <div>{formatPaymentDate(nextPayment.date)}</div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(nextPayment.amount, nextPayment.currency)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section - Only show if there are notes */}
        {contract.notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg p-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Latest Note</div>
                <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                  {contract.notes.length > 120 
                    ? `${contract.notes.substring(0, 120)}...` 
                    : contract.notes
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span>Show {isExpanded ? 'less' : 'more'} details</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Contact Information */}
            {(contract.contactInfo.email || contract.contactInfo.phone || contract.contactInfo.website || contract.contactInfo.address) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contract.contactInfo.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${contract.contactInfo.email}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {contract.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {contract.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${contract.contactInfo.phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {contract.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {contract.contactInfo.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a 
                        href={contract.contactInfo.website.startsWith('http') ? contract.contactInfo.website : `https://${contract.contactInfo.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {contract.contactInfo.website}
                      </a>
                    </div>
                  )}
                  {contract.contactInfo.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(contract.contactInfo.address)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {contract.contactInfo.address}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reference Number */}
            {contract.reference && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Contract Details</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{contract.reference}</span>
                </div>
              </div>
            )}

            {/* Description */}
            {contract.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {contract.description}
                </p>
              </div>
            )}

            {/* Document Link */}
            {contract.documentLink && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Document</h4>
                <a 
                  href={contract.documentLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View Contract Document
                </a>
              </div>
            )}

            {/* Tags */}
            {contract.tags && contract.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {contract.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      onClick={() => onFilter?.('tags', tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {contract.customFields && Object.keys(contract.customFields).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(contract.customFields).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {value.startsWith('http') ? (
                          <a 
                            href={value.startsWith('http') ? value : `https://${value}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
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
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span>Updated {formatRelativeTime(contract.updatedAt)}</span>
          </div>
          
          {/* Warning indicators */}
          <div className="flex items-center gap-2">
            {isStale && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                Stale
              </span>
            )}
            {isOld && !isStale && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Clock3 className="h-3 w-3" />
                Old
              </span>
            )}
            {hasInvalidCategory && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <Pin className="h-3 w-3" />
                Invalid Category
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};