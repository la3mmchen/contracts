interface AppConfig {
  API_URL: string;
  APP_NAME: string;
  CATEGORIES: string;
  STATUSES?: string;
  CURRENCIES?: string;
  FREQUENCIES?: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (config) {
    return config;
  }

  try {
    // Try to load config from the root path, not relative to current location
    const basePath = window.location.pathname.includes('/contracts/') ? '/contracts' : '';
    const configUrl = `${basePath}/config.json?t=${Date.now()}`;

    // Runtime config is volume-mounted/edited by admins; never use a cached
    // copy or a stale value silently persists until a hard refresh.
    const response = await fetch(configUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const configText = await response.text();
    try {
      config = JSON.parse(configText);
    } catch (parseError) {
      throw new Error(`Invalid JSON in config: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    // Adjust API_URL based on current location for GitHub Pages
    if (window.location.pathname.includes('/contracts/')) {
      config.API_URL = '/contracts/api';
    }
    
    return config;
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error);
    // Fallback to defaults with base path detection
    const basePath = window.location.pathname.includes('/contracts/') ? '/contracts' : '';
    config = {
      API_URL: `${basePath}/api`,
      APP_NAME: 'Contract Manager',
      CATEGORIES: 'subscription,insurance,utilities,rent,services,software,maintenance,other'
    };
    return config;
  }
};

export const getConfig = (): AppConfig | null => {
  return config;
};

// Force reload config (useful for debugging or when config changes)
export const reloadConfig = async (): Promise<AppConfig> => {
  config = null;
  return await loadConfig();
}; 