import { Contract, ContractStats } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Building
} from 'lucide-react';

interface ContractAnalyticsProps {
  contracts: Contract[];
  stats: ContractStats;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ContractAnalytics = ({ contracts, stats }: ContractAnalyticsProps) => {
  const categoryData = Object.entries(stats.categoryBreakdown).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
  }));

  const statusData = Object.entries(stats.statusBreakdown).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const monthlyExpensesData = contracts
    .filter(c => c.status === 'active')
    .map(contract => ({
      name: contract.name,
      amount: contract.frequency === 'monthly' ? contract.amount :
              contract.frequency === 'quarterly' ? contract.amount / 3 :
              contract.frequency === 'yearly' ? contract.amount / 12 :
              contract.frequency === 'weekly' ? contract.amount * 4.33 :
              contract.frequency === 'bi-weekly' ? contract.amount * 2.17 : contract.amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const upcomingPayments = contracts
    .filter(c => c.status === 'active' && c.paymentInfo.nextPaymentDate)
    .map(contract => ({
      name: contract.name,
      date: new Date(contract.paymentInfo.nextPaymentDate!),
      amount: contract.amount,
      daysUntil: Math.ceil((new Date(contract.paymentInfo.nextPaymentDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .filter(payment => payment.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From active contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Contracts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredContracts}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(status.name.toLowerCase())}>
                      {status.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {status.value} contracts
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {((status.value / stats.totalContracts) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Monthly Cost']} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{payment.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${payment.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.daysUntil === 0 ? 'Today' : 
                       payment.daysUntil === 1 ? 'Tomorrow' : 
                       `${payment.daysUntil} days`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 