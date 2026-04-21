export interface ContactInfo {
  waPhone:   string;
  name:      string;
  waName:    string;
  isGroup:   boolean;
  remoteJid: string;
}

/**
 * Parses a WhatsApp JID into phone + isGroup.
 * Strips multi-device suffixes (":1", ":2") and domain ("@s.whatsapp.net", "@g.us").
 * Returns null for empty/null/undefined input.
 */
export function parseJid(jid: string | null | undefined): { phone: string; isGroup: boolean } | null {
  if (!jid) return null;

  const isGroup = jid.endsWith('@g.us');

  // Strip multi-device suffix (e.g. "5511999:1@s.whatsapp.net" → "5511999@s.whatsapp.net")
  const withoutSuffix = jid.replace(/:(\d+)@/, '@');

  const phone = withoutSuffix.split('@')[0];

  if (!phone) return null;

  return { phone, isGroup };
}

/**
 * Normalizes a raw phone string to E.164 format.
 * Adds "+" prefix if not already present.
 * Returns null for empty/null/undefined input.
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  if (phone.startsWith('+')) return phone;
  return `+${phone}`;
}

/**
 * Extracts typed contact information from an Evo GO MESSAGES_UPSERT data payload.
 * Returns null if remoteJid is missing or unparseable.
 */
export function extractContactInfo(data: unknown): ContactInfo | null {
  const d = data as Record<string, unknown> | null;
  if (!d) return null;

  const key = d.key as Record<string, unknown> | undefined;
  const remoteJid = key?.remoteJid as string | undefined;

  const parsed = parseJid(remoteJid);
  if (!parsed) return null;

  const waPhone = normalizePhone(parsed.phone);
  if (!waPhone) return null;

  const pushName = (d.pushName as string | undefined) || '';
  const waName   = pushName;
  const name     = pushName || waPhone;

  return {
    waPhone,
    name,
    waName,
    isGroup:   parsed.isGroup,
    remoteJid: remoteJid!,
  };
}
