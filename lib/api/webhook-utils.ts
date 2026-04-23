export interface ContactInfo {
  waPhone:   string;
  name:      string;
  waName:    string;
  isGroup:   boolean;
  remoteJid: string;
  messageId?: string;
  isFromMe?:  boolean;
}

export interface MessageContent {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
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
 * Extracts typed contact information from webhook payload.
 * Supports both Evolution GO format (data.Info.Chat) and Evolution API v2 format (data.key.remoteJid).
 * Returns null if no recognizable format or remoteJid is missing/unparseable.
 */
export function extractContactInfo(data: unknown): ContactInfo | null {
  const d = data as Record<string, unknown> | null;
  if (!d) return null;

  // Evolution GO format: data.Info.Chat
  const info = d.Info as Record<string, unknown> | undefined;
  if (info?.Chat != null) {
    const remoteJid = info.Chat as string;
    const parsed = parseJid(remoteJid);
    if (!parsed) return null;

    const waPhone = normalizePhone(parsed.phone);
    if (!waPhone) return null;

    const pushName = (info.PushName as string | undefined) || '';
    const waName = pushName;
    const name = pushName || waPhone;

    return {
      waPhone,
      name,
      waName,
      isGroup: info.IsGroup === true,
      remoteJid,
      messageId: info.ID as string | undefined,
      isFromMe:  info.IsFromMe === true,
    };
  }

  // Evolution API v2 format: data.key.remoteJid (legacy)
  const key = d.key as Record<string, unknown> | undefined;
  const remoteJid = key?.remoteJid as string | undefined;

  const parsed = parseJid(remoteJid);
  if (!parsed) return null;

  const waPhone = normalizePhone(parsed.phone);
  if (!waPhone) return null;

  const pushName = (d.pushName as string | undefined) || '';
  const waName = pushName;
  const name = pushName || waPhone;

  return {
    waPhone,
    name,
    waName,
    isGroup: parsed.isGroup,
    remoteJid: remoteJid!,
    messageId: key?.id as string | undefined,
    isFromMe:  key?.fromMe === true,
  };
}

/**
 * Extracts content, media URL, and media type from Evolution GO message payload.
 */
export function extractMessageContent(data: unknown): MessageContent {
  const d = data as Record<string, unknown> | null;
  const message = (d?.Message || d?.message) as Record<string, any> | undefined;
  
  if (!message) return { text: '' };

  // 1. Text Message
  if (message.conversation) {
    return { text: message.conversation };
  }

  // 2. Extended Text Message (replies, links, etc)
  if (message.extendedTextMessage?.text) {
    return { text: message.extendedTextMessage.text };
  }

  // 3. Image Message
  if (message.imageMessage) {
    return { 
      text: message.imageMessage.caption || '', 
      mediaUrl: message.imageMessage.url || message.imageMessage.urlDirect,
      mediaType: 'image'
    };
  }

  // 4. Video Message
  if (message.videoMessage) {
    return { 
      text: message.videoMessage.caption || '', 
      mediaUrl: message.videoMessage.url || message.videoMessage.urlDirect,
      mediaType: 'video'
    };
  }

  // 5. Audio Message
  if (message.audioMessage) {
    return { 
      text: '', 
      mediaUrl: message.audioMessage.url || message.audioMessage.urlDirect,
      mediaType: 'audio'
    };
  }

  // Fallback
  return { text: '' };
}
