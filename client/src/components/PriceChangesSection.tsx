import React from 'react';
import { Contract } from '@/types/contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingDown } from 'lucide-react';

interface PriceChangesSectionProps {
  contract: Contract;
}

export const PriceChangesSection: React.FC<PriceChangesSectionProps> = ({ contract }) => {
  if (!contract.priceChanges || contract.priceChanges.length === 0) {
    return null;
  }

  // Sort price changes by date (newest first)
  const sortedPriceChanges = [...contract.priceChanges].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: contract.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          <Coins className="h-6 w-6 text-amber-600" />
          Price Change History
          <Badge variant="secondary" className="ml-2">
            {contract.priceChanges.length} change{contract.priceChanges.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Complete Change History */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
            Complete History
          </h3>
          <div className="space-y-3">
            {sortedPriceChanges.map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border-l-4 border-primary">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatDate(change.effectiveDate)}
                    </span>
                    <Badge variant="outline" size="sm">
                      {change.newAmount > change.previousAmount ? 'Increase' : 'Decrease'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-lg">
                    <span className="text-muted-foreground line-through">
                      {formatCurrency(change.previousAmount)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(change.newAmount)}
                    </span>
                  </div>
                  {change.reason && (
                    <div className="text-sm text-muted-foreground mt-1 italic">
                      "{change.reason}"
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${change.newAmount > change.previousAmount ? 'text-green-600' : 'text-red-600'}`}>
                    {change.newAmount > change.previousAmount ? '+' : ''}{formatCurrency(change.newAmount - change.previousAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {change.newAmount > change.previousAmount ? 'Increase' : 'Decrease'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
