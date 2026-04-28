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
    const channel = supabase.channel(`messages:${conversationId}`);

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
              // Avoid duplicates (e.g. optimistic sends)
              const exists = prev.some(m => m.id === newMsg.id || (m.evolution_message_id && m.evolution_message_id === newMsg.evolution_message_id));
              if (exists) return prev;

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
