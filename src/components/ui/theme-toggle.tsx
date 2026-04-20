'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle Component (Atom)
 *
 * Toggles between light and dark mode
 * - Persists preference to localStorage
 * - Updates document data-theme attribute
 * - Smooth transitions
 * - WCAG AA accessibility (ARIA labels, focus states)
 * - Icon-only button with tooltip on hover
 *
 * Story 2.10: Dark Mode Support
 */

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);

    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);
    setIsMounted(true);
  }, []);

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const handleToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    updateTheme(newIsDark);
  };

  // Prevent flash of unstyled content during hydration
  if (!isMounted) {
    return (
      <button
        className="h-10 w-10 rounded-lg bg-surface-container-low text-text-primary"
        disabled
        aria-label="Loading theme toggle"
      />
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-text-primary hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      data-testid="theme-toggle"
    >
      {isDark ? (
        <Sun size={20} className="transition-transform duration-200" />
      ) : (
        <Moon size={20} className="transition-transform duration-200" />
      )}
    </button>
  );
}

export default ThemeToggle;
