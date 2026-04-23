import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/evo-go/route';
import { createClient } from '@supabase/supabase-js';

// No need to mock extractContactInfo if we provide a valid payload
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('handleMessagesUpsert logic in POST', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let insertMessageMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null });

    const createChain = (tableName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chain: any = {};
      chain.select = vi.fn().mockReturnValue(chain);
      chain.eq = vi.fn().mockReturnValue(chain);
      chain.order = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockReturnValue(chain);
      chain.maybeSingle = vi.fn().mockImplementation(() => {
        if (tableName === 'tenants') return Promise.resolve({ data: { id: 'tenant-123' }, error: null });
        if (tableName === 'conversations') return Promise.resolve({ data: { id: 'conv-123' }, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      chain.single = vi.fn().mockImplementation(() => {
        if (tableName === 'contacts') return Promise.resolve({ data: { id: 'contact-123' }, error: null });
        if (tableName === 'kanbans') return Promise.resolve({ data: { id: 'kanban-123' }, error: null });
        if (tableName === 'columns') return Promise.resolve({ data: { id: 'column-123' }, error: null });
        if (tableName === 'conversations') return Promise.resolve({ data: { id: 'conv-new' }, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      chain.update = vi.fn().mockReturnValue(chain);
      chain.insert = vi.fn().mockReturnValue(chain);
      // For the last eq in update chain
      chain.then = undefined;
      
      if (tableName === 'messages') {
        chain.insert = insertMessageMock;
      }
      
      return chain;
    };

    mockSupabase = {
      from: vi.fn().mockImplementation((table) => createChain(table)),
      rpc: vi.fn().mockResolvedValue({ data: 'contact-123', error: null }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('should persist an incoming message', async () => {
    const payload = {
      event: 'MESSAGES.UPSERT',
      instance: 'inst-123',
      data: {
        key: { id: 'msg-abc', fromMe: false, remoteJid: '5511999999999@s.whatsapp.net' },
        message: { conversation: 'Hello Dex' }
      }
    };

    const req = new Request('http://localhost:3000/api/webhooks/evo-go', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(req as any);
    expect(res.status).toBe(200);

    expect(insertMessageMock).toHaveBeenCalledWith({
      conversation_id: 'conv-123',
      sender_type: 'contact',
      content: 'Hello Dex',
      evolution_message_id: 'msg-abc',
      sender_jid: '5511999999999@s.whatsapp.net',
      media_url: null,
      media_type: null,
    });
  });

  it('should not persist an outgoing message (fromMe=true)', async () => {
    const payload = {
      event: 'MESSAGES.UPSERT',
      instance: 'inst-123',
      data: {
        key: { id: 'msg-abc', fromMe: true, remoteJid: '5511999999999@s.whatsapp.net' },
        message: { conversation: 'I am Dex' }
      }
    };

    const req = new Request('http://localhost:3000/api/webhooks/evo-go', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await POST(req as any);
    expect(insertMessageMock).not.toHaveBeenCalled();
  });

  it('should handle idempotency (duplicate messageId)', async () => {
    const payload = {
      event: 'MESSAGES.UPSERT',
      instance: 'inst-123',
      data: {
        key: { id: 'msg-abc', fromMe: false, remoteJid: '5511999999999@s.whatsapp.net' },
        message: { conversation: 'Hi' }
      }
    };

    insertMessageMock.mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate' } });

    const req = new Request('http://localhost:3000/api/webhooks/evo-go', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(req as any);
    expect(res.status).toBe(200); 
    expect(insertMessageMock).toHaveBeenCalled();
  });
});
