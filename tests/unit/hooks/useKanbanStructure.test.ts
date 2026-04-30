/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKanbanStructure } from '@/hooks/useKanbanStructure';
import { createClient } from '@/lib/supabase/client';

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              id: 'kanban-1',
              name: 'Main Board',
              order_position: 1,
              columns: [
                { id: 'col-1', name: 'To Do', order_position: 1 },
                { id: 'col-2', name: 'In Progress', order_position: 2 }
              ]
            },
            {
              id: 'kanban-2',
              name: 'Secondary Board',
              order_position: 2,
              columns: [
                { id: 'col-3', name: 'Backlog', order_position: 1 }
              ]
            }
          ],
          error: null
        }))
      }))
    }))
  }))
}));

// Mock do Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('useKanbanStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar a estrutura do Kanban corretamente', async () => {
    const { result } = renderHook(() => useKanbanStructure());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.kanbans).toHaveLength(2);
    expect(result.current.kanbans[0].name).toBe('Main Board');
    expect(result.current.kanbans[0].columns).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('deve lidar com erros de carregamento', async () => {
    // Mock de erro
    (mockSupabase.from as any).mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Erro na conexão' }
          }))
        }))
      }))
    }));

    const { result } = renderHook(() => useKanbanStructure());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.kanbans).toEqual([]);
    expect(result.current.error).toBe('Erro na conexão');
  });

  it('deve permitir refetch manual', async () => {
    const { result } = renderHook(() => useKanbanStructure());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.refetch();

    expect(mockSupabase.from).toHaveBeenCalledTimes(2);
  });
});
