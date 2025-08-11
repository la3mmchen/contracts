import { getConfig } from '../services/config';

// Default statuses if no environment variable is provided
const DEFAULT_STATUSES = [
  'active',
  'expired',
  'cancelled',
  'terminated',
  'closed'
] as const;

// Load statuses from runtime config or use defaults
export const getStatuses = (): readonly string[] => {
  // Try to get statuses from runtime config
  const config = getConfig();
  if (config?.STATUSES) {
    return config.STATUSES.split(',').map(status => status.trim()) as readonly string[];
  }
  
  return DEFAULT_STATUSES;
};

// Get status display names (capitalized)
export const getStatusDisplayName = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Type for status values
export type Status = ReturnType<typeof getStatuses>[number];
