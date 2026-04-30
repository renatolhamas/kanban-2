import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../app/api/contacts/route';
import { PATCH, DELETE } from '../../app/api/contacts/[id]/route';
import { NextRequest } from 'next/server';

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

function createMockQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn(function() { return this; }),
    eq: vi.fn(function() { return this; }),
    order: vi.fn(function() { return this; }),
    range: vi.fn(function() { return this; }),
    insert: vi.fn(function() { return this; }),
    update: vi.fn(function() { return this; }),
    delete: vi.fn(function() { return this; }),
    single: vi.fn(function() { return this; }),
    then: vi.fn(function(onFulfilled: (data: Record<string, unknown>) => unknown) {
      return Promise.resolve({ data: null, error: null, count: 0 }).then(onFulfilled);
    }),
  };
  return builder;
}

let mockQueryBuilder = createMockQueryBuilder();
mockSupabase.from.mockReturnValue(mockQueryBuilder);

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabase),
}));

vi.mock('@/lib/phone-utils', () => ({
  normalizePhone: (phone: string) => phone.replace(/[^\d+]/g, ''),
}));

describe('Contacts API Integration', () => {
  const mockUser = {
    id: 'user-123',
    app_metadata: { tenant_id: 'tenant-123' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryBuilder = createMockQueryBuilder();
    mockSupabase.from.mockReturnValue(mockQueryBuilder);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe('GET /api/contacts', () => {
    it('should fetch paginated contacts for tenant', async () => {
      const req = new NextRequest('http://localhost/api/contacts?page=1&limit=10');

      mockQueryBuilder.then.mockImplementationOnce((onFulfilled: (data: Record<string, unknown>) => unknown) => {
        return Promise.resolve({
          data: [{ id: '1', name: 'Test' }],
          count: 1,
          error: null
        }).then(onFulfilled);
      });

      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.contacts).toHaveLength(1);
      expect(data.pagination.total).toBe(1);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('tenant_id', 'tenant-123');
    });

    it('should return 401 if unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Unauthorized') });
      const req = new NextRequest('http://localhost/api/contacts');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/contacts', () => {
    it('should create contact with normalized phone', async () => {
      const payload = { name: 'John Doe', phone: '+55 (11) 99999-8888' };
      const req = new NextRequest('http://localhost/api/contacts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: { id: '1', name: 'John Doe', phone: '+5511999998888' }, 
        error: null 
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.phone).toBe('+5511999998888');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
        phone: '+5511999998888',
        tenant_id: 'tenant-123'
      }));
    });
  });

  describe('PATCH /api/contacts/[id]', () => {
    it('should update contact and verify ownership', async () => {
      const payload = { name: 'Updated Name' };
      const req = new NextRequest('http://localhost/api/contacts/1', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      mockQueryBuilder.single.mockResolvedValueOnce({ 
        data: { id: '1', name: 'Updated Name' }, 
        error: null 
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('Updated Name');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('tenant_id', 'tenant-123');
    });
  });

  describe('DELETE /api/contacts/[id]', () => {
    it('should delete contact and verify ownership', async () => {
      const req = new NextRequest('http://localhost/api/contacts/1', {
        method: 'DELETE',
      });

      mockQueryBuilder.then.mockImplementationOnce((onFulfilled: (data: Record<string, unknown>) => unknown) => {
        return Promise.resolve({ error: null }).then(onFulfilled);
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('tenant_id', 'tenant-123');
    });
  });
});
