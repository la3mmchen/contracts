import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  List
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ContractNavigationProps {
  currentIndex: number;
  totalContracts: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onFirst: () => void;
  onLast: () => void;
  onShowList: () => void;
  className?: string;
  previousContract?: { name: string } | null;
  nextContract?: { name: string } | null;
}

export const ContractNavigation: React.FC<ContractNavigationProps> = ({
  currentIndex,
  totalContracts,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onFirst,
  onLast,
  onShowList,
  className = '',
  previousContract,
  nextContract
}) => {
  // Comprehensive safety check: ensure all required props are present and valid
  if (!currentIndex || !totalContracts || totalContracts <= 1) {
    console.log('ContractNavigation: Invalid state - currentIndex:', currentIndex, 'totalContracts:', totalContracts);
    return null; // Don't show navigation for invalid state
  }

  // Additional safety check for navigation functions
  if (!onNext || !onPrevious || !onFirst || !onLast || !onShowList) {
    console.log('ContractNavigation: Missing navigation functions');
    return null; // Don't show navigation if functions are missing
  }

  // Safety check for contract objects
  if (hasPrevious && !previousContract) {
    console.log('ContractNavigation: hasPrevious is true but previousContract is missing');
    return null;
  }

  if (hasNext && !nextContract) {
    console.log('ContractNavigation: hasNext is true but nextContract is missing');
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Position indicator */}
        <Badge variant="secondary" className="px-3 py-1">
          {currentIndex} of {totalContracts}
        </Badge>
        
        {/* Contract preview */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          {hasPrevious && previousContract && (
            <span className="truncate max-w-24" title="Previous contract">
              ← {previousContract.name}
            </span>
          )}
          {hasNext && nextContract && (
            <span className="truncate max-w-24" title="Next contract">
              {nextContract.name} →
            </span>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onFirst}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>First contract</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous contract</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next contract</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onLast}
                disabled={!hasNext}
                className="h-8 w-8 p-0"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last contract</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Show list button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowList}
              className="h-8 px-2 text-xs"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show all contracts</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Keyboard shortcuts hint */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
          <span>← →</span>
          <span>Home End</span>
        </div>
      </div>
    </TooltipProvider>
  );
};
