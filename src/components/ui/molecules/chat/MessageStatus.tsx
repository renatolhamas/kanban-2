'use client';

import React from 'react';
import { Check, CheckCheck, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessageStatusType = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

interface MessageStatusProps {
  status: MessageStatusType;
  className?: string;
}

/**
 * MessageStatus Component
 * Displays the delivery status of a message using Lucide icons.
 * 
 * - sending: Clock icon (gray)
 * - sent: Single checkmark (gray)
 * - delivered: Double checkmark (gray)
 * - read: Double checkmark (Emerald 500)
 * - error: Warning icon (red)
 */
export const MessageStatus: React.FC<MessageStatusProps> = ({ status, className }) => {
  switch (status) {
    case 'sending':
      return (
        <div className={cn('flex items-center justify-center text-muted-foreground/60', className)} title="Enviando...">
          <Clock className="h-3 w-3 animate-pulse" />
        </div>
      );

    case 'sent':
      return (
        <div className={cn('flex items-center justify-center text-muted-foreground/60', className)} title="Enviado">
          <Check className="h-3.5 w-3.5" />
        </div>
      );

    case 'delivered':
      return (
        <div className={cn('flex items-center justify-center text-muted-foreground/60', className)} title="Entregue">
          <CheckCheck className="h-3.5 w-3.5" />
        </div>
      );

    case 'read':
      return (
        <div className={cn('flex items-center justify-center text-token-success', className)} title="Lido">
          <CheckCheck className="h-3.5 w-3.5" />
        </div>
      );

    case 'error':
      return (
        <div className={cn('flex items-center justify-center text-destructive', className)} title="Erro no envio">
          <AlertCircle className="h-3.5 w-3.5" />
        </div>
      );

    default:
      return null;
  }
};
