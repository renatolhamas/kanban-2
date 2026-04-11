'use client';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

/**
 * Header Component
 *
 * Main application header with:
 * - Logo / Page title (left)
 * - Actions: ThemeToggle, Profile, Search (right)
 *
 * Story 2.10 Integration:
 * ThemeToggle positioned on right side for maximum visibility
 */

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo / Page Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Kanban
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle (Story 2.10) */}
          <ThemeToggle />

          {/* TODO: Profile Menu will go here (Future stories) */}
          {/* TODO: Search will go here (Future stories) */}
        </div>
      </div>
    </header>
  );
}

export default Header;
