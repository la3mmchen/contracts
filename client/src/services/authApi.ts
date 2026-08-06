import { loadConfig } from './config';

let API_BASE = 'http://localhost:3001/api';
let configLoaded = false;

const ensureConfigLoaded = async () => {
  if (!configLoaded) {
    try {
      const config = await loadConfig();
      API_BASE = config.API_URL;
    } catch {
      console.warn('Failed to load config, using default API URL');
    }
    configLoaded = true;
  }
};

export interface AuthStatus {
  authEnabled: boolean;
  authenticated: boolean;
}

export const authApi = {
  async getStatus(): Promise<AuthStatus> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/auth/status`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch auth status');
    }
    return response.json();
  },

  async login(password: string): Promise<AuthStatus> {
    await ensureConfigLoaded();
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.status === 401) {
      throw new Error('Invalid password');
    }
    if (!response.ok) {
      throw new Error('Login failed');
    }
    return response.json();
  },

  async logout(): Promise<void> {
    await ensureConfigLoaded();
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
