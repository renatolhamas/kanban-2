import { describe, it, expect } from 'vitest';
import { parseJid, normalizePhone, extractContactInfo } from '../api/webhook-utils';

describe('parseJid', () => {
  it('parses regular JID', () => {
    expect(parseJid('5511987654321@s.whatsapp.net')).toEqual({ phone: '5511987654321', isGroup: false });
  });

  it('strips multi-device suffix :1', () => {
    expect(parseJid('5511987654321:1@s.whatsapp.net')).toEqual({ phone: '5511987654321', isGroup: false });
  });

  it('strips multi-device suffix :2', () => {
    expect(parseJid('5511987654321:2@s.whatsapp.net')).toEqual({ phone: '5511987654321', isGroup: false });
  });

  it('detects group JID', () => {
    expect(parseJid('120363XXXXXXXXXX@g.us')).toEqual({ phone: '120363XXXXXXXXXX', isGroup: true });
  });

  it('returns null for empty string', () => {
    expect(parseJid('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(parseJid(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parseJid(undefined)).toBeNull();
  });
});

describe('normalizePhone', () => {
  it('adds + prefix to bare number', () => {
    expect(normalizePhone('5511987654321')).toBe('+5511987654321');
  });

  it('keeps existing + prefix', () => {
    expect(normalizePhone('+5511987654321')).toBe('+5511987654321');
  });

  it('returns null for empty string', () => {
    expect(normalizePhone('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(normalizePhone(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(normalizePhone(undefined)).toBeNull();
  });
});

describe('extractContactInfo', () => {
  const baseData = {
    key: { remoteJid: '5511999999999@s.whatsapp.net', fromMe: false, id: 'ABC123' },
    pushName: 'João Silva',
    messageTimestamp: '1699999999',
  };

  it('extracts contact from standard payload', () => {
    const result = extractContactInfo(baseData);
    expect(result).toEqual({
      waPhone:   '+5511999999999',
      name:      'João Silva',
      waName:    'João Silva',
      isGroup:   false,
      remoteJid: '5511999999999@s.whatsapp.net',
    });
  });

  it('falls back name to waPhone when pushName is absent', () => {
    const data = { key: { remoteJid: '5511999999999@s.whatsapp.net' } };
    const result = extractContactInfo(data);
    expect(result?.name).toBe('+5511999999999');
    expect(result?.waName).toBe('');
  });

  it('detects group contact', () => {
    const data = { key: { remoteJid: '120363XXXXXXXXXX@g.us' }, pushName: 'Grupo Teste' };
    const result = extractContactInfo(data);
    expect(result?.isGroup).toBe(true);
    expect(result?.waPhone).toBe('+120363XXXXXXXXXX');
  });

  it('handles multi-device suffix in JID', () => {
    const data = { key: { remoteJid: '5511999999999:1@s.whatsapp.net' }, pushName: 'Test' };
    const result = extractContactInfo(data);
    expect(result?.waPhone).toBe('+5511999999999');
  });

  it('returns null for null data', () => {
    expect(extractContactInfo(null)).toBeNull();
  });

  it('returns null when remoteJid is missing', () => {
    expect(extractContactInfo({ key: {} })).toBeNull();
  });
});
