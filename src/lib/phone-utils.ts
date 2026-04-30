/**
 * Normalizes a phone number by removing all non-digit characters.
 * Useful for DB persistence and E.164-ish comparisons.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

/**
 * Basic formatting for display.
 * For now, it just returns the normalized number or original if no formatting logic is applied.
 * In Story 4.6, this will be expanded with E.164 formatting.
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return "";
  // Simple check: if it looks like a BR number (11 or 13 digits), we could format it.
  // But for Story 4.5, we keep it simple as per roadmap.
  return phone;
}
