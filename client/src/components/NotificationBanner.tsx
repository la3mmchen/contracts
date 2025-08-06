import { Contract } from '@/types/contract';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { calculateNextThreePayments, isPaymentDueSoon } from '@/lib/paymentCalculator';
import { formatCurrency } from '@/lib/currencyFormatter';

interface NotificationBannerProps {
  contracts: Contract[];
}

export const NotificationBanner = ({ contracts }: NotificationBannerProps) => {
  const now = new Date();

  const upcomingPayments = contracts
    .filter(c => c.status === 'active')
    .flatMap(contract => {
      const payments = calculateNextThreePayments(contract);
      return payments
        .filter(payment => {
          const paymentDate = new Date(payment.date);
          const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 7;
        })
        .map(payment => ({
          ...contract,
          paymentDate: payment.date,
          daysUntil: Math.ceil((new Date(payment.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const expiredContracts = contracts.filter(c => c.status === 'expired');
  const overdueContracts = contracts
    .filter(c => c.status === 'active')
    .flatMap(contract => {
      const payments = calculateNextThreePayments(contract);
      return payments
        .filter(payment => {
          const paymentDate = new Date(payment.date);
          const daysOverdue = Math.ceil((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysOverdue > 0;
        })
        .map(payment => ({
          ...contract,
          paymentDate: payment.date,
          daysOverdue: Math.ceil((now.getTime() - new Date(payment.date).getTime()) / (1000 * 60 * 60 * 24)),
        }));
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  if (upcomingPayments.length === 0 && expiredContracts.length === 0 && overdueContracts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertTitle>Upcoming Payments</AlertTitle>
          <AlertDescription>
            You have {upcomingPayments.length} payment{upcomingPayments.length > 1 ? 's' : ''} due in the next 7 days:
            <div className="mt-2 space-y-1">
              {upcomingPayments.map((contract) => (
                <div key={`${contract.id}-${contract.paymentDate}`} className="flex items-center justify-between text-sm">
                  <span>{contract.name}</span>
                  <span className="font-medium">
                    {formatCurrency(contract.amount, contract.currency)} - {contract.daysUntil === 0 ? 'Today' : 
                    contract.daysUntil === 1 ? 'Tomorrow' : `${contract.daysUntil} days`}
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overdue Payments */}
      {overdueContracts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Overdue Payments</AlertTitle>
          <AlertDescription>
            You have {overdueContracts.length} overdue payment{overdueContracts.length > 1 ? 's' : ''}:
            <div className="mt-2 space-y-1">
              {overdueContracts.map((contract) => (
                <div key={`${contract.id}-${contract.paymentDate}`} className="flex items-center justify-between text-sm">
                  <span>{contract.name}</span>
                  <span className="font-medium">
                    {formatCurrency(contract.amount, contract.currency)} - {contract.daysOverdue} day{contract.daysOverdue > 1 ? 's' : ''} overdue
                  </span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Expired Contracts */}
      {expiredContracts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Expired Contracts</AlertTitle>
          <AlertDescription>
            You have {expiredContracts.length} expired contract{expiredContracts.length > 1 ? 's' : ''} that need attention:
            <div className="mt-2 space-y-1">
              {expiredContracts.slice(0, 3).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between text-sm">
                  <span>{contract.name}</span>
                  <span className="font-medium">{contract.company}</span>
                </div>
              ))}
              {expiredContracts.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  ...and {expiredContracts.length - 3} more
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 