'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fullScreenMobile?: boolean;
  noPadding?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full',
};

export function Modal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  children,
  footer,
  size = 'md',
  fullScreenMobile = false,
  noPadding = false,
}: ModalProps) {
  const isModalOpen = open !== undefined ? open : (isOpen ?? false);
  const handleClose = () => {
    onOpenChange?.(false);
    onClose?.();
  };
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isModalOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn(
        "backdrop:bg-black/50 rounded-lg bg-surface-bright dark:bg-surface-container-highest border border-surface-container-low shadow-ambient w-full",
        fullScreenMobile && "max-sm:fixed max-sm:inset-0 max-sm:rounded-none max-sm:h-screen max-sm:w-screen max-sm:max-w-none"
      )}
    >
      <div className={cn(sizeClasses[size], "mx-auto h-full flex flex-col")}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-surface-container-low">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-surface-container-low rounded transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} className="text-text-primary" />
            </button>
          </div>
        )}

        <div className={cn(noPadding ? "p-0" : "p-6", "flex-1")}>{children}</div>

        {footer && <div className="border-t border-surface-container-low p-6">{footer}</div>}
      </div>
    </dialog>
  );
}

export default Modal;
