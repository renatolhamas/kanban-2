import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'positive' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-surface-container-low text-text-primary',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    positive: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    neutral: 'bg-surface-container-low text-text-primary',
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Badge;
