import { useState, useCallback } from 'react';
import { Message } from '@/context/ChatContext';

export interface PaginationState {
  messages: Message[];
  oldestMessageDate: string | null;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export function useMessagePagination() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadInitialMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch initial messages');
      const data: Message[] = await response.json();
      
      setMessages(data);
      
      // Se recebemos 50 mensagens, assumimos que pode haver mais. Caso contrário, não tem.
      setHasMore(data.length === 50);
      
      // O cursor é a data da mensagem mais antiga (que vem na posição 0, já que estão em ordem cronológica)
      if (data.length > 0) {
        setOldestMessageDate(data[0].created_at);
      } else {
        setOldestMessageDate(null);
      }
    } catch (err) {
      console.error('Error loading initial messages:', err);
    }
  }, []);

  const loadMoreMessages = useCallback(async (conversationId: string) => {
    if (isLoadingMore || !hasMore || !oldestMessageDate) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}&cursor=${encodeURIComponent(oldestMessageDate)}`);
      if (!response.ok) throw new Error('Failed to fetch more messages');
      const data: Message[] = await response.json();

      if (data.length > 0) {
        // Prepend as mensagens antigas (data já vem do oldest ao newest, então concatenamos [novasAntigas, antigasAtuais])
        setMessages(prev => [...data, ...prev]);
        setOldestMessageDate(data[0].created_at);
      }
      
      setHasMore(data.length === 50);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, oldestMessageDate]);

  const resetPagination = useCallback(() => {
    setMessages([]);
    setOldestMessageDate(null);
    setIsLoadingMore(false);
    setHasMore(true);
  }, []);

  return {
    messages,
    setMessages,
    oldestMessageDate,
    isLoadingMore,
    hasMore,
    loadInitialMessages,
    loadMoreMessages,
    resetPagination
  };
}
