'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/atoms/button';
import { useChat } from '@/context/ChatContext';

export function MessageInput() {
  const [text, setText] = useState('');
  const { sendMessage, isSending } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const messageText = text.trim();
    if (!messageText || isSending) return;
    
    try {
      await sendMessage(messageText);
      setText(''); // Clear on success
      
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      // Keep text on error per Pre-Flight decision to allow retries
      console.error('Failed to send message in UI:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="p-4 border-t border-outline-variant bg-surface-bright flex items-end gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-text-secondary h-11 w-11 shrink-0"
        disabled // Placeholder for future attachments feature
        title="Anexar arquivo (em breve)"
      >
        <Paperclip size={20} />
      </Button>
      
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-2.5 px-4 pr-10 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px] max-h-[120px] transition-all scrollbar-none"
          rows={1}
          disabled={isSending}
        />
        <button 
          className="absolute right-3 bottom-3 text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
          disabled // Placeholder for future emojis feature
        >
          <Smile size={20} />
        </button>
      </div>

      <Button 
        variant="primary" 
        size="icon" 
        className="rounded-full w-11 h-11 shrink-0"
        onClick={handleSend}
        loading={isSending}
        disabled={!text.trim() || isSending}
        title="Enviar mensagem"
      >
        {!isSending && <Send size={20} />}
      </Button>
    </div>
  );
}
