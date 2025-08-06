import { Contract } from '@/types/contract';
import { formatCurrency } from '@/lib/currencyFormatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  FileText, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Coins
} from 'lucide-react';

interface ContractStatsProps {
  contracts: Contract[];
}

export const ContractStats = ({ contracts }: ContractStatsProps) => {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiredContracts = contracts.filter(c => c.status === 'expired');
  const cancelledContracts = contracts.filter(c => c.status === 'cancelled');
  const closedContracts = contracts.filter(c => c.status === 'closed');

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
        case 'weekly':
          monthlyAmount = contract.amount * 4.33;
          break;
        case 'bi-weekly':
          monthlyAmount = contract.amount * 2.17;
          break;
        default:
          monthlyAmount = 0;
      }
      return sum + monthlyAmount;
    }, 0);

  const totalYearlyAmount = totalMonthlyAmount * 12;

  // Get the most common currency from active contracts, default to USD
  const activeContractsWithCurrency = contracts.filter(c => c.status === 'active');
  const currencyCounts = activeContractsWithCurrency.reduce((acc, contract) => {
    acc[contract.currency] = (acc[contract.currency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const primaryCurrency = Object.keys(currencyCounts).length > 0 
    ? Object.entries(currencyCounts).sort(([,a], [,b]) => b - a)[0][0]
    : 'USD';

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
      title: 'Closed Contracts',
      value: closedContracts.length,
      icon: XCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
    },
    {
      title: 'Monthly Spend',
      value: formatCurrency(totalMonthlyAmount, primaryCurrency),
      icon: Coins,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Yearly Spend',
      value: formatCurrency(totalYearlyAmount, primaryCurrency),
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