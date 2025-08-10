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
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { calculateNextThreePayments, formatPaymentDate } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';
import { CurrencyIcon } from '@/lib/currencyIcons';
import { isValidCategory, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onClose?: (contract: Contract) => void;
  onFilter?: (filterType: string, value: string) => void;
  defaultExpandCustomFields?: boolean;
  onUpdate?: (id: string, updates: Partial<Contract>) => Promise<void>;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  terminated: 'bg-gray-100 text-gray-800 border-gray-200',
};

const categoryColors = {
  subscription: 'bg-blue-100 text-blue-800 border-blue-200',
  insurance: 'bg-orange-100 text-orange-800 border-orange-200',
  utilities: 'bg-green-100 text-green-800 border-green-200',
  rent: 'bg-purple-100 text-purple-800 border-purple-200',
  services: 'bg-gray-100 text-gray-800 border-gray-200',
  maintenance: 'bg-teal-100 text-teal-800 border-teal-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const ContractCard = ({ contract, onEdit, onDelete, onClose, onFilter, defaultExpandCustomFields = false, onUpdate }: ContractCardProps) => {
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(defaultExpandCustomFields);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editingAmount, setEditingAmount] = useState(contract.amount.toString());
  const [editingReason, setEditingReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
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

  const payments = calculateNextThreePayments(contract);
  const nextPayment = payments[0];

  const hasInvalidCategory = !isValidCategory(contract.category);
  const isRecentlyUpdated = new Date(contract.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
  const isStale = new Date(contract.updatedAt).getTime() < Date.now() - 6 * 30 * 24 * 60 * 60 * 1000; // 6 months ago
  const isOld = new Date(contract.updatedAt).getTime() < Date.now() - 3 * 30 * 24 * 60 * 60 * 1000; // 3 months ago
  
  return (
    <Card 
      id={`contract-${contract.id}`}
      className={`group hover:shadow-card transition-all duration-300 bg-gradient-card border-border/50 animate-fade-in ${
        hasInvalidCategory ? 'border-red-300 bg-red-50/30' : ''
      } ${isRecentlyUpdated && !hasInvalidCategory ? 'border-blue-300 bg-blue-50/30' : ''} ${
        isStale && !hasInvalidCategory ? 'border-red-200 bg-red-50/20' : ''
      } ${isOld && !isStale && !hasInvalidCategory ? 'border-yellow-200 bg-yellow-50/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              <Link 
                to={`/contract/${contract.id}`}
                className="hover:underline cursor-pointer"
              >
                {contract.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{contract.company}</p>
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded mt-2 inline-block">
              ID: {contract.contractId}
            </p>
            <p className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${isOld || isStale ? 'font-semibold' : ''}`}>
              {isStale && <AlertTriangle className="h-3 w-3 text-red-600" />}
              {isOld && !isStale && <Clock3 className="h-3 w-3 text-yellow-600" />}
              Updated {formatRelativeTime(contract.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="View details"
            >
              <Link to={`/contract/${contract.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(contract)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit contract"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {contract.status === 'expired' && onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose(contract)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                title="Close contract"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(contract.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              title="Delete contract"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Category Badges */}
        <div className="flex flex-wrap gap-2">
          <span 
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[contract.status]} ${
              onFilter ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
            }`}
            onClick={onFilter ? () => onFilter('status', contract.status) : undefined}
            title={onFilter ? `Filter by status: ${contract.status}` : undefined}
          >
            {contract.status}
          </span>
          <span 
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              isValidCategory(contract.category) 
                ? categoryColors[contract.category] || 'bg-gray-100 text-gray-800 border-gray-200'
                : 'bg-red-100 text-red-800 border-red-200'
            } ${
              onFilter && isValidCategory(contract.category) ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
            }`}
            onClick={onFilter && isValidCategory(contract.category) ? () => onFilter('category', contract.category) : undefined}
            title={onFilter && isValidCategory(contract.category) ? `Filter by category: ${contract.category}` : undefined}
          >
            {!isValidCategory(contract.category) && (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {contract.category}
            {!isValidCategory(contract.category) && (
              <span className="ml-1 text-xs opacity-75">(invalid)</span>
            )}
          </span>
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Contract Period:</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Start: {formatDate(contract.startDate)}</span>
            {contract.endDate && (
              <span>End: {formatDate(contract.endDate)}</span>
            )}
          </div>
        </div>

        {/* Amount and Frequency */}
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CurrencyIcon currency={contract.currency} />
          {isEditingAmount ? (
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
          ) : (
            <div className="group relative">
              <span 
                className="cursor-pointer hover:bg-muted/30 hover:text-foreground transition-all duration-200 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent hover:border-border font-medium"
                onClick={() => onUpdate && setIsEditingAmount(true)}
                title={onUpdate ? "Click to edit amount" : undefined}
              >
                {formatCurrency(contract.amount, contract.currency)}
                {onUpdate && (
                  <Edit className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                )}
              </span>
            </div>
          )}
          <span className="text-sm text-muted-foreground font-normal">
            / {contract.frequency}
          </span>
        </div>

        {/* Latest Price Changes Summary */}
        {contract.priceChanges && contract.priceChanges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-600" />
                <span>Recent price changes:</span>
              </div>
              {contract.priceChanges.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  {contract.priceChanges.length} total
                </span>
              )}
            </div>
            <div className="space-y-1 pl-6">
              {contract.priceChanges
                .slice(-3) // Get the 3 most recent changes
                .reverse() // Show newest first
                .map((change, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-muted/30 px-2 py-1 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDate(change.effectiveDate)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(change.newAmount, contract.currency)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground max-w-24 truncate" title={change.reason}>
                      {change.reason}
                    </span>
                  </div>
                ))}
              {contract.priceChanges.length > 3 && (
                <div className="text-xs text-muted-foreground italic">
                  +{contract.priceChanges.length - 3} more changes
                </div>
              )}
            </div>
          </div>
        )}



        {/* Payment Schedule */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-info" />
              <span>Next 3 payments:</span>
            </div>
            <div className="space-y-1 pl-6">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className={`${payment.isNext ? 'font-medium' : 'text-muted-foreground'}`}>
                    {formatPaymentDate(payment.date)}
                  </span>
                  <span className={`${payment.isNext ? 'font-medium' : 'text-muted-foreground'}`}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          {contract.contactInfo.contactPerson && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-foreground font-medium">{contract.contactInfo.contactPerson}</span>
            </div>
          )}
          {contract.contactInfo.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${contract.contactInfo.email}`}
                className="text-primary hover:underline truncate"
                title={`Send email to ${contract.contactInfo.email}`}
              >
                {contract.contactInfo.email}
              </a>
            </div>
          )}
          {contract.contactInfo.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${contract.contactInfo.phone}`}
                className="text-primary hover:underline"
                title={`Call ${contract.contactInfo.phone}`}
              >
                {contract.contactInfo.phone}
              </a>
            </div>
          )}
          {contract.contactInfo.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a 
                href={contract.contactInfo.website.startsWith('http') ? contract.contactInfo.website : `https://${contract.contactInfo.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
                title={`Visit ${contract.contactInfo.website}`}
              >
                {contract.contactInfo.website}
              </a>
            </div>
          )}
          {contract.contactInfo.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(contract.contactInfo.address)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
                title={`View ${contract.contactInfo.address} on Google Maps`}
              >
                {contract.contactInfo.address}
              </a>
            </div>
          )}
        </div>

        {/* Document Link */}
        {contract.documentLink && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-info" />
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

        {/* Description */}
        {contract.description && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Description:</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 pl-6">
              {contract.description}
            </p>
          </div>
        )}

        {/* Notes */}
        {contract.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Notes:</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 pl-6 bg-muted/30 p-2 rounded">
              {contract.notes}
            </p>
          </div>
        )}

        {/* Price Changes History */}
        {contract.priceChanges && contract.priceChanges.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>Price Changes:</span>
            </div>
            <div className="space-y-2 pl-6">
              {contract.priceChanges.map((change, index) => (
                <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">
                      {formatDate(change.effectiveDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(change.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="line-through">${change.previousAmount.toFixed(2)}</span>
                    <span className="text-foreground">→</span>
                    <span className="font-medium text-foreground">${change.newAmount.toFixed(2)}</span>
                  </div>
                  {change.reason && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Reason: {change.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {contract.customFields && Object.keys(contract.customFields).length > 0 && (
          <Collapsible 
            open={isCustomFieldsOpen}
            onOpenChange={setIsCustomFieldsOpen}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:opacity-80 transition-opacity">
                <FileText className="h-4 w-4" />
                <span>Additional Info:</span>
                {isCustomFieldsOpen ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
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

        {/* Tags */}
        {contract.tags && contract.tags.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1 pl-6">
              {contract.tags.map((tag, index) => (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};