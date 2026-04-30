import { describe, it, expect } from 'vitest';
import { normalizePhone, validateE164, formatPhoneForDisplay } from '../phone-utils';

describe('phone-utils', () => {
  describe('normalizePhone', () => {
    it('should remove non-digit characters except +', () => {
      expect(normalizePhone('+55 (11) 98765-4321')).toBe('+5511987654321');
      expect(normalizePhone('55 11 98765 4321')).toBe('5511987654321');
    });

    it('should return empty string if input is empty', () => {
      expect(normalizePhone('')).toBe('');
    });
  });

  describe('validateE164', () => {
    it('should validate a correct BR phone number', () => {
      const result = validateE164('+5511987654321');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('+5511987654321');
    });

    it('should validate a correct US phone number', () => {
      const result = validateE164('+12015550123');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('+12015550123');
    });

    it('should reject numbers without + prefix and suggest one', () => {
      const result = validateE164('5511987654321');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('começar com o código do país');
      expect(result.suggestion).toBe('+55 5511987654321');
    });

    it('should reject invalid formats and suggest a format', () => {
      const result = validateE164('+55119'); // Too short
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('inválido');
      expect(result.suggestion).toContain('Use o formato: +55');
    });
  });

  describe('formatPhoneForDisplay', () => {
    it('should format a normalized number for international display', () => {
      expect(formatPhoneForDisplay('+5511987654321')).toBe('+55 11 98765-4321');
      expect(formatPhoneForDisplay('+12015550123')).toBe('+1 201-555-0123');
    });

    it('should return original if format is invalid', () => {
      expect(formatPhoneForDisplay('invalid')).toBe('invalid');
    });
  });
});
