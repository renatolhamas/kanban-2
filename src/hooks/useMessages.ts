import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/context/ChatContext';
import { useMessagePagination } from './useMessagePagination';
import { useDebounce } from './useDebounce';
import { useRealtimeStatus } from './useRealtimeStatus';

export function useMessages(conversationId: string | null) {
  const pagination = useMessagePagination();
  const { messages, setMessages, loadInitialMessages, resetPagination } = pagination;
  
  const { status: realtimeStatus, updateStatus } = useRealtimeStatus();
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Debounce the UI updates for messages to prevent jank on high-frequency bursts
  const debouncedMessages = useDebounce(messages, 200);

  // Load initial messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadInitialMessages(conversationId);
    } else {
      resetPagination();
    }
  }, [conversationId, loadInitialMessages, resetPagination]);

  // Subscribe to Realtime
  useEffect(() => {
    if (!conversationId) {
      setIsRealtimeActive(false);
      return;
    }

    const supabase = createClient();
    
    // Dedicated segregated channel for messages
    const channel = supabase.channel(`messages-chat-${conversationId}-${Math.random().toString(36).slice(2, 7)}`);

    channel
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            console.log('[useMessages] Real-time message INSERT received:', newMsg.id);
            
            setMessages(prev => {
              // 1. Avoid exact duplicates (by ID)
              const exists = prev.some(m => m.id === newMsg.id);
              if (exists) return prev;

              // 2. Correlation: Check if this is an update to an optimistic message
              // We look for a 'sending' agent message with the same content sent recently
              let optimisticIndex = -1;
              for (let i = prev.length - 1; i >= 0; i--) {
                if (
                  prev[i].sender_type === 'agent' && 
                  prev[i].status === 'sending' && 
                  prev[i].content === newMsg.content
                ) {
                  optimisticIndex = i;
                  break;
                }
              }

              if (optimisticIndex !== -1) {
                const updatedList = [...prev];
                updatedList[optimisticIndex] = newMsg;
                return updatedList;
              }

              const updatedList = [...prev, newMsg];
              return updatedList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as Message;
            console.log('[useMessages] Real-time message UPDATE received:', updatedMsg.id, updatedMsg.status);
            
            setMessages(prev => {
              return prev.map(msg => 
                msg.id === updatedMsg.id 
                  ? { ...msg, status: updatedMsg.status, status_updated_at: updatedMsg.status_updated_at } 
                  : msg
              );
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true);
          updateStatus('connected');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.error('[useMessages] Realtime channel error:', err);
          setIsRealtimeActive(false);
          updateStatus('offline');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsRealtimeActive(false);
    };
  }, [conversationId, setMessages, updateStatus]);

  return {
    ...pagination,
    messages: debouncedMessages, // Override returned messages with debounced list
    realtimeStatus,
    isRealtimeActive
  };
}
