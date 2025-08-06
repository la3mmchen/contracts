import { loadConfig } from '../services/config';

// App configuration
export const appConfig = {
  name: 'Contract Manager', // Will be updated by loadConfig
  categories: [
    'subscription',
    'insurance', 
    'utilities',
    'rent',
    'services',
    'software',
    'maintenance',
    'other'
  ]
};

// Initialize app config from runtime config
loadConfig().then(config => {
  appConfig.name = config.APP_NAME;
  appConfig.categories = config.CATEGORIES.split(',');
}).catch(() => {
  // Keep defaults if config fails to load
}); 