'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { apiSendMessage } from '@/lib/api/messages';
import { useToast } from '@/components/ui/molecules/toast';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_type: 'customer' | 'agent' | 'system';
  created_at: string;
  status?: 'sending' | 'sent' | 'error';
  evolution_message_id?: string | null;
}

interface ChatContextValue {
  activeConversationId: string | null;
  isModalOpen: boolean;
  messages: Message[];
  isSending: boolean;
  openChat: (conversationId: string) => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { error: showToastError, success: showToastSuccess } = useToast();

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, []);

  const openChat = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsModalOpen(true);
    loadMessages(conversationId);
  }, [loadMessages]);

  const closeChat = useCallback(() => {
    setIsModalOpen(false);
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!activeConversationId || !text.trim() || isSending) return;

    const optimisticId = `opt-${Math.random().toString(36).substring(7)}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: activeConversationId,
      content: text,
      sender_type: 'agent',
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setIsSending(true);

    try {
      const response = await apiSendMessage({
        conversationId: activeConversationId,
        text
      });
      
      // Update the optimistic message with real data from backend
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticId 
          ? { ...msg, id: response.messageId, status: 'sent', evolution_message_id: response.evolutionMessageId } 
          : msg
      ));
      
      showToastSuccess('Mensagem enviada!');
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem. Tente novamente.';
      
      // Update the optimistic message to 'error'
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticId ? { ...msg, status: 'error' } : msg
      ));
      
      showToastError(errorMessage);
      throw err; // Allow component to handle error
    } finally {
      setIsSending(false);
    }
  };

  const value: ChatContextValue = {
    activeConversationId,
    isModalOpen,
    messages,
    isSending,
    openChat,
    closeChat,
    sendMessage,
    loadMessages
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
