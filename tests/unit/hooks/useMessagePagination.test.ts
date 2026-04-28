/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMessagePagination } from '@/src/hooks/useMessagePagination';

// Mock do global fetch
global.fetch = vi.fn();

describe('useMessagePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMessages = Array.from({ length: 50 }, (_, i) => ({
    id: `msg-${i}`,
    conversation_id: 'conv-1',
    content: `Message ${i}`,
    sender_type: 'agent' as const,
    created_at: new Date(1000000000000 + i * 1000).toISOString()
  }));

  it('deve inicializar com estado vazio', () => {
    const { result } = renderHook(() => useMessagePagination());

    expect(result.current.messages).toEqual([]);
    expect(result.current.oldestMessageDate).toBeNull();
    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });

  it('loadInitialMessages carrega mensagens e define hasMore correto', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages
    });

    const { result } = renderHook(() => useMessagePagination());

    await act(async () => {
      await result.current.loadInitialMessages('conv-1');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/messages?conversationId=conv-1');
    expect(result.current.messages).toHaveLength(50);
    expect(result.current.hasMore).toBe(true); // Retornou 50, então hasMore = true
    expect(result.current.oldestMessageDate).toBe(mockMessages[0].created_at);
  });

  it('loadMoreMessages concatena antigas e atualiza cursor', async () => {
    const olderMessages = Array.from({ length: 20 }, (_, i) => ({
      id: `old-msg-${i}`,
      conversation_id: 'conv-1',
      content: `Old Message ${i}`,
      sender_type: 'agent' as const,
      created_at: new Date(900000000000 + i * 1000).toISOString()
    }));

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessages
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => olderMessages
      });

    const { result } = renderHook(() => useMessagePagination());

    // Primeiro carrega as iniciais
    await act(async () => {
      await result.current.loadInitialMessages('conv-1');
    });

    // Depois carrega mais
    await act(async () => {
      await result.current.loadMoreMessages('conv-1');
    });

    const encodedCursor = encodeURIComponent(mockMessages[0].created_at);
    expect(global.fetch).toHaveBeenLastCalledWith(`/api/messages?conversationId=conv-1&cursor=${encodedCursor}`);
    
    // Antigas devem vir antes das atuais
    expect(result.current.messages).toHaveLength(70);
    expect(result.current.messages[0].id).toBe('old-msg-0');
    expect(result.current.messages[69].id).toBe('msg-49');
    
    // hasMore deve ficar false porque carregou < 50
    expect(result.current.hasMore).toBe(false);
    expect(result.current.oldestMessageDate).toBe(olderMessages[0].created_at);
  });

  it('loadInitialMessages completes in < 200ms', async () => {
    const mockMessages = Array.from({ length: 50 }, (_, i) => ({
      id: `msg-${i}`,
      conversation_id: 'conv-1',
      content: `Message ${i}`,
      sender_type: 'agent' as const,
      created_at: new Date(1000000000000 + i * 1000).toISOString()
    }));

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return mockMessages;
      }
    });

    const { result } = renderHook(() => useMessagePagination());

    const startTime = performance.now();
    await act(async () => {
      await result.current.loadInitialMessages('conv-1');
    });
    const endTime = performance.now();

    const duration = endTime - startTime;
    expect(duration).toBeLessThan(200);
  });

  it('supports 500+ messages in memory without degradation', async () => {
    const largeMessageSet = Array.from({ length: 500 }, (_, i) => ({
      id: `msg-${i}`,
      conversation_id: 'conv-1',
      content: `Message ${i}`,
      sender_type: 'agent' as const,
      created_at: new Date(1000000000000 + i * 1000).toISOString()
    }));

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => largeMessageSet.slice(0, 50)
    });

    const { result } = renderHook(() => useMessagePagination());

    await act(async () => {
      await result.current.loadInitialMessages('conv-1');
    });

    // Simulate loading 9 more pages (9 * 50 = 450 messages)
    for (let i = 0; i < 9; i++) {
      const start = (i + 1) * 50;
      const end = Math.min(start + 50, largeMessageSet.length);

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => largeMessageSet.slice(start, end)
      });

      await act(async () => {
        await result.current.loadMoreMessages('conv-1');
      });
    }

    // Verify all messages loaded
    expect(result.current.messages.length).toBeGreaterThanOrEqual(500);

    // Verify state consistency
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);
  });
});
