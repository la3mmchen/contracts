import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/authApi';
import { setUnauthorizedHandler } from '@/services/authEvents';

interface AuthContextValue {
  /** Whether the server requires authentication. */
  authEnabled: boolean;
  /** Whether the current session is authenticated (always true when auth is disabled). */
  authenticated: boolean;
  /** True while the initial auth status is being resolved. */
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-check auth status with the server (e.g. after a 401). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const status = await authApi.getStatus();
      setAuthEnabled(status.authEnabled);
      setAuthenticated(status.authenticated);
    } catch {
      // If the status endpoint is unreachable (e.g. demo mode / no API),
      // treat auth as disabled so the app still renders.
      setAuthEnabled(false);
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // React to 401s from any fetch layer by marking the session unauthenticated,
  // which flips the app to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthEnabled(true);
      setAuthenticated(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (password: string) => {
    const status = await authApi.login(password);
    setAuthEnabled(status.authEnabled);
    setAuthenticated(status.authenticated);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ authEnabled, authenticated, loading, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
