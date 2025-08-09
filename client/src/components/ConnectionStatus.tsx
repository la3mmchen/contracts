import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { loadConfig } from '@/services/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export const ConnectionStatus = ({ onStatusChange }: ConnectionStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [details, setDetails] = useState<{ status: string; message?: string; details?: unknown } | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [dataInfo, setDataInfo] = useState<{ dataDir: string; contractsDir: string; contractCount: number; fileStructure: string } | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:3001/api');

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const result = await api.checkApiHealth();
      setDetails(result);
      
      if (result.status === 'ok') {
        setStatus('connected');
        onStatusChange?.(true);
        
        // Also fetch data info when connected
        try {
          const dataResult = await api.getDataInfo();
          setDataInfo(dataResult);
        } catch (dataError) {
          console.warn('Failed to fetch data info:', dataError);
        }
      } else {
        setStatus('error');
        onStatusChange?.(false);
      }
    } catch (error) {
      setStatus('error');
      setDetails({ 
        status: 'error',
        message: 'Failed to check API health', 
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      onStatusChange?.(false);
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Load configuration first, then check connection
    const initializeConnection = async () => {
      try {
        const config = await loadConfig();
        setApiUrl(config.API_URL);
      } catch (error) {
        console.warn('Failed to load config, using default API URL');
      }
      checkConnection();
    };
    
    initializeConnection();

    // Set up periodic connectivity check every 15 seconds
    const intervalId = setInterval(() => {
      checkConnection();
    }, 15000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  // When connected, show minimal info
  if (status === 'connected') {
    return (
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </span>
        {lastChecked && (
          <span className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }

  // When checking or error, show full card
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Server Connection Status</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={status === 'checking'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${status === 'checking' ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={status === 'checking' ? 'default' : 'destructive'}>
              {status === 'checking' && 'Checking...'}
              {status === 'error' && 'Connection Error'}
            </Badge>
          </div>

          {/* Status Message - Only show when there's an error */}
          {status === 'error' && details && (
            <Alert className={getStatusColor()}>
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>
                {details.message}
                {details.details && (
                  <div className="mt-2 text-sm opacity-75">
                    <div className="mb-2">
                      <strong>API Response:</strong>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                      {JSON.stringify(details.details, null, 2)}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* API URL Info - Only show when there's an error */}
          {status === 'error' && (
            <div className="text-sm text-muted-foreground">
              <strong>API URL:</strong> {apiUrl}
            </div>
          )}

          {/* Last Checked */}
          {lastChecked && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          {/* Troubleshooting Tips */}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Check if the API server is running</li>
                <li>• Verify the API URL configuration</li>
                <li>• Check network connectivity</li>
                <li>• Review server logs for errors</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 