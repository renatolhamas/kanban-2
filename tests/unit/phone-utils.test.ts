import { describe, it, expect } from 'vitest';
import { normalizePhone, formatPhoneForDisplay } from '@/lib/phone-utils';

describe('phone-utils', () => {
  describe('normalizePhone', () => {
    it('should remove non-digit characters', () => {
      expect(normalizePhone('+55 (11) 99999-9999')).toBe('5511999999999');
      expect(normalizePhone('123-456.789')).toBe('123456789');
      expect(normalizePhone(' ( ) - . ')).toBe('');
    });

    it('should return empty string for null or undefined', () => {
      expect(normalizePhone(null as any)).toBe('');
      expect(normalizePhone(undefined as any)).toBe('');
      expect(normalizePhone('')).toBe('');
    });
  });

  describe('formatPhoneForDisplay', () => {
    it('should return the phone as is for now', () => {
      expect(formatPhoneForDisplay('5511999999999')).toBe('5511999999999');
    });
  });
});
