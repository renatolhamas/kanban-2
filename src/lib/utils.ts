import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes safely
 * Combines clsx and tailwind-merge to handle conflicting utilities
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a design token by path
 * Usage: getToken('colors.primary') → '#0d631b'
 */
export function getToken(path: string): string | undefined {
  const tokens = require('@/tokens');
  const keys = path.split('.');
  let value = tokens.default;

  for (const key of keys) {
    value = value?.[key];
  }

  return value;
}

/**
 * Convert spacing token to CSS value
 * Usage: getSpacing('md') → '16px'
 */
export function getSpacing(size: string): string {
  const tokens = require('@/tokens');
  return tokens.spacing[size] || tokens.spacing.md;
}

/**
 * Convert color token to CSS value
 * Usage: getColor('primary') → '#0d631b'
 */
export function getColor(colorName: string): string {
  const tokens = require('@/tokens');
  return tokens.colors[colorName] || '#191c1e';
}
/**
 * Simple debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
