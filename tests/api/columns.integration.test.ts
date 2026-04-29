import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '../../../app/api/columns/reorder/route';
import { POST } from '../../../app/api/columns/route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  // Mock the final promise-like behavior
  then: vi.fn().mockImplementation((onFulfilled) => {
    return Promise.resolve({ data: null, error: null }).then(onFulfilled);
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabase),
}));

describe('Column API Integration', () => {
  const mockUser = {
    id: 'user-123',
    app_metadata: { tenant_id: 'tenant-123' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('POST /api/columns', () => {
    it('should create a column successfully', async () => {
      const payload = { name: 'New Column', kanban_id: 'kanban-123' };
      const req = new NextRequest('http://localhost/api/columns', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Mock Kanban ownership check
      mockSupabase.single.mockResolvedValueOnce({ data: { id: 'kanban-123' }, error: null });
      // Mock count check
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // No duplicate name
      mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { order_position: 5 }, error: null }); // Last column position

      // Final insert
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'col-1', name: 'New Column', order_position: 6 }, 
        error: null 
      });

      // Mock count specifically for the count check
      mockSupabase.select.mockImplementation((columns, options) => {
        if (options?.count === 'exact') {
           return { data: null, count: 5, error: null } as any;
        }
        return mockSupabase;
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.order_position).toBe(6);
    });
  });

  describe('PATCH /api/columns/reorder', () => {
    it('should swap positions between target and neighbor', async () => {
      const payload = { columnId: 'col-2', direction: 'up' };
      const req = new NextRequest('http://localhost/api/columns/reorder', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      // 1. Fetch target column
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'col-2', kanban_id: 'k1', order_position: 2 }, 
        error: null 
      });

      // 2. Find neighbor (prev for 'up')
      mockSupabase.maybeSingle.mockResolvedValueOnce({ 
        data: { id: 'col-1', order_position: 1 }, 
        error: null 
      });

      // 3. Updates
      mockSupabase.update.mockResolvedValue({ error: null });

      const res = await PATCH(req);
      const data = await res.json();

      if (res.status !== 200) {
        console.log('PATCH Error:', data);
      }

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledTimes(2);
    });
  });
});
