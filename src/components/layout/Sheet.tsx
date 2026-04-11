'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Sheet Component (Mobile Drawer)
 *
 * Customizable sheet/drawer component for mobile navigation
 * - Slides in from left/right
 * - Click outside to close
 * - Keyboard: Escape to close
 * - ARIA labels for accessibility
 * - Dark mode support
 *
 * Story 2.11: Application Layout & Navigation
 */

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  title?: string;
}

export function Sheet({
  isOpen,
  onClose,
  children,
  side = 'left',
  title,
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sheetRef.current &&
        !sheetRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed top-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ${
          side === 'left'
            ? `left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </>
  );
}

export default Sheet;
