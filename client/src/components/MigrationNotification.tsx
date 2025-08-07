import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Info } from 'lucide-react';

interface MigrationNotificationProps {
  migratedCount: number;
  totalCount: number;
  onDismiss: () => void;
}

export const MigrationNotification = ({ 
  migratedCount, 
  totalCount, 
  onDismiss 
}: MigrationNotificationProps) => {
  if (migratedCount === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <CheckCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Contracts Updated</AlertTitle>
      <AlertDescription className="text-blue-700">
        {migratedCount} of {totalCount} contracts have been automatically updated to the new format. 
        Your contracts now use the improved payment calculation system.
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDismiss}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 