import { useEffect, useState } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { smartApi } from '../services/smartApi';

export const DemoModeBanner = () => {
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await smartApi.getApiStatus();
        setIsDemoMode(status.mode === 'demo');
      } catch (error) {
        console.warn('Failed to check API status:', error);
        setIsDemoMode(true); // Assume demo mode on error
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || isDemoMode === null) {
    return null;
  }

  if (!isDemoMode) {
    return null; // Don't show banner when API is available
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="flex items-center justify-center space-x-2 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Demo Mode - Using sample data
        </span>
        <WifiOff className="h-4 w-4" />
        <span className="text-xs text-amber-600">
          (No API connection available)
        </span>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-amber-700">
          This is a demonstration of the Contracts app. All data is sample data and will not persist.
          To use with real data, run the API server locally or deploy to your own server.
        </p>
      </div>
    </div>
  );
};
