import { useState } from 'react';
import { useToast } from '@/components/ui/molecules/toast';

export function useColumnActions(kanbanId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const createColumn = async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, kanban_id: kanbanId }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      addToast('Coluna criada com sucesso! ✅', 'success');
      return result.data;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao criar coluna', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateColumn = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/columns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      addToast('Coluna atualizada! ✅', 'success');
      return result.data;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao atualizar coluna', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteColumn = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/columns/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      const message = result.conversations_moved > 0 
        ? `Coluna deletada. ${result.conversations_moved} conversas movidas. ✅`
        : 'Coluna deletada com sucesso! ✅';
        
      addToast(message, 'success');
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao deletar coluna', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reorderColumn = async (columnId: string, direction: 'up' | 'down') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/columns/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId, direction }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return true;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao reordenar', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn,
    isLoading
  };
}
