'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/resend-confirmation', '/change-password'];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const pageTitle = PAGE_TITLES[pathname] || 'Kanban App';

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-surface-container-low bg-surface-bright dark:bg-surface-container-highest shadow-ambient"
      role="banner"
      aria-label="Application header"
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-text-inverse font-bold text-lg">
            K
          </div>
          <h1 className="hidden sm:block text-lg font-semibold text-text-primary">
            Kanban
          </h1>
        </div>

        {/* Center: Page Title */}
        <div className="flex-1 text-center">
          <h2 className="text-sm sm:text-base font-medium text-text-primary">
            {pageTitle}
          </h2>
        </div>

        {/* Right: Actions (Theme Toggle + User Menu) */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu - Visible only if authenticated + not loading + not auth page */}
          {!isAuthPage && !isLoading && isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
}

export default Header;
