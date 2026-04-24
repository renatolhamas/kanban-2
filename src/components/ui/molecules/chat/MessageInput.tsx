'use client';

import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/atoms/button';

export function MessageInput() {
  return (
    <div className="p-4 border-t border-outline-variant bg-surface-bright flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-text-secondary disabled:opacity-50"
        disabled // Static stub for Phase 3
      >
        <Paperclip size={20} />
      </Button>
      
      <div className="flex-1 relative">
        <textarea
          placeholder="Escreva uma mensagem..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-2 px-4 pr-10 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px] max-h-[120px]"
          rows={1}
        />
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
          disabled // Static stub for Phase 3
        >
          <Smile size={20} />
        </button>
      </div>

      <Button 
        variant="primary" 
        size="icon" 
        className="rounded-full w-11 h-11 shrink-0"
      >
        <Send size={20} />
      </Button>
    </div>
  );
}
