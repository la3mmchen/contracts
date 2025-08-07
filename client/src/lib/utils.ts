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
