import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '../../app/api/columns/reorder/route';
import { POST } from '../../app/api/columns/route';
import { NextRequest } from 'next/server';

const { mockSupabase, mockQueryBuilder } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryBuilder: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => queryBuilder),
  };

  const methods = ['select', 'eq', 'ilike', 'order', 'limit', 'single', 'maybeSingle', 'insert', 'update', 'delete', 'lt', 'gt'];
  methods.forEach(m => {
    queryBuilder[m] = vi.fn(() => queryBuilder);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryBuilder.then = vi.fn((onFulfilled: any) => {
    return Promise.resolve({ data: null, error: null }).then(onFulfilled);
  });

  return { mockSupabase: supabase, mockQueryBuilder: queryBuilder };
});

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
    
    // Reset query builder default behavior
    const methods = ['select', 'eq', 'ilike', 'order', 'limit', 'single', 'maybeSingle', 'insert', 'update', 'delete', 'lt', 'gt'];
    methods.forEach(m => {
      mockQueryBuilder[m].mockReturnValue(mockQueryBuilder);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockQueryBuilder.then.mockImplementation((onFulfilled: any) => {
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    });
  });

  describe('POST /api/columns', () => {
    it('should create a column successfully', async () => {
      const payload = { name: 'New Column', kanban_id: 'kanban-123' };
      const req = new NextRequest('http://localhost/api/columns', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Step 2: Kanban ownership
      mockQueryBuilder.single.mockResolvedValueOnce({ data: { id: 'kanban-123' }, error: null });
      
      // Step 3: Count check - eq is terminal here
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockQueryBuilder.then.mockImplementationOnce((onFulfilled: any) => {
        return Promise.resolve({ data: [], count: 5, error: null }).then(onFulfilled);
      });

      // Step 4: Duplicate check
      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Step 5: Last position
      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: { order_position: 5 }, error: null });

      // Step 6: Create
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: { id: 'col-1', name: 'New Column', order_position: 6 }, 
        error: null 
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
      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: { id: 'col-2', kanban_id: 'k1', order_position: 2 }, 
        error: null 
      });

      // 2. Find neighbor (prev for 'up')
      mockQueryBuilder.maybeSingle.mockResolvedValueOnce({ 
        data: { id: 'col-1', order_position: 1 }, 
        error: null 
      });

      // 3. Updates (eq is terminal)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockQueryBuilder.then.mockImplementation((onFulfilled: any) => {
        return Promise.resolve({ error: null }).then(onFulfilled);
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockQueryBuilder.update).toHaveBeenCalledTimes(2);
    });
  });
});
