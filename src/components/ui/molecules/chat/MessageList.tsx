'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { MessageMock } from '@/lib/mocks/chat-mocks';

interface MessageListProps {
  messages: MessageMock[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-[500px] bg-surface-container-lowest">
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
    </div>
  );
}
