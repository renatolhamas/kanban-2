import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/evo-go/route';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('Story 5.4.3: Message Binding Logic Correction', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const createChain = (tableName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chain: any = { tableName };
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnThis();
      chain.order = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockReturnValue(chain);
      chain.maybeSingle = vi.fn().mockImplementation(() => {
        if (tableName === 'tenants') return Promise.resolve({ data: { id: 'tenant-1' }, error: null });
        if (tableName === 'conversations') return Promise.resolve({ data: { id: 'conv-active' }, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      chain.single = vi.fn().mockImplementation(() => {
        if (tableName === 'contacts') return Promise.resolve({ data: { id: 'contact-1' }, error: null });
        if (tableName === 'kanbans') return Promise.resolve({ data: { id: 'kanban-1' }, error: null });
        if (tableName === 'columns') return Promise.resolve({ data: { id: 'column-1' }, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      chain.update = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      chain.then = undefined;
      return chain;
    };

    mockSupabase = {
      from: vi.fn().mockImplementation((table) => createChain(table)),
      rpc: vi.fn().mockResolvedValue({ data: 'contact-1', error: null }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('should use status=active instead of kanban_id when searching for existing conversation', async () => {
    const payload = {
      event: 'MESSAGES.UPSERT',
      instance: 'inst-1',
      data: {
        key: { id: 'msg-1', fromMe: false, remoteJid: '5511999999999@s.whatsapp.net' },
        message: { conversation: 'Testing logic change' }
      }
    };

    const req = new Request('http://localhost:3000/api/webhooks/evo-go', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await POST(req as any);

    // Verify 'conversations' lookup
    const convChain = mockSupabase.from.mock.results.find(r => r.value.tableName === 'conversations').value;
    const convEq = convChain.eq;
    
    // Check that .eq('status', 'active') was called
    expect(convEq).toHaveBeenCalledWith('status', 'active');
    
    // Check that .eq('kanban_id', ...) was NOT called
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kanbanIdCalls = convEq.mock.calls.filter((call: any) => call[0] === 'kanban_id');
    expect(kanbanIdCalls.length).toBe(0);
    
    // Ensure tenant_id and contact_id are still there
    expect(convEq).toHaveBeenCalledWith('tenant_id', 'tenant-1');
    expect(convEq).toHaveBeenCalledWith('contact_id', 'contact-1');
  });
});
