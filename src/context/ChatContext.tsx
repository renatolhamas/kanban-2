'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { apiSendMessage } from '@/lib/api/messages';
import { useToast } from '@/components/ui/molecules/toast';
import { useMessages } from '@/hooks/useMessages';
import { useConversationDetails, EnrichedConversation } from '@/hooks/useConversationDetails';
import { Conversation } from '@/hooks/useConversations';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_type: 'customer' | 'agent' | 'system';
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  evolution_message_id?: string | null;
  status_updated_at?: string;
}

interface ChatContextValue {
  activeConversationId: string | null;
  activeConversation: EnrichedConversation | null;
  isModalOpen: boolean;
  messages: Message[];
  isSending: boolean;
  openChat: (conversationId: string) => void;
  closeChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  realtimeStatus: 'connected' | 'reconnecting' | 'offline';
  isRealtimeActive: boolean;
  isLoadingConversation: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    messages,
    setMessages,
    isLoadingMore,
    hasMore,
    loadInitialMessages,
    loadMoreMessages,
    resetPagination,
    realtimeStatus,
    isRealtimeActive
  } = useMessages(activeConversationId);

  const {
    conversation: activeConversation,
    isLoading: isLoadingConversation
  } = useConversationDetails(activeConversationId);

  const [sendingCount, setSendingCount] = useState(0);
  const isSending = sendingCount > 0;
  const { error: showToastError, success: showToastSuccess } = useToast();

  const [sendQueue, setSendQueue] = useState<{ id: string; text: string; conversationId: string }[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Story 6.3: Sequential Message Processor (FIFO Queue)
  useEffect(() => {
    const processNext = async () => {
      if (isProcessingQueue || sendQueue.length === 0) return;

      setIsProcessingQueue(true);
      const nextItem = sendQueue[0];

      try {
        const response = await apiSendMessage({
          conversationId: nextItem.conversationId,
          text: nextItem.text
        });
        
        // Update the optimistic message with real data from backend
        setMessages(prev => prev.map(msg => 
          msg.id === nextItem.id 
            ? { ...msg, id: response.messageId, status: 'sent', evolution_message_id: response.evolutionMessageId } 
            : msg
        ));
        
        showToastSuccess('Mensagem enviada!');
      } catch (err: unknown) {
        console.error('Error sending message from queue:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem.';
        
        // Update the optimistic message to 'error'
        setMessages(prev => prev.map(msg => 
          msg.id === nextItem.id ? { ...msg, status: 'error' } : msg
        ));
        
        showToastError(errorMessage);
      } finally {
        // Remove processed item and allow next one
        setSendQueue(prev => prev.slice(1));
        setSendingCount(prev => Math.max(0, prev - 1));
        setIsProcessingQueue(false);
      }
    };

    processNext();
  }, [sendQueue, isProcessingQueue, showToastError, showToastSuccess]);

  // Realtime updates (INSERT & UPDATE) are now handled internally by useMessages hook.


  const openChat = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsModalOpen(true);
    loadInitialMessages(conversationId);
  }, [loadInitialMessages]);

  const closeChat = useCallback(() => {
    setIsModalOpen(false);
    setActiveConversationId(null);
    resetPagination();
    setSendQueue([]); // Clear queue on close
  }, [resetPagination]);

  const sendMessage = async (text: string) => {
    if (!activeConversationId || !text.trim()) return;

    const optimisticId = crypto.randomUUID();
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: activeConversationId,
      content: text,
      sender_type: 'agent',
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    // 1. Update UI optimistically
    setMessages(prev => [...prev, optimisticMessage]);
    setSendingCount(prev => prev + 1);

    // 2. Add to sequential queue instead of direct API call
    setSendQueue(prev => [...prev, { 
      id: optimisticId, 
      text: text, 
      conversationId: activeConversationId 
    }]);
  };

  const value: ChatContextValue = {
    activeConversationId,
    activeConversation,
    isModalOpen,
    messages,
    isSending,
    openChat,
    closeChat,
    sendMessage,
    loadMessages: loadInitialMessages,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
    realtimeStatus,
    isRealtimeActive,
    isLoadingConversation
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
