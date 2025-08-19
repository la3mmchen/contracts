interface AppConfig {
  API_URL: string;
  APP_NAME: string;
  CATEGORIES: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (config) {
    return config;
  }

  try {
    // Try to load config from the current base path
    const response = await fetch('./config.json');
    if (!response.ok) {
      throw new Error('Failed to load config');
    }
    config = await response.json();
    
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