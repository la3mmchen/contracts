import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ContractLayout = 'grid' | 'list';
export type ContractGroupBy = 'category' | 'person' | 'updated';

interface ViewModeToggleProps {
  layout: ContractLayout;
  onLayoutChange: (layout: ContractLayout) => void;
}

const pillBase =
  'h-10 sm:h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border hover:scale-105 px-4';
const pillActive = 'bg-primary text-primary-foreground border-primary';
const pillInactive =
  'bg-background/80 backdrop-blur-sm border-border hover:bg-background/90';

export const ViewModeToggle = ({ layout, onLayoutChange }: ViewModeToggleProps) => {
  const isList = layout === 'list';

  return (
    <Button
      variant={isList ? 'default' : 'secondary'}
      size="sm"
      onClick={() => onLayoutChange(isList ? 'grid' : 'list')}
      className={`${pillBase} ${isList ? pillActive : pillInactive}`}
      title={isList ? 'Switch to grid view' : 'Switch to list view'}
      aria-label={isList ? 'Switch to grid view' : 'Switch to list view'}
    >
      {isList ? (
        <>
          <LayoutGrid className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">Grid</span>
        </>
      ) : (
        <>
          <List className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">List</span>
        </>
      )}
    </Button>
  );
};
