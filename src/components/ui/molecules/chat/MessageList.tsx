'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/src/context/ChatContext';
import { MessageStatus } from './MessageStatus';

interface MessageListProps {
  messages: Message[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export function MessageList({ messages, onLoadMore, isLoadingMore = false, hasMore = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const lastScrollHeight = useRef<number>(0);
  const isFirstLoad = useRef<boolean>(true);

  // Infinite Scroll Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px 0px 0px 0px' } // dispara um pouco antes de chegar no topo
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Scroll position preservation & auto-scroll to bottom
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const currentScrollHeight = container.scrollHeight;

    if (isFirstLoad.current && messages.length > 0) {
      // First load: scroll to bottom immediately
      container.scrollTop = currentScrollHeight;
      isFirstLoad.current = false;
    } else if (currentScrollHeight > lastScrollHeight.current) {
      // Height increased
      const heightDiff = currentScrollHeight - lastScrollHeight.current;
      
      // Se estávamos no topo (carregando antigos)
      if (container.scrollTop <= heightDiff + 50) { // Tolerância para scroll rápido
        container.scrollTop = container.scrollTop + heightDiff;
      } 
      // Se estávamos perto da base (nova mensagem recebida)
      else if (container.scrollHeight - container.scrollTop - container.clientHeight - heightDiff < 150) {
        container.scrollTo({ top: currentScrollHeight, behavior: 'smooth' });
      }
    }

    lastScrollHeight.current = currentScrollHeight;
  }, [messages]);

  const formatTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch (_e) {
      return '--:--';
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col space-y-4 p-4 overflow-y-auto scrollbar-thin h-full bg-surface-container-lowest"
    >
      {/* Gatilho do Infinite Scroll */}
      <div ref={observerTarget} className="h-4 w-full shrink-0" />
      
      {/* Loader visual ao buscar histórico */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-2 shrink-0">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {messages.length === 0 && !isLoadingMore ? (
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
                  
                  {isAgent && msg.status && (
                    <MessageStatus 
                      status={msg.status} 
                      className={cn(isAgent ? "text-white/80" : "")} 
                    />
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
