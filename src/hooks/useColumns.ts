import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/lib/supabase/client'

export interface ColumnData {
  id: string
  kanban_id: string
  name: string
  order_position: number
  created_at: string
}

export function useColumns(kanbanId: string | null) {
  const { user, isAuthenticated } = useAuth()
  const [columns, setColumns] = useState<ColumnData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const tenantId = user?.app_metadata?.tenant_id

  const fetchColumns = async () => {
    if (!kanbanId || !tenantId || !isAuthenticated) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanbans/${kanbanId}/columns`)
      const result = await response.json()
      
      if (!result.success) throw new Error(result.error)
      setColumns(result.data || [])
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error)
      console.error('Error fetching columns:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!kanbanId || !tenantId || !isAuthenticated) {
      if (!kanbanId) setIsLoading(false)
      return
    }
    
    fetchColumns()

    // Real-time listener for columns of this kanban
    const channel = supabase
      .channel(`columns_changes_${kanbanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `kanban_id=eq.${kanbanId}`
        },
        () => {
          // Re-fetch on any change for simplicity, or handle local state
          fetchColumns()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [kanbanId, tenantId, isAuthenticated])

  return { columns, isLoading, error, refetch: fetchColumns }
}
