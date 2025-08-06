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
  Clock,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
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

export const ContractCard = ({ contract, onEdit, onDelete }: ContractCardProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getNextPaymentDate = () => {
    if (contract.paymentInfo.nextPaymentDate) {
      return format(new Date(contract.paymentInfo.nextPaymentDate), 'MMM dd, yyyy');
    }
    return 'Not set';
  };

  const isExpiringSoon = () => {
    if (!contract.paymentInfo.nextPaymentDate) return false;
    const nextPayment = new Date(contract.paymentInfo.nextPaymentDate);
    const today = new Date();
    const daysUntilPayment = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilPayment <= 7 && daysUntilPayment >= 0;
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 bg-gradient-card border-border/50 animate-fade-in">
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
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(contract.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
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
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${categoryColors[contract.category]}`}>
            {contract.category}
          </span>
          {isExpiringSoon() && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-warning text-warning-foreground animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              Due Soon
            </span>
          )}
        </div>

        {/* Amount and Frequency */}
        <div className="flex items-center gap-2 text-lg font-semibold">
          <DollarSign className="h-5 w-5 text-success" />
          <span>{formatCurrency(contract.amount, contract.currency)}</span>
          <span className="text-sm text-muted-foreground font-normal">
            / {contract.frequency}
          </span>
        </div>

        {/* Payment Info */}
        {contract.paymentInfo.nextPaymentDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-info" />
            <span className="text-muted-foreground">Next payment:</span>
            <span className={isExpiringSoon() ? 'text-warning font-medium' : 'text-foreground'}>
              {getNextPaymentDate()}
            </span>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2">
          {contract.contactInfo.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{contract.contactInfo.email}</span>
            </div>
          )}
          {contract.contactInfo.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{contract.contactInfo.phone}</span>
            </div>
          )}
          {contract.contactInfo.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="truncate">{contract.contactInfo.website}</span>
            </div>
          )}
          {contract.contactInfo.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{contract.contactInfo.address}</span>
            </div>
          )}
          {contract.documentLink && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <a 
                href={contract.documentLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                View Document
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {contract.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contract.description}
          </p>
        )}

        {/* Tags */}
        {contract.tags && contract.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contract.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};