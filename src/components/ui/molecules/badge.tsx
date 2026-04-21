import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'positive' | 'neutral' | 'group' | 'status-active' | 'status-archived' | 'status-closed';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-surface-container-low text-text-primary',
    success: 'bg-success-container text-on-success-container',
    positive: 'bg-success-container text-on-success-container',
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-warning-container text-on-warning-container',
    info: 'bg-info-container text-on-info-container',
    neutral: 'bg-surface-container-low text-text-primary',
    // Story 5.1: Group indicator badge
    group: 'bg-surface-container text-text-primary border border-outline-variant',
    // Story 5.2: Conversation status badges
    'status-active': 'bg-surface-container-low text-text-primary',
    'status-archived': 'bg-surface-container-high text-text-secondary',
    'status-closed': 'bg-warning-container text-text-primary',
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
