'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';

/**
 * Header Component (Refactored for Story 2.11)
 *
 * Application header with:
 * - Logo (left)
 * - Dynamic Page Title (center, based on current route)
 * - Theme Toggle + User Menu (right)
 *
 * Supports:
 * - Dark mode (via ThemeToggle)
 * - Responsive layout
 * - WCAG AA accessibility
 * - Semantic HTML
 *
 * Story 2.10 Integration: ThemeToggle from dark mode story
 * Story 2.11: Application Layout & Navigation
 */

interface PageTitleMap {
  [key: string]: string;
}

const PAGE_TITLES: PageTitleMap = {
  '/': 'Kanban Board',
  '/contacts': 'Contacts',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/login': 'Sign In',
  '/register': 'Sign Up',
};

export function Header() {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || 'Kanban App';

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
      role="banner"
      aria-label="Application header"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-lg">
            K
          </div>
          <h1 className="hidden sm:block text-lg font-semibold text-gray-900 dark:text-white">
            Kanban
          </h1>
        </div>

        {/* Center: Page Title */}
        <div className="flex-1 text-center">
          <h2 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            {pageTitle}
          </h2>
        </div>

        {/* Right: Actions (Theme Toggle + User Menu) */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle (Story 2.10) */}
          <ThemeToggle />

          {/* User Menu (Story 2.11) */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
