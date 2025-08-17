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
    return null; // Don't show navigation for invalid state
  }

  // Additional safety check for navigation functions
  if (!onNext || !onPrevious || !onFirst || !onLast || !onShowList) {
    return null; // Don't show navigation if functions are missing
  }

  // Safety check for contract objects
  if (hasPrevious && !previousContract) {
    return null;
  }

  if (hasNext && !nextContract) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Compact Contract Previews */}
        <div className="hidden lg:flex items-center gap-2">
          {hasPrevious && previousContract && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={onPrevious}>
              <div className="flex flex-col items-end text-xs leading-tight">
                <span className="text-muted-foreground text-[10px]">←</span>
                <span className="font-medium text-foreground truncate max-w-28" title={previousContract.name}>
                  {previousContract.name}
                </span>
              </div>
            </div>
          )}
          {hasNext && nextContract && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group" onClick={onNext}>
              <div className="flex flex-col items-start text-xs leading-tight">
                <span className="text-muted-foreground text-[10px]">→</span>
                <span className="font-medium text-foreground truncate max-w-28" title={nextContract.name}>
                  {nextContract.name}
                </span>
              </div>
            </div>
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
              Return to Filtered List
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Return to filtered contracts list</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
