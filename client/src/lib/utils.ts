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

// Color palette for dynamic category colors (for badges)
const badgeColorPalette = [
  'bg-red-100 text-red-800 border-red-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-lime-100 text-lime-800 border-lime-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-slate-100 text-slate-800 border-slate-200',
  'bg-zinc-100 text-zinc-800 border-zinc-200',
  'bg-stone-100 text-stone-800 border-stone-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'bg-sky-100 text-sky-800 border-sky-200',
];

// Color palette for dynamic category colors (for stats)
const statsColorPalette = [
  'text-red-600',
  'text-pink-600',
  'text-purple-600',
  'text-indigo-600',
  'text-blue-600',
  'text-cyan-600',
  'text-teal-600',
  'text-emerald-600',
  'text-green-600',
  'text-lime-600',
  'text-yellow-600',
  'text-amber-600',
  'text-orange-600',
  'text-rose-600',
  'text-slate-600',
  'text-zinc-600',
  'text-stone-600',
  'text-violet-600',
  'text-fuchsia-600',
  'text-sky-600',
];

const statsBgColorPalette = [
  'bg-red-100',
  'bg-pink-100',
  'bg-purple-100',
  'bg-indigo-100',
  'bg-blue-100',
  'bg-cyan-100',
  'bg-teal-100',
  'bg-emerald-100',
  'bg-green-100',
  'bg-lime-100',
  'bg-yellow-100',
  'bg-amber-100',
  'bg-orange-100',
  'bg-rose-100',
  'bg-slate-100',
  'bg-zinc-100',
  'bg-stone-100',
  'bg-violet-100',
  'bg-fuchsia-100',
  'bg-sky-100',
];

/**
 * Generates a consistent color for any category
 * @param category - The category name
 * @returns A Tailwind CSS class string for the category color
 */
export const getCategoryBadgeColor = (category: string): string => {
  // Generate a consistent color for all categories using hash
  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colorIndex = Math.abs(hash) % badgeColorPalette.length;
  return badgeColorPalette[colorIndex];
};

/**
 * Generates consistent colors for category stats
 * @param category - The category name
 * @returns An object with color and bgColor Tailwind CSS classes
 */
export const getCategoryStatsColor = (category: string): { color: string; bgColor: string } => {
  // Generate a consistent color for all categories using hash
  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colorIndex = Math.abs(hash) % statsColorPalette.length;
  return {
    color: statsColorPalette[colorIndex],
    bgColor: statsBgColorPalette[colorIndex]
  };
};
