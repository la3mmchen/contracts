import React from 'react';
import { Contract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from '@/components/ui/chart';
import { calculateNextThreePayments } from '@/lib/paymentCalculator';

interface PriceOverTimeChart {
  contract: Contract;
}

export const PriceOverTimeChart: React.FC<PriceOverTimeChart> = ({ contract }) => {
  // Generate payment data for the next 12 months
  const generatePaymentData = () => {
    const { startDate, frequency, amount, currency, endDate, priceChanges } = contract;
    const data: Array<{ month: string; amount: number; label: string; isCurrent: boolean }> = [];
    
    if (frequency === 'one-time') {
      return [{
        month: new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount,
        label: 'One-time payment',
        isCurrent: true
      }];
    }

    // Sort price changes by date (oldest first)
    const sortedPriceChanges = priceChanges ? [...priceChanges].sort(
      (a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime()
    ) : [];

    let currentDate = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const now = new Date();
    let currentAmount = amount;
    let monthCount = 0;

    // Add initial payment
    data.push({
      month: currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: sortedPriceChanges.length > 0 ? sortedPriceChanges[0].previousAmount : amount,
      label: `Payment ${monthCount + 1}`,
      isCurrent: false
    });
    monthCount += 1;

    // Add data points for each price change
    sortedPriceChanges.forEach((change, index) => {
      const changeDate = new Date(change.effectiveDate);
      
      // Add the new amount after the change
      data.push({
        month: changeDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: change.newAmount,
        label: `Price Change ${index + 1}`,
        isCurrent: index === sortedPriceChanges.length - 1 // Mark the most recent as current
      });
    });

    // Add future payments if we have price changes
    if (sortedPriceChanges.length > 0) {
      let futureDate = new Date(sortedPriceChanges[sortedPriceChanges.length - 1].effectiveDate);
      
      // Add next 3-6 months of future payments at current price
      for (let i = 0; i < 6 && monthCount < 12; i++) {
        switch (frequency) {
          case 'weekly':
            futureDate.setDate(futureDate.getDate() + 7);
            break;
          case 'bi-weekly':
            futureDate.setDate(futureDate.getDate() + 14);
            break;
          case 'monthly':
            futureDate.setMonth(futureDate.getMonth() + 1);
            break;
          case 'quarterly':
            futureDate.setMonth(futureDate.getMonth() + 3);
            break;
          case 'yearly':
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            break;
          default:
            futureDate.setMonth(futureDate.getMonth() + 1);
        }
        
        if (futureDate <= end) {
          data.push({
            month: futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            amount: amount, // Current contract amount
            label: `Future Payment ${i + 1}`,
            isCurrent: false
          });
          monthCount += 1;
        }
      }
    } else {
      // No price changes, generate future payments from start date
      let futureDate = new Date(startDate);
      
      for (let i = 0; i < 12 && monthCount < 12; i++) {
        switch (frequency) {
          case 'weekly':
            futureDate.setDate(futureDate.getDate() + 7);
            break;
          case 'bi-weekly':
            futureDate.setDate(futureDate.getDate() + 14);
            break;
          case 'monthly':
            futureDate.setMonth(futureDate.getMonth() + 1);
            break;
          case 'quarterly':
            futureDate.setMonth(futureDate.getMonth() + 3);
            break;
          case 'yearly':
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            break;
          default:
            futureDate.setMonth(futureDate.getMonth() + 1);
        }
        
        if (futureDate <= end) {
          data.push({
            month: futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            amount: amount,
            label: `Future Payment ${i + 1}`,
            isCurrent: false
          });
          monthCount += 1;
        }
      }
    }

    return data;
  };

  const paymentData = generatePaymentData();

  // Chart configuration
  const chartConfig = {
    payment: {
      label: "Payment Amount",
      color: "hsl(var(--chart-1))",
    },
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: contract.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (paymentData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No payment data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Line Chart */}
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 10 }}
                width={60}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={(props) => {
                  // Safely access the data point
                  const index = props.payload?.index;
                  const dataPoint = index !== undefined && paymentData[index];
                  
                  if (!dataPoint) {
                    // Fallback to default dot if data is not available
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill="hsl(var(--chart-1))"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                      />
                    );
                  }
                  
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={dataPoint.isCurrent ? 6 : 3}
                      fill={dataPoint.isCurrent ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
                      stroke={dataPoint.isCurrent ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
                      strokeWidth={dataPoint.isCurrent ? 3 : 2}
                    />
                  );
                }}
                activeDot={{ r: 8, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>

          {/* Summary */}
          <div className="text-center pt-2 border-t">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(contract.amount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {contract.frequency} • {contract.currency}
            </div>
            {contract.priceChanges && contract.priceChanges.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                Last updated: {new Date(contract.priceChanges[contract.priceChanges.length - 1].effectiveDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
