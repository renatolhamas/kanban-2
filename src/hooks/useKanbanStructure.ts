import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface KanbanColumn {
  id: string;
  kanban_id: string;
  name: string;
  order_position: number;
}

export interface KanbanStructure {
  id: string;
  name: string;
  order_position: number;
  columns: KanbanColumn[];
}

export function useKanbanStructure() {
  const [kanbans, setKanbans] = useState<KanbanStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStructure = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('kanbans')
        .select(`
          id, 
          name, 
          order_position, 
          columns (
            id, 
            kanban_id, 
            name, 
            order_position
          )
        `)
        .order('order_position', { ascending: true })
        .order('order_position', { foreignTable: 'columns', ascending: true });

      if (fetchError) throw fetchError;

      setKanbans(data as unknown as KanbanStructure[]);
    } catch (err: unknown) {
      console.error('Error fetching kanban structure:', err);
      let errorMessage = 'Falha ao carregar a estrutura do Kanban';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  return {
    kanbans,
    isLoading,
    error,
    refetch: fetchStructure
  };
}
