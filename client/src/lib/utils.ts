import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getCategories } from '@/config/categories';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a category is valid (exists in current categories list)
 */
export function isValidCategory(category: string): boolean {
  const validCategories = getCategories();
  return validCategories.includes(category as any);
}

/**
 * Format a date in a human-readable relative format
 * e.g., "5 minutes ago", "2 days ago", "3 weeks ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

// Color palette for dynamic category colors (for badges) - using the new 6-color scheme with better contrast
const badgeColorPalette = [
  'bg-[#01A5E1]/10 text-[#01A5E1] border-[#01A5E1]/20',
  'bg-[#0DD1EE]/10 text-[#0DD1EE] border-[#0DD1EE]/20',
  'bg-[#F5DA6C]/10 text-[#B8860B] border-[#F5DA6C]/20', // Darker text for better contrast
  'bg-[#285CC4]/10 text-[#285CC4] border-[#285CC4]/20',
  'bg-[#A7E459]/10 text-[#4A7C59] border-[#A7E459]/20', // Darker text for better contrast
  'bg-[#E45093]/10 text-[#E45093] border-[#E45093]/20',
  // Repeat the pattern for more categories with better contrast
  'bg-[#01A5E1]/15 text-[#01A5E1] border-[#01A5E1]/25',
  'bg-[#0DD1EE]/15 text-[#0DD1EE] border-[#0DD1EE]/25',
  'bg-[#F5DA6C]/15 text-[#B8860B] border-[#F5DA6C]/25',
  'bg-[#285CC4]/15 text-[#285CC4] border-[#285CC4]/25',
  'bg-[#A7E459]/15 text-[#4A7C59] border-[#A7E459]/25',
  'bg-[#E45093]/15 text-[#E45093] border-[#E45093]/25',
  // Additional variations with better contrast
  'bg-[#01A5E1]/20 text-[#01A5E1] border-[#01A5E1]/30',
  'bg-[#0DD1EE]/20 text-[#0DD1EE] border-[#0DD1EE]/30',
  'bg-[#F5DA6C]/20 text-[#B8860B] border-[#F5DA6C]/30',
  'bg-[#285CC4]/20 text-[#285CC4] border-[#285CC4]/30',
  'bg-[#A7E459]/20 text-[#4A7C59] border-[#A7E459]/30',
  'bg-[#E45093]/20 text-[#E45093] border-[#E45093]/30',
];

// Black and white theme color palette
const blackWhiteBadgePalette = [
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  // Repeat the pattern for more categories
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  // Additional variations
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
  'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
];

// Color palette for dynamic category colors (for stats) - using the new 6-color scheme
const statsColorPalette = [
  'text-[#01A5E1]',
  'text-[#0DD1EE]',
  'text-[#F5DA6C]',
  'text-[#285CC4]',
  'text-[#A7E459]',
  'text-[#E45093]',
  // Repeat the pattern for more categories
  'text-[#01A5E1]',
  'text-[#0DD1EE]',
  'text-[#F5DA6C]',
  'text-[#285CC4]',
  'text-[#A7E459]',
  'text-[#E45093]',
  // Additional variations
  'text-[#01A5E1]',
  'text-[#0DD1EE]',
  'text-[#F5DA6C]',
  'text-[#285CC4]',
  'text-[#A7E459]',
  'text-[#E45093]',
];

// Black and white theme stats colors
const blackWhiteStatsPalette = [
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  // Repeat the pattern for more categories
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  // Additional variations
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
  'text-gray-800 dark:text-gray-200',
];

const statsBgColorPalette = [
  'bg-[#01A5E1]/10',
  'bg-[#0DD1EE]/10',
  'bg-[#F5DA6C]/10',
  'bg-[#285CC4]/10',
  'bg-[#A7E459]/10',
  'bg-[#E45093]/10',
  // Repeat the pattern for more categories
  'bg-[#01A5E1]/15',
  'bg-[#0DD1EE]/15',
  'bg-[#F5DA6C]/15',
  'bg-[#285CC4]/15',
  'bg-[#A7E459]/15',
  'bg-[#E45093]/15',
  // Additional variations
  'bg-[#01A5E1]/20',
  'bg-[#0DD1EE]/20',
  'bg-[#F5DA6C]/20',
  'bg-[#285CC4]/20',
  'bg-[#A7E459]/20',
  'bg-[#E45093]/20',
];

// Black and white theme stats background colors
const blackWhiteStatsBgPalette = [
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  // Repeat the pattern for more categories
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  // Additional variations
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
  'bg-gray-100 dark:bg-gray-800',
];

/**
 * Generates a consistent color for any category
 * @param category - The category name
 * @returns A Tailwind CSS class string for the category color
 */
export const getCategoryBadgeColor = (category: string): string => {
  // Check if we're in black-and-white theme
  const isBlackWhiteTheme = document.documentElement.classList.contains('black-and-white');
  
  // Generate a consistent color for all categories using hash
  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colorIndex = Math.abs(hash) % badgeColorPalette.length;
  
  // Return appropriate color palette based on theme
  if (isBlackWhiteTheme) {
    return blackWhiteBadgePalette[colorIndex];
  }
  
  return badgeColorPalette[colorIndex];
};

/**
 * Generates consistent colors for category stats
 * @param category - The category name
 * @returns An object with color and bgColor Tailwind CSS classes
 */
export const getCategoryStatsColor = (category: string): { color: string; bgColor: string } => {
  // Check if we're in black-and-white theme
  const isBlackWhiteTheme = document.documentElement.classList.contains('black-and-white');
  
  // Generate a consistent color for all categories using hash
  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colorIndex = Math.abs(hash) % statsColorPalette.length;
  
  // Return appropriate color palette based on theme
  if (isBlackWhiteTheme) {
    return {
      color: blackWhiteStatsPalette[colorIndex],
      bgColor: blackWhiteStatsBgPalette[colorIndex]
    };
  }
  
  return {
    color: statsColorPalette[colorIndex],
    bgColor: statsBgColorPalette[colorIndex]
  };
};
