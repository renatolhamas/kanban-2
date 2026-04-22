import { describe, it, expect } from 'vitest';
import { parseJid, normalizePhone, extractContactInfo } from '../../lib/api/webhook-utils';

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

  it('detects group JID (@g.us)', () => {
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
  it('extracts contact from standard payload', () => {
    const data = {
      key: { remoteJid: '5511999999999@s.whatsapp.net', fromMe: false, id: 'ABC123' },
      pushName: 'João Silva',
    };
    expect(extractContactInfo(data)).toEqual({
      waPhone:   '+5511999999999',
      name:      'João Silva',
      waName:    'João Silva',
      isGroup:   false,
      remoteJid: '5511999999999@s.whatsapp.net',
      messageId: 'ABC123',
      isFromMe:  false,
    });
  });

  it('falls back name to waPhone when pushName absent', () => {
    const data = { key: { remoteJid: '5511999999999@s.whatsapp.net', id: 'ABC123' } };
    const result = extractContactInfo(data);
    expect(result?.name).toBe('+5511999999999');
    expect(result?.waName).toBe('');
    expect(result?.messageId).toBe('ABC123');
  });

  it('detects group contact', () => {
    const data = { key: { remoteJid: '120363XXXXXXXXXX@g.us', id: 'G123' }, pushName: 'Grupo Teste' };
    const result = extractContactInfo(data);
    expect(result?.isGroup).toBe(true);
    expect(result?.waPhone).toBe('+120363XXXXXXXXXX');
    expect(result?.messageId).toBe('G123');
  });

  it('handles multi-device suffix in JID', () => {
    const data = { key: { remoteJid: '5511999999999:1@s.whatsapp.net', id: 'M123' }, pushName: 'Test' };
    expect(extractContactInfo(data)?.waPhone).toBe('+5511999999999');
    expect(extractContactInfo(data)?.messageId).toBe('M123');
  });

  it('returns null for null data', () => {
    expect(extractContactInfo(null)).toBeNull();
  });

  it('returns null when remoteJid missing', () => {
    expect(extractContactInfo({ key: {} })).toBeNull();
  });
});

describe('extractContactInfo — Evolution GO format', () => {
  it('extracts all fields from Evo GO payload', () => {
    const data = {
      Info: {
        Chat: '559891302872@s.whatsapp.net',
        PushName: 'Renato Lhamas',
        IsFromMe: false,
        IsGroup: false,
        ID: '3EB01DED7202FB093A8713',
      },
      Message: { conversation: 'teste' },
    };
    expect(extractContactInfo(data)).toEqual({
      waPhone:   '+559891302872',
      name:      'Renato Lhamas',
      waName:    'Renato Lhamas',
      isGroup:   false,
      remoteJid: '559891302872@s.whatsapp.net',
      messageId: '3EB01DED7202FB093A8713',
      isFromMe:  false,
    });
  });

  it('falls back to waPhone when PushName absent', () => {
    const data = {
      Info: { Chat: '559891302872@s.whatsapp.net', IsGroup: false, ID: '3EB01' },
    };
    const result = extractContactInfo(data);
    expect(result?.waPhone).toBe('+559891302872');
    expect(result?.name).toBe('+559891302872');
    expect(result?.waName).toBe('');
    expect(result?.messageId).toBe('3EB01');
  });

  it('detects group via IsGroup: true', () => {
    const data = {
      Info: { Chat: '120363XXX@g.us', PushName: 'Grupo', IsGroup: true, ID: 'G001' },
    };
    const result = extractContactInfo(data);
    expect(result?.isGroup).toBe(true);
    expect(result?.messageId).toBe('G001');
  });
});
