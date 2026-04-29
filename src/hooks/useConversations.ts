import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils'
import { useRealtimeStatus } from './useRealtimeStatus'

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
  
  const { status: realtimeStatus, updateStatus } = useRealtimeStatus()

  const supabase = createClient()
  const tenantId = user?.app_metadata?.tenant_id

  const fetchData = useCallback(async (background = false) => {
    if (!kanbanId || !tenantId || !isAuthenticated) return

    try {
      if (!background) setIsLoading(true)

      // 1. Fetch Columns via Supabase SDK
      const { data: colsData, error: colsError } = await supabase
        .from('columns')
        .select('id, name, order_position')
        .eq('kanban_id', kanbanId)
        .order('order_position', { ascending: true })

      if (colsError) throw colsError
      setColumns(colsData || [])

      // 2. Fetch Conversations via internal API (Optimized SQL Subquery)
      const response = await fetch(`/api/conversations?kanbanId=${kanbanId}&_t=${Date.now()}`)
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
      if (!background) setIsLoading(false)
    }
  }, [kanbanId, tenantId, isAuthenticated, supabase])

  // Debounced fetch to avoid multiple rapid reloads during busy periods
  // We pass 'true' to fetchData so it updates in the background without triggering the loading spinner
  const debouncedFetch = useMemo(
    () => debounce(() => fetchData(true), 500),
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
    // We listen to multiple tables to trigger a debounced refetch when any board data changes
    const channel = supabase
      .channel(`conversations-board-${kanbanId}-${Math.random().toString(36).slice(2, 7)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[useConversations] Received message INSERT', payload)
          debouncedFetch()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          console.log('[useConversations] Received conversation UPDATE', payload)
          debouncedFetch()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'kanbans' },
        (payload) => {
          console.log('[useConversations] Received kanban UPDATE', payload)
          debouncedFetch()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'columns' },
        (payload) => {
          console.log('[useConversations] Received column UPDATE', payload)
          debouncedFetch()
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          updateStatus('connected')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.error(`[useConversations] Realtime channel ${status}:`, err || 'No error details provided')
          updateStatus('offline')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [kanbanId, tenantId, isAuthenticated, fetchData, debouncedFetch, supabase, updateStatus])

  return { conversations, columns, isLoading, error, refetch: fetchData, realtimeStatus }
}
