import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Conversation } from './useConversations';

export interface EnrichedConversation extends Conversation {
  column: {
    id: string;
    name: string;
    kanban: {
      id: string;
      name: string;
    };
  };
}

export function useConversationDetails(conversationId: string | null) {
  const [conversation, setConversation] = useState<EnrichedConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const fetchConversation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('conversations')
          .select(`
            *,
            column:columns (
              id,
              name,
              kanban:kanbans (
                id,
                name
              )
            )
          `)
          .eq('id', conversationId)
          .single();

        if (fetchError) throw fetchError;
        setConversation(data as unknown as EnrichedConversation);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('[useConversationDetails] Error fetching conversation:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();

    // Subscribe to real-time updates for this conversation
    const channel = supabase
      .channel(`conv-details-${conversationId}-${Math.random().toString(36).slice(2, 7)}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          console.log('[useConversationDetails] Real-time UPDATE received:', payload.new);
          const newConv = payload.new as Conversation;
          
          setConversation(prev => {
            if (!prev) return newConv as unknown as EnrichedConversation;
            
            // If column_id changed, we should ideally refetch to get new column/kanban names.
            // For now, we merge and keep the old column object structure to avoid type errors,
            // but we might want a refetch here for full accuracy.
            if (newConv.column_id !== prev.column_id) {
              fetchConversation(); // Trigger a refetch
              return prev; // Keep old data until refetch completes
            }

            return { ...prev, ...newConv };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { conversation, setConversation, isLoading, error };
}
