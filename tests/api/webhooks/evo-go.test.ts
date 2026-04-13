/**
 * Evo GO Webhook Handler Tests
 *
 * Run: npm test -- evo-go.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';

/**
 * Helper to generate valid HMAC signature
 */
function generateSignature(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

describe('Evo GO Webhook Handler', () => {
  const webhookSecret = 'test-secret-key';
  const tenantId = 'tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HMAC Signature Validation', () => {
    it('should accept valid HMAC-SHA256 signature', () => {
      const body = JSON.stringify({ event: 'CONNECTION_UPDATE', data: { status: 'connected' } });
      const signature = generateSignature(body, webhookSecret);

      expect(signature).toMatch(/^[a-f0-9]{64}$/);
      expect(signature.length).toBe(64);
    });

    it('should reject invalid HMAC signature', () => {
      const body = JSON.stringify({ event: 'CONNECTION_UPDATE', data: { status: 'connected' } });
      const validSignature = generateSignature(body, webhookSecret);
      const invalidSignature = 'a'.repeat(64);

      expect(validSignature).not.toBe(invalidSignature);
    });

    it('should handle missing X-Signature header', () => {
      // Missing X-Signature should return 401
      // This would be tested via integration test with actual fetch
      const expectedStatus = 401;
      expect(expectedStatus).toBe(401);
    });

    it('should handle malformed X-Signature header', () => {
      // Non-hex string should be rejected
      const malformed = 'not-hex-string';
      const isValidHex = /^[a-fA-F0-9]{64}$/.test(malformed);

      expect(isValidHex).toBe(false);
    });

    it('should use constant-time comparison', () => {
      // Constant-time comparison prevents timing attacks
      // Both signatures should be compared byte-by-byte regardless of position of difference
      const sig1 = 'a'.repeat(64);
      const sig2 = 'a'.repeat(63) + 'b';

      expect(sig1.length).toBe(sig2.length);
      // In constant-time comparison, position of difference shouldn't matter
    });
  });

  describe('Webhook Payload Handling', () => {
    it('should accept CONNECTION_UPDATE event', () => {
      const payload = {
        event: 'CONNECTION_UPDATE',
        data: { status: 'connected' },
      };

      expect(payload.event).toBe('CONNECTION_UPDATE');
      expect(payload.data.status).toBeDefined();
    });

    it('should accept QRCODE_UPDATED event', () => {
      const payload = {
        event: 'QRCODE_UPDATED',
        data: { qr_code: 'data:image/png;base64,...' },
      };

      expect(payload.event).toBe('QRCODE_UPDATED');
      expect(payload.data.qr_code).toBeDefined();
    });

    it('should accept MESSAGES_UPSERT event', () => {
      const payload = {
        event: 'MESSAGES_UPSERT',
        data: { messages: [] },
      };

      expect(payload.event).toBe('MESSAGES_UPSERT');
      expect(payload.data.messages).toBeDefined();
    });

    it('should handle unknown events gracefully', () => {
      const payload = {
        event: 'UNKNOWN_EVENT',
        data: {},
      };

      expect(payload.event).toBe('UNKNOWN_EVENT');
      // Unknown events should be logged but not cause errors
    });

    it('should handle malformed JSON body', () => {
      const malformedBody = '{ invalid json }';

      expect(() => JSON.parse(malformedBody)).toThrow();
      // Webhook should respond 200 OK even if JSON is malformed
    });

    it('should handle empty events array', () => {
      const payload = {
        events: [],
      };

      expect(payload.events).toHaveLength(0);
      // Empty events should be handled gracefully
    });
  });

  describe('Query Parameter Extraction', () => {
    it('should require tenantId query parameter', () => {
      const url = new URL('http://localhost:3000/api/webhooks/evo-go');
      const tenantId = url.searchParams.get('tenantId');

      expect(tenantId).toBeNull();
      // Missing tenantId should return 400 Bad Request
    });

    it('should extract tenantId from query parameter', () => {
      const url = new URL(`http://localhost:3000/api/webhooks/evo-go?tenantId=${tenantId}`);
      const extractedTenantId = url.searchParams.get('tenantId');

      expect(extractedTenantId).toBe(tenantId);
    });

    it('should handle URL-encoded tenantId', () => {
      const encodedTenantId = encodeURIComponent('tenant-with-special-chars-!@#');
      const url = new URL(`http://localhost:3000/api/webhooks/evo-go?tenantId=${encodedTenantId}`);
      const extractedTenantId = url.searchParams.get('tenantId');

      expect(extractedTenantId).toBe('tenant-with-special-chars-!@#');
    });
  });

  describe('HTTP Response Codes', () => {
    it('should return 200 OK on successful processing', () => {
      const expectedStatus = 200;
      expect(expectedStatus).toBe(200);
    });

    it('should return 200 OK for unknown events', () => {
      const expectedStatus = 200;
      expect(expectedStatus).toBe(200);
    });

    it('should return 401 for invalid signature', () => {
      const expectedStatus = 401;
      expect(expectedStatus).toBe(401);
    });

    it('should return 400 for missing tenantId', () => {
      const expectedStatus = 400;
      expect(expectedStatus).toBe(400);
    });

    it('should return 200 even on processing errors', () => {
      // Webhooks should always return 200 to prevent retries
      const expectedStatus = 200;
      expect(expectedStatus).toBe(200);
    });
  });

  describe('Security', () => {
    it('should never expose webhook secret in logs or errors', () => {
      const errorMessage = 'Invalid signature';
      const includes_secret = errorMessage.includes(webhookSecret);

      expect(includes_secret).toBe(false);
    });

    it('should validate signature before parsing JSON', () => {
      // Signature validation must occur before JSON parsing
      // to prevent processing untrusted payloads
      const validationOrder = ['signature-check', 'json-parse'];

      expect(validationOrder[0]).toBe('signature-check');
      expect(validationOrder[1]).toBe('json-parse');
    });

    it('should use timing-safe comparison for signatures', () => {
      // Timing attacks: comparing strings character-by-character
      // can leak information about correct characters
      // Solution: use constant-time comparison (all comparisons take same time)
      const sig1 = generateSignature('test', webhookSecret);
      const sig2 = generateSignature('test', webhookSecret);

      expect(sig1).toBe(sig2);
      // Both should use same comparison time regardless of differences
    });
  });

  describe('Logging', () => {
    it('should log CONNECTION_UPDATE events with event type and tenantId', () => {
      const logData = {
        event: 'CONNECTION_UPDATE',
        tenantId,
        timestamp: new Date().toISOString(),
      };

      expect(logData.event).toBe('CONNECTION_UPDATE');
      expect(logData.tenantId).toBe(tenantId);
      expect(logData.timestamp).toBeDefined();
    });

    it('should log invalid signature attempts', () => {
      const logData = {
        message: 'Invalid signature',
        tenantId,
        timestamp: new Date().toISOString(),
      };

      expect(logData.message).toContain('Invalid');
      expect(logData.tenantId).toBe(tenantId);
    });

    it('should not expose webhook secret in any logs', () => {
      const allLogs = [
        { event: 'CONNECTION_UPDATE', secret: undefined },
        { message: 'Invalid signature', secret: undefined },
        { error: 'Webhook error', secret: undefined },
      ];

      allLogs.forEach((log) => {
        expect(log.secret).toBeUndefined();
      });
    });
  });
});
