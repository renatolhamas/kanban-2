import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from '@/app/api/conversations/update-column/route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('PUT /api/conversations/update-column', () => {
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: mockSingle
        }))
      }))
    }))
  }));
  const mockSelect = vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: mockSingle
        }))
      })),
      single: mockSingle
    }))
  }));

  const mockSupabase = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate
    }))
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSingle.mockReset();
    mockSelect.mockClear();
    mockUpdate.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it('deve atualizar column_id e kanban_id corretamente', async () => {
    // Mock Auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { app_metadata: { tenant_id: 'tenant-123' } } },
      error: null
    });

    // Mock Column Fetch
    const mockColumnData = {
      id: 'col-456',
      kanban_id: 'kanban-789',
      kanban: { tenant_id: 'tenant-123' }
    };
    mockSingle.mockResolvedValueOnce({
      data: mockColumnData,
      error: null
    });

    // Mock Conversation Update
    const mockUpdatedConv = { id: 'conv-1', column_id: 'col-456', kanban_id: 'kanban-789' };
    mockSingle.mockResolvedValueOnce({
      data: mockUpdatedConv,
      error: null
    });

    const req = new NextRequest('http://localhost/api/conversations/update-column', {
      method: 'PUT',
      body: JSON.stringify({ conversation_id: 'conv-1', column_id: 'col-456' })
    });

    const response = await PUT(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
    // Verify atomic update
    expect(mockUpdate).toHaveBeenCalledWith({
      column_id: 'col-456',
      kanban_id: 'kanban-789'
    });
  });

  it('deve retornar 403 se o tenant for diferente', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { app_metadata: { tenant_id: 'tenant-123' } } },
      error: null
    });

    const mockColumnData = {
      id: 'col-456',
      kanban_id: 'kanban-789',
      kanban: { tenant_id: 'OTHER-TENANT' }
    };
    mockSingle.mockResolvedValueOnce({
      data: mockColumnData,
      error: null
    });

    const req = new NextRequest('http://localhost/api/conversations/update-column', {
      method: 'PUT',
      body: JSON.stringify({ conversation_id: 'conv-1', column_id: 'col-456' })
    });

    const response = await PUT(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Unauthorized column access');
  });
});
