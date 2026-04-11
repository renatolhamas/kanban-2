'use client';

import { useEffect, useState } from 'react';

/**
 * ThemeToggle Component (Story 2.10 - Visual Validation)
 *
 * Toggles between light and dark mode with:
 * - localStorage persistence (theme-preference)
 * - System preference fallback (prefers-color-scheme)
 * - Keyboard accessibility (Tab, Enter/Space)
 * - ARIA labels in Portuguese
 *
 * Usage:
 * <ThemeToggle /> — Place in Header or UserMenu
 *
 * Implementation:
 * - Sets [data-theme="dark"] on <html> element
 * - Sets .dark class on <html> for Tailwind dark mode
 */

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  /**
   * Initialize theme on mount:
   * 1. Check localStorage for saved preference
   * 2. Fall back to system preference (prefers-color-scheme)
   * 3. Default to light mode
   */
  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme-preference') as 'light' | 'dark' | null;

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      applyTheme(systemTheme);
      // Don't save system preference, only user selection
    }

    setMounted(true);
  }, []);

  /**
   * Apply theme to HTML element
   * - Sets [data-theme="dark"] for CSS variables
   * - Sets .dark class for Tailwind dark mode
   */
  function applyTheme(newTheme: 'light' | 'dark') {
    const htmlElement = document.documentElement;

    if (newTheme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark');
    } else {
      htmlElement.removeAttribute('data-theme');
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Toggle theme and persist to localStorage
   */
  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
  }

  /**
   * Keyboard handler: Space or Enter to toggle
   */
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      toggleTheme();
    }
  }

  // Avoid hydration mismatch by rendering after mount
  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={`
        inline-flex items-center justify-center
        w-10 h-10
        rounded-md
        transition-colors duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-token-primary
        dark:focus:ring-offset-gray-900
        ${className}
      `}
    >
      {isDark ? (
        // Sun icon (light mode) — show when in dark mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-400"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Moon icon (dark mode) — show when in light mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-700"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
