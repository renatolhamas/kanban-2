import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getEvoGoStatus,
  getEvoGoQRCode,
  callEvoGoCreateInstance,
  callEvoGoDisconnect,
  callEvoGoLogout,
  getOrCreateInstance,
  getEvoGoInstanceInfo,
  EvoGoError,
} from '../../lib/api/evo-go-client';

// Mock fetch using vitest's stubGlobal
vi.stubGlobal('fetch', vi.fn());

describe('getEvoGoStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should extract Connected (PascalCase) field', async () => {
    const mockResponse = {
      data: {
        Connected: true,
        LoggedIn: true,
        Name: 'test-instance',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoStatus('test-token');
    expect(result.connected).toBe(true);
    expect(result.logged_in).toBe(true);
    expect(result.name).toBe('test-instance');
  });

  it('should fallback to connected (camelCase) when Connected not present', async () => {
    const mockResponse = {
      data: {
        connected: true,
        logged_in: false,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoStatus('test-token');
    expect(result.connected).toBe(true);
    expect(result.logged_in).toBe(false);
  });

  it('should preserve false value with nullish coalescing', async () => {
    const mockResponse = {
      data: {
        Connected: false,
        LoggedIn: false,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoStatus('test-token');
    expect(result.connected).toBe(false);
    expect(result.logged_in).toBe(false);
  });

  it('should default to false when fields are missing', async () => {
    const mockResponse = {
      data: {},
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoStatus('test-token');
    expect(result.connected).toBe(false);
    expect(result.logged_in).toBe(false);
  });

  it('should throw error when response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    await expect(getEvoGoStatus('test-token')).rejects.toThrow(EvoGoError);
  });

  it('should throw error when instance token is missing', async () => {
    await expect(getEvoGoStatus('')).rejects.toThrow(EvoGoError);
  });
});

describe('getEvoGoQRCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should extract Qrcode (PascalCase) field', async () => {
    const mockResponse = {
      data: {
        Qrcode: 'data:image/png;base64,test',
        Code: 'test-code',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('data:image/png;base64,test');
    expect(result.code).toBe('test-code');
  });

  it('should fallback to qrcode (camelCase) when Qrcode not present', async () => {
    const mockResponse = {
      data: {
        qrcode: 'data:image/png;base64,camelCase',
        code: 'camelcase-code',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('data:image/png;base64,camelCase');
    expect(result.code).toBe('camelcase-code');
  });

  it('should fallback to qr_code (snake_case) when neither PascalCase nor camelCase present', async () => {
    const mockResponse = {
      data: {
        qr_code: 'data:image/png;base64,snakeCase',
        code: 'snakecase-code',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('data:image/png;base64,snakeCase');
    expect(result.code).toBe('snakecase-code');
  });

  it('should handle mixed case formats (PascalCase + camelCase)', async () => {
    const mockResponse = {
      data: {
        Qrcode: 'pascal-case-qr',
        code: 'camelcase-code',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('pascal-case-qr');
    expect(result.code).toBe('camelcase-code');
  });

  it('should return empty strings when QR code not yet generated', async () => {
    const mockResponse = {
      data: {
        qrcode: '',
        code: '',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('');
    expect(result.code).toBe('');
  });

  it('should throw error when response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    });

    await expect(getEvoGoQRCode('test-token')).rejects.toThrow(EvoGoError);
  });

  it('should throw error when instance token is missing', async () => {
    await expect(getEvoGoQRCode('')).rejects.toThrow(EvoGoError);
  });

  it('should handle timeout errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockRejectedValueOnce(
      new DOMException('The operation was aborted.', 'AbortError'),
    );

    await expect(getEvoGoQRCode('test-token')).rejects.toThrow(EvoGoError);
  });

  it('should handle missing data field in response', async () => {
    const mockResponse = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getEvoGoQRCode('test-token');
    expect(result.qr_code).toBe('');
    expect(result.code).toBe('');
  });
});

describe('callEvoGoCreateInstance — DIV-5 fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EVO_GO_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should extract id from create response directly', async () => {
    const mockResponse = {
      data: {
        id: 'instance-123',
        name: 'kanban-instance-tenant01',
        token: 'instance-token-xyz',
        qrcode: 'data:image/png;base64,test',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await callEvoGoCreateInstance('tenant-01');
    expect(result.instance_id).toBe('instance-123');
    expect(result.token).toBe('instance-token-xyz');
  });

  it('DIV-5: should fallback to lookup by name if id missing in response', async () => {
    const createResponse = {
      data: {
        // Missing 'id' field — DIV-5 scenario
        name: 'kanban-instance-tenant01',
        token: 'instance-token-xyz',
        qrcode: 'data:image/png;base64,test',
      },
    };

    const listResponse = {
      data: [
        {
          id: 'instance-456',
          name: 'kanban-instance-tenant01',
          token: 'instance-token-from-list',
          qrcode: 'data:image/png;base64,test',
          connected: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => listResponse,
      });

    const result = await callEvoGoCreateInstance('tenant-01');
    expect(result.instance_id).toBe('instance-456');
    expect(result.token).toBe('instance-token-from-list');
  });

  it('DIV-5: should throw error if id still missing after lookup', async () => {
    const createResponse = {
      data: {
        // Missing 'id'
        name: 'kanban-instance-tenant01',
        token: 'instance-token-xyz',
      },
    };

    const listResponse = {
      data: [], // Empty list, no matching instance
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => createResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => listResponse,
      });

    await expect(callEvoGoCreateInstance('tenant-01')).rejects.toThrow(EvoGoError);
  });
});

describe('callEvoGoDisconnect — DIV-8 soft disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('DIV-8: should call POST /instance/disconnect (soft disconnect)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    await callEvoGoDisconnect('instance-token-123');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global.fetch as any).mock.calls[0][0]).toContain('/instance/disconnect');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global.fetch as any).mock.calls[0][1]?.method).toBe('POST');
  });

  it('should throw error when token is missing', async () => {
    await expect(callEvoGoDisconnect('')).rejects.toThrow(EvoGoError);
  });

  it('should throw error when response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    });

    await expect(callEvoGoDisconnect('instance-token-123')).rejects.toThrow(EvoGoError);
  });
});

describe('callEvoGoLogout — DIV-8 destructive logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('DIV-8: should call DELETE /instance/logout (destructive logout)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    await callEvoGoLogout('instance-token-123');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global.fetch as any).mock.calls[0][0]).toContain('/instance/logout');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global.fetch as any).mock.calls[0][1]?.method).toBe('DELETE');
  });

  it('should throw error when token is missing', async () => {
    await expect(callEvoGoLogout('')).rejects.toThrow(EvoGoError);
  });
});

describe('getOrCreateInstance — DIV-11 token fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EVO_GO_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('DIV-11: should lookup token via /instance/info if missing in list', async () => {
    const listResponse = {
      data: [
        {
          id: 'instance-789',
          name: 'kanban-instance-tenant02',
          // Missing token field — DIV-11 scenario
          qrcode: '',
          connected: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const infoResponse = {
      data: {
        id: 'instance-789',
        name: 'kanban-instance-tenant02',
        token: 'instance-token-from-info',
        connected: false,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => listResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => infoResponse,
      });

    const result = await getOrCreateInstance('tenant-02');
    expect(result.instance_id).toBe('instance-789');
    expect(result.token).toBe('instance-token-from-info');
  });

  it('should use token from list if present', async () => {
    const tenantId = 'tenant-0123';
    const instanceName = `kanban-instance-${tenantId.substring(0, 8)}`; // kanban-instance-tenant-0
    const listResponse = {
      data: [
        {
          id: 'instance-890',
          name: instanceName,
          token: 'instance-token-from-list',
          qrcode: '',
          connected: false,
          createdAt: new Date().toISOString(),
        },
      ],
      message: 'Instances retrieved',
    };

    // Mock only the /instance/all call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => listResponse,
    });

    const result = await getOrCreateInstance(tenantId);
    expect(result.instance_id).toBe('instance-890');
    expect(result.token).toBe('instance-token-from-list');
  });
});

describe('getEvoGoInstanceInfo — DIV-11 helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EVO_GO_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch instance info from /instance/info/{id}', async () => {
    const infoResponse = {
      data: {
        id: 'instance-999',
        name: 'kanban-instance-test',
        token: 'instance-token-test',
        connected: true,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => infoResponse,
    });

    const result = await getEvoGoInstanceInfo('instance-999');
    expect(result.id).toBe('instance-999');
    expect(result.token).toBe('instance-token-test');
    expect(result.name).toBe('kanban-instance-test');
  });

  it('should throw error when response is not ok', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    });

    await expect(getEvoGoInstanceInfo('nonexistent-id')).rejects.toThrow(EvoGoError);
  });
});
