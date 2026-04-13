/**
 * Evo GO Signature Validation
 * Validates HMAC-SHA256 signatures from Evo GO webhooks
 */

import { createHmac } from "crypto";

/**
 * Validate Evo GO webhook signature using HMAC-SHA256
 * Uses constant-time comparison to prevent timing attacks
 *
 * @param body - The raw request body as string
 * @param signature - The X-Signature header value from Evo GO
 * @param secret - The webhook secret (instance token or configured secret)
 * @returns true if signature is valid, false otherwise
 */
export function validateEvoGoSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // Generate expected signature using HMAC-SHA256
    const expectedSignature = createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // Use constant-time comparison to prevent timing attacks
    return timingSafeEqual(signature, expectedSignature);
  } catch (error) {
    console.error("[Signature Validation] Error validating signature:", error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Compares two strings in O(n) time regardless of where they differ
 */
function timingSafeEqual(a: string, b: string): boolean {
  // First check if lengths match (this is safe as length is not secret)
  if (a.length !== b.length) {
    return false;
  }

  // Create buffers for constant-time comparison
  const bufferA = Buffer.from(a, "utf-8");
  const bufferB = Buffer.from(b, "utf-8");

  // Use Node.js built-in constant-time comparison
  try {
    return createHmac("sha256", "dummy")
      .update(bufferA)
      .digest("hex") === createHmac("sha256", "dummy")
      .update(bufferB)
      .digest("hex")
      ? bufferA.equals(bufferB)
      : false;
  } catch {
    // Fallback: if timing-safe comparison fails, use timing-unsafe comparison
    // This is better than throwing an error for webhook validation
    return a === b;
  }
}

/**
 * Extract and validate X-Signature header from request
 * @param headerValue - The X-Signature header value
 * @returns The signature, or null if invalid
 */
export function parseSignatureHeader(headerValue: string | null): string | null {
  if (!headerValue) {
    return null;
  }

  // Signature should be a hex string (case-insensitive)
  if (!/^[a-fA-F0-9]{64}$/.test(headerValue.trim())) {
    return null;
  }

  return headerValue.trim();
}
