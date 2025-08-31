import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Lightbulb,
  Edit
} from 'lucide-react';
import { 
  calculateDataQualityScore, 
  type DataQualityScore as DataQualityScoreType 
} from '@/lib/dataQualityCalculator';
import { Contract } from '@/types/contract';

interface DataQualityScoreProps {
  contract: Contract;
  onEdit?: () => void;
}

export const DataQualityScore: React.FC<DataQualityScoreProps> = ({ 
  contract, 
  onEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const qualityScore = calculateDataQualityScore(contract);





  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Data Quality Score
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold">{qualityScore.percentage}%</span>
            {qualityScore.score > qualityScore.maxScore && (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                +{qualityScore.score - qualityScore.maxScore} bonus
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {qualityScore.score} / {qualityScore.maxScore} points
            {qualityScore.score > qualityScore.maxScore && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {' '}(+{qualityScore.score - qualityScore.maxScore} bonus)
              </span>
            )}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300 bg-primary"
            style={{ width: `${qualityScore.percentage}%` }}
          />
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* Missing Fields */}
            {qualityScore.missingFields.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Missing Fields</span>
                </div>
                <div className="space-y-1">
                  {qualityScore.missingFields.slice(0, 3).map((field, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      {field}
                    </div>
                  ))}
                  {qualityScore.missingFields.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{qualityScore.missingFields.length - 3} more fields
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {qualityScore.suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Suggestions</span>
                </div>
                <div className="space-y-1">
                  {qualityScore.suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {onEdit && qualityScore.percentage < 100 && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Improve Data Quality
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick Summary */}
        {!isExpanded && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {qualityScore.missingFields.length > 0 
                ? `${qualityScore.missingFields.length} field${qualityScore.missingFields.length === 1 ? '' : 's'} missing`
                : 'All critical fields completed'
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
