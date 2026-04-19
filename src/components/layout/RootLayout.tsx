'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AUTH_PAGES } from '@/lib/auth-pages';

/**
 * RootLayout Component
 *
 * Main layout wrapper for protected pages with:
 * - Sticky Header (Logo, Page Title, Theme Toggle, User Menu)
 * - Sidebar Navigation (Desktop visible, Mobile drawer)
 * - Main content area (flex-1)
 *
 * Supports:
 * - Conditional sidebar (hidden on auth pages)
 * - Dark mode
 * - Responsive design
 * - WCAG AA accessibility
 *
 * Layout structure:
 * ```
 * <RootLayout>
 *   <Header />
 *   <div className="flex">
 *     <Sidebar />
 *     <main className="flex-1">{children}</main>
 *   </div>
 * </RootLayout>
 * ```
 *
 * Story 2.11: Application Layout & Navigation
 */

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  return (
    <div className="flex h-screen flex-col bg-surface text-on-surface">
      {/* Header - Always visible */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Visible only if: authenticated + not auth page + loaded */}
        {!isAuthPage && !isLoading && isAuthenticated && <Sidebar />}

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto ${
            isAuthPage ? 'w-full' : 'w-full md:flex-1'
          }`}
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default RootLayout;
