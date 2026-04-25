'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MessageMock } from '@/lib/mocks/chat-mocks';

interface MessageListProps {
  messages: MessageMock[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col space-y-4 p-4 overflow-y-auto scrollbar-thin h-full bg-surface-container-lowest"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex w-full",
            msg.sender === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] p-3 rounded-2xl shadow-sm relative font-manrope",
              msg.sender === 'user' 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-surface-bright text-text-primary rounded-tl-none border border-outline-variant"
            )}
          >
            <p className="text-body-md font-medium leading-relaxed">
              {msg.text}
            </p>
            <span 
              className={cn(
                "text-[10px] mt-1 block text-right font-medium",
                msg.sender === 'user' ? "text-white/80" : "text-text-secondary"
              )}
            >
              {msg.time}
            </span>
          </div>
        </div>
      ))}
      <div className="h-2 w-full shrink-0" /> {/* Minimal spacer for visual balance */}
    </div>
  );
}
