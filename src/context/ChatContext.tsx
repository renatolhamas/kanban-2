'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ChatContextValue {
  activeConversationId: string | null;
  isModalOpen: boolean;
  openChat: (conversationId: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openChat = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsModalOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsModalOpen(false);
    // We don't nullify conversationId immediately to allow transition animations
  }, []);

  const value: ChatContextValue = {
    activeConversationId,
    isModalOpen,
    openChat,
    closeChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
