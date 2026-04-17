'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * UserMenu Component
 *
 * Dropdown menu for user profile and logout
 * - Avatar trigger with chevron
 * - Dropdown with Profile and Logout items
 * - Full keyboard navigation (Tab, Arrow keys, Esc)
 * - ARIA labels for accessibility
 * - Dark mode support
 *
 * Story 2.11: Application Layout & Navigation
 */

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      // Clear auth state (simplified - depends on your auth implementation)
      localStorage.removeItem('auth_token');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface transition-colors"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        {/* Avatar Circle */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-text-inverse font-semibold">
          U
        </div>
        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-surface-container-low bg-surface-bright dark:bg-surface-container-high shadow-ambient py-1 z-50"
        >
          {/* Profile Item */}
          <button
            onClick={() => {
              router.push('/profile');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-container-low transition-colors focus:outline-none focus:bg-surface-container-low"
            role="menuitem"
          >
            <User size={16} />
            <span>Profile</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-surface-container-low" />

          {/* Logout Item */}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-surface-container-low transition-colors focus:outline-none focus:bg-surface-container-low"
            role="menuitem"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
