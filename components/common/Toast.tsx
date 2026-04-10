"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];

  addToast: (
    _message: string,
    _type: ToastType,
    _duration?: number
  ) => string;

  removeToast: (_id: string) => void;
  clearAll: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback(
    (_message: string, _type: ToastType, _duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: ToastMessage = { id, type: _type, message: _message, duration: _duration };

      setToasts((prev) => {
        const updated = [...prev, toast];
        // Keep max 3 visible toasts
        return updated.slice(-3);
      });

      // Auto-dismiss
      if (_duration > 0) {
        setTimeout(() => removeToast(id), _duration);
      }

      return id;
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (_id: string) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onRemove: () => void;
}> = ({ toast, onRemove }) => {
  const bgColor = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto",
        "bg-surface/80 backdrop-blur-md rounded-lg",
        "border border-slate-200",
        "shadow-lg",
        "flex items-start gap-3",
        "p-4",
        "min-w-80",
        "animate-in fade-in slide-in-from-right-4 duration-300"
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={cn("text-lg font-bold", bgColor[toast.type])}>
        {icon[toast.type]}
      </div>
      <p className="flex-1 text-sm text-slate-900">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
};

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
