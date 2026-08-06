import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';

/**
 * Gates children behind authentication. When auth is disabled server-side,
 * or the session is authenticated, children render normally. Otherwise the
 * login page is shown.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { loading, authEnabled, authenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authEnabled && !authenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
