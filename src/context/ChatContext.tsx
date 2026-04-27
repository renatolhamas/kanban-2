'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { apiSendMessage } from '@/lib/api/messages';
import { useToast } from '@/components/ui/molecules/toast';
import { useMessagePagination } from '@/hooks/useMessagePagination';

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
    resetPagination
  } = useMessagePagination();

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

  // Story 6.3: Real-time updates subscription (INSERT & UPDATE)
  useEffect(() => {
    if (!activeConversationId) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`chat_realtime_${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, etc.
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            console.log('[ChatContext] Real-time message received:', newMsg.id);
            
            setMessages(prev => {
              // Avoid duplicates (e.g. if we just sent it optimistically)
              const exists = prev.some(m => m.id === newMsg.id || (m.evolution_message_id && m.evolution_message_id === newMsg.evolution_message_id));
              if (exists) return prev;

              const updatedList = [...prev, newMsg];
              // Sort to ensure correct order regardless of network latency
              return updatedList.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message;
            console.log('[ChatContext] Real-time status update received:', updatedMsg.id, updatedMsg.status);
            
            setMessages(prev => {
              const updatedList = prev.map(msg => 
                msg.id === updatedMsg.id 
                  ? { ...msg, status: updatedMsg.status, status_updated_at: updatedMsg.status_updated_at } 
                  : msg
              );
              // Re-sort just in case (though update usually doesn't change order)
              return updatedList.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);


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

    const optimisticId = `opt-${Math.random().toString(36).substring(7)}`;
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
    isModalOpen,
    messages,
    isSending,
    openChat,
    closeChat,
    sendMessage,
    loadMessages: loadInitialMessages,
    isLoadingMore,
    hasMore,
    loadMoreMessages
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
