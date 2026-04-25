'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/context/ChatContext';
import { CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const formatTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col space-y-4 p-4 overflow-y-auto scrollbar-thin h-full bg-surface-container-lowest"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-secondary italic text-sm">
          Nenhuma mensagem nesta conversa ainda.
        </div>
      ) : (
        messages.map((msg) => {
          const isAgent = msg.sender_type === 'agent';
          const isSending = msg.status === 'sending';
          const isError = msg.status === 'error';

          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                isAgent ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl shadow-ambient relative font-manrope transition-opacity duration-300",
                  isAgent 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-surface-bright text-text-primary rounded-tl-none border border-outline-variant",
                  isSending && "opacity-60",
                  isError && "border-error/50 bg-error-container text-on-error-container"
                )}
              >
                <p className="text-body-md font-medium leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span 
                    className={cn(
                      "text-[10px] font-medium",
                      isAgent ? "text-white/80" : "text-text-secondary",
                      isError && "text-error"
                    )}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                  
                  {isAgent && (
                    <span className="text-white/80">
                      {isSending && <Clock size={10} className="animate-pulse" />}
                      {msg.status === 'sent' && <CheckCheck size={10} />}
                      {isError && <AlertCircle size={10} className="text-white" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div className="h-2 w-full shrink-0" />
    </div>
  );
}
