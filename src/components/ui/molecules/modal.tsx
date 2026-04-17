'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
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
      className="backdrop:bg-black/50 rounded-lg bg-surface-bright dark:bg-surface-container-highest border border-surface-container-low shadow-ambient w-full"
    >
      <div className={`${sizeClasses[size]}`}>
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

        <div className="p-6">{children}</div>

        {footer && <div className="border-t border-surface-container-low p-6">{footer}</div>}
      </div>
    </dialog>
  );
}

export default Modal;
