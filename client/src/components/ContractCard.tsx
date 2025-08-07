import { Contract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
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
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { calculateNextThreePayments, formatPaymentDate } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';
import { CurrencyIcon } from '@/lib/currencyIcons';
import { isValidCategory } from '@/lib/utils';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onClose?: (contract: Contract) => void;
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

export const ContractCard = ({ contract, onEdit, onDelete, onClose }: ContractCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const payments = calculateNextThreePayments(contract);
  const nextPayment = payments[0];

  const hasInvalidCategory = !isValidCategory(contract.category);
  
  return (
    <Card className={`group hover:shadow-card transition-all duration-300 bg-gradient-card border-border/50 animate-fade-in ${
      hasInvalidCategory ? 'border-red-300 bg-red-50/30' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {contract.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{contract.company}</p>
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded mt-2 inline-block">
              ID: {contract.contractId}
            </p>
          </div>
          <div className="flex gap-2">
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
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[contract.status]}`}>
            {contract.status}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            isValidCategory(contract.category) 
              ? categoryColors[contract.category] || 'bg-gray-100 text-gray-800 border-gray-200'
              : 'bg-red-100 text-red-800 border-red-200'
          }`}>
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
          <span>{formatCurrency(contract.amount, contract.currency)}</span>
          <span className="text-sm text-muted-foreground font-normal">
            / {contract.frequency}
          </span>
        </div>

        {/* Payment Schedule */}
        {payments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-info" />
              <span className="text-muted-foreground">Next 3 payments:</span>
            </div>
            <div className="space-y-1">
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

        {/* Tags */}
        {contract.tags && contract.tags.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Tags:</span>
            </div>
            <div className="flex flex-wrap gap-1 pl-6">
              {contract.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
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