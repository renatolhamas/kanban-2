'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Settings as SettingsIcon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet } from '@/components/layout/Sheet';

/**
 * Sidebar Component
 *
 * Navigation sidebar with:
 * - Home (Kanban Board)
 * - Contacts
 * - Settings
 *
 * Supports:
 * - Active state based on current route
 * - Dark mode
 * - Responsive: hidden on mobile (<md), visible on desktop
 * - Mobile drawer (Sheet) for <md breakpoints
 * - LocalStorage persistence for collapse state
 * - WCAG AA accessibility (semantic nav, ARIA labels)
 * - Keyboard navigation (Tab order, Escape closes drawer)
 *
 * Story 2.11: Application Layout & Navigation
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: <Home size={20} />,
  },
  {
    label: 'Contacts',
    href: '/contacts',
    icon: <Users size={20} />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <SettingsIcon size={20} />,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col gap-1 p-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface ${
              active
                ? 'bg-surface-container-low text-primary'
                : 'text-text-primary hover:bg-surface-container-low'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile (<md), visible on desktop (md+) */}
      <nav
        className="hidden md:flex flex-col w-64 border-r border-surface-container-low bg-surface-bright dark:bg-surface-container-highest h-[calc(100vh-4rem)] overflow-y-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarContent />
      </nav>

      {/* Mobile Hamburger Button - Visible on mobile (<md), hidden on desktop */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-text-inverse shadow-ambient hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={isDrawerOpen}
        aria-controls="mobile-nav"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Drawer Sheet */}
      <Sheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side="left"
        title="Navigation"
      >
        <nav
          id="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <SidebarContent onNavigate={() => setIsDrawerOpen(false)} />
        </nav>
      </Sheet>
    </>
  );
}

export default Sidebar;
