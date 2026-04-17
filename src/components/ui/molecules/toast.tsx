'use client';

import { createContext, useContext, ReactNode } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toasts: Toast[] = [];

  const addToast = (message: string, type: Toast['type']) => {
    console.log(`[${type.toUpperCase()}]`, message);
  };

  const removeToast = (id: string) => {
    // Placeholder
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return {
    addToast: context.addToast,
    success: (message: string) => context.addToast(message, 'success'),
    error: (message: string) => context.addToast(message, 'error'),
    info: (message: string) => context.addToast(message, 'info'),
    warning: (message: string) => context.addToast(message, 'warning'),
  };
}

export function Toast() {
  return null; // Placeholder
}
