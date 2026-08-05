import { Contract } from '@/types/contract';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Edit,
  Trash2,
  Copy,
  FileText,
  AlertTriangle,
  Pin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateNextThreePayments, formatPaymentDate } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';
import { isValidCategory, getCategoryBadgeColor } from '@/lib/utils';
import { getStatusDisplayName } from '@/config/statuses';

interface ContractListRowProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onCopy?: (contract: Contract) => void;
  onFilter?: (filterType: string, value: string) => void;
  currentSearchParams?: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
  cancelled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  closed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  terminated: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
};

const getBasePath = () => {
  return window.location.pathname.includes('/contracts/') ? '/contracts' : '';
};

export const ContractListRow = ({
  contract,
  onEdit,
  onDelete,
  onCopy,
  onFilter,
  currentSearchParams,
}: ContractListRowProps) => {
  const payments = calculateNextThreePayments(contract);
  const nextPayment = payments[0];
  const hasInvalidCategory = !isValidCategory(contract.category);
  const detailTo = `${getBasePath()}/contract/${contract.id}${currentSearchParams ? `?${currentSearchParams}` : ''}`;

  return (
    <div
      id={`contract-${contract.id}`}
      className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
    >
      {/* Pinned indicator */}
      {contract.pinned && (
        <Pin className="h-4 w-4 shrink-0 text-[#01A5E1]" fill="currentColor" aria-label="Pinned" />
      )}

      {/* Name + company (primary, links to detail) */}
      <div className="min-w-0 flex-1">
        <Link
          to={detailTo}
          className="block truncate font-semibold text-foreground hover:text-primary hover:underline"
          title={contract.name}
        >
          {contract.name}
        </Link>
        {contract.company && (
          <div className="truncate text-xs text-muted-foreground" title={contract.company}>
            {contract.company}
          </div>
        )}
      </div>

      {/* Status flags */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        {contract.draft && (
          <Badge
            variant="secondary"
            className={`bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 text-xs whitespace-nowrap border border-blue-200 ${onFilter ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onFilter ? () => onFilter('draft', 'true') : undefined}
            title="Draft"
          >
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        )}
        {contract.needsMoreInfo && (
          <Badge
            variant="secondary"
            className={`bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-xs whitespace-nowrap border border-yellow-200 ${onFilter ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onFilter ? () => onFilter('needsMoreInfo', 'true') : undefined}
            title="Needs Info"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Needs Info
          </Badge>
        )}
      </div>

      {/* Category */}
      <div className="hidden sm:block shrink-0">
        <Badge
          variant="secondary"
          className={`text-xs whitespace-nowrap border ${
            hasInvalidCategory
              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200'
              : getCategoryBadgeColor(contract.category)
          } ${onFilter ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={onFilter ? () => onFilter('category', contract.category) : undefined}
          title="Category"
        >
          {contract.category}
        </Badge>
      </div>

      {/* Status */}
      <div className="hidden lg:block shrink-0 w-24 text-right">
        <Badge
          variant="secondary"
          className={`${statusColors[contract.status] ?? ''} text-xs whitespace-nowrap border ${onFilter ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={onFilter ? () => onFilter('status', contract.status) : undefined}
          title="Status"
        >
          {getStatusDisplayName(contract.status)}
        </Badge>
      </div>

      {/* Amount + frequency */}
      <div className="shrink-0 w-28 text-right">
        <div className="font-semibold text-foreground whitespace-nowrap">
          {formatCurrency(contract.amount, contract.currency)}
        </div>
        <div className="text-xs text-muted-foreground capitalize">{contract.frequency}</div>
      </div>

      {/* Next payment */}
      <div className="hidden xl:block shrink-0 w-32 text-right">
        {nextPayment ? (
          <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="whitespace-nowrap">{formatPaymentDate(nextPayment.date)}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(contract)}
          title="Edit contract"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {onCopy && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCopy(contract)}
            title="Copy contract"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(contract.id)}
          title="Delete contract"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
