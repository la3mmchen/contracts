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
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('Failed to load config');
    }
    config = await response.json();
    return config;
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error);
    // Fallback to defaults
    config = {
      API_URL: 'http://localhost:3001/api',
      APP_NAME: 'Contract Manager',
      CATEGORIES: 'subscription,insurance,utilities,rent,services,software,maintenance,other'
    };
    return config;
  }
};

export const getConfig = (): AppConfig | null => {
  return config;
}; 