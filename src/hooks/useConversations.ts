import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils'

export interface Conversation {
  id: string
  wa_phone: string
  status: string
  last_message_at: string
  contact_name: string | null
  order_position: number
  column_id: string
  last_message_content: string | null
  last_sender_type: string | null
  last_media_url: string | null
  last_media_type: string | null
  unread_count: number
}

export interface KanbanColumnData {
  id: string
  name: string
  order_position: number
}

export function useConversations(kanbanId: string) {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [columns, setColumns] = useState<KanbanColumnData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const tenantId = user?.app_metadata?.tenant_id

  const fetchData = useCallback(async () => {
    if (!kanbanId || !tenantId || !isAuthenticated) return

    try {
      setIsLoading(true)

      // 1. Fetch Columns via Supabase SDK
      const { data: colsData, error: colsError } = await supabase
        .from('columns')
        .select('id, name, order_position')
        .eq('kanban_id', kanbanId)
        .order('order_position', { ascending: true })

      if (colsError) throw colsError
      setColumns(colsData || [])

      // 2. Fetch Conversations via internal API (Optimized SQL Subquery)
      const response = await fetch(`/api/conversations?kanbanId=${kanbanId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch conversations')
      }
      const convData = await response.json()

      // Transform data (already optimized by the API)
      const transformed: Conversation[] = (convData || []).map((c: any) => ({
        id: c.id,
        wa_phone: c.wa_phone,
        status: c.status,
        last_message_at: c.last_message_at,
        column_id: c.column_id,
        contact_name: c.contact_name || null,
        order_position: 0,
        last_message_content: c.last_message_content || null,
        last_sender_type: c.last_sender_type || null,
        last_media_url: c.last_media_url || null,
        last_media_type: c.last_media_type || null,
        unread_count: c.unread_count || 0
      }))

      setConversations(transformed)
    } catch (err: any) {
      setError(err)
      console.error('Error fetching conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [kanbanId, tenantId, isAuthenticated, supabase])

  // Debounced fetch to avoid multiple rapid reloads during busy periods
  const debouncedFetch = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  )

  useEffect(() => {
    if (!kanbanId || !tenantId || !isAuthenticated) {
      setIsLoading(true)
      if (!isAuthenticated) setIsLoading(false)
      return
    }

    fetchData()

    // 3. Realtime Subscriptions
    // We only need to listen to 'conversations' because the webhook 
    // updates 'last_message_at' on every new message.
    const channel = supabase
      .channel(`kanban-realtime-${kanbanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `kanban_id=eq.${kanbanId}`
        },
        () => debouncedFetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [kanbanId, tenantId, isAuthenticated, fetchData, debouncedFetch, supabase])

  return { conversations, columns, isLoading, error, refetch: fetchData }
}
