import { Contract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  FileText, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface ContractStatsProps {
  contracts: Contract[];
}

export const ContractStats = ({ contracts }: ContractStatsProps) => {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiredContracts = contracts.filter(c => c.status === 'expired');
  const pendingContracts = contracts.filter(c => c.status === 'pending');
  const cancelledContracts = contracts.filter(c => c.status === 'cancelled');

  const totalMonthlyAmount = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, contract) => {
      let monthlyAmount = 0;
      switch (contract.frequency) {
        case 'monthly':
          monthlyAmount = contract.amount;
          break;
        case 'quarterly':
          monthlyAmount = contract.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = contract.amount / 12;
          break;
        default:
          monthlyAmount = 0;
      }
      return sum + monthlyAmount;
    }, 0);

  const totalYearlyAmount = totalMonthlyAmount * 12;

  const contractsDueSoon = contracts.filter(contract => {
    if (!contract.paymentInfo.nextPaymentDate) return false;
    const nextPayment = new Date(contract.paymentInfo.nextPaymentDate);
    const today = new Date();
    const daysUntilPayment = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilPayment <= 7 && daysUntilPayment >= 0;
  }).length;

  const stats = [
    {
      title: 'Total Contracts',
      value: contracts.length,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Contracts',
      value: activeContracts.length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Expired Contracts',
      value: expiredContracts.length,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Pending Contracts',
      value: pendingContracts.length,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Due Soon',
      value: contractsDueSoon,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Monthly Spend',
      value: `$${totalMonthlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Yearly Spend',
      value: `$${totalYearlyAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className={`${stat.bgColor} p-2 rounded-lg mb-1`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-tight">
                {stat.title}
              </p>
              <p className="text-lg font-bold text-foreground leading-tight">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};