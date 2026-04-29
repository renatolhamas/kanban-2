'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], action?: Toast['action']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'], action?: Toast['action']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, action }]);
    
    // Auto-remove after 3 seconds (unless it has an action, maybe keep longer?)
    const duration = action ? 6000 : 3000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastList />
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
    success: (message: string, action?: Toast['action']) => context.addToast(message, 'success', action),
    error: (message: string, action?: Toast['action']) => context.addToast(message, 'error', action),
    info: (message: string, action?: Toast['action']) => context.addToast(message, 'info', action),
    warning: (message: string, action?: Toast['action']) => context.addToast(message, 'warning', action),
  };
}

function ToastList() {
  const context = useContext(ToastContext);
  if (!context) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {context.toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={() => context.removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ message, type, action, onRemove }: Toast & { onRemove: () => void }) {
  const bgColors = {
    success: 'bg-token-success',
    error: 'bg-token-danger',
    info: 'bg-token-primary',
    warning: 'bg-token-warning',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-ambient text-white min-w-[280px] animate-in fade-in slide-in-from-right-5 ${bgColors[type]}`}>
      <span className="flex-1 font-medium">{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onRemove();
          }}
          className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors"
        >
          {action.label}
        </button>
      )}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
}
