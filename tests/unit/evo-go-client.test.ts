import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEvoGoStatus, getEvoGoQRCode, EvoGoError } from '../../lib/api/evo-go-client';

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
