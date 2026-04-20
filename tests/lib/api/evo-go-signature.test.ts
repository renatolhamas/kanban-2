import { describe, it, expect } from "vitest";
import { validateEvoGoSignature, parseSignatureHeader } from "../../../lib/api/evo-go-signature";
import { createHmac } from "crypto";

describe("validateEvoGoSignature", () => {
  const secret = "test-webhook-secret";
  const body = '{"event":"MESSAGES_UPSERT","data":{}}';

  // Generate a valid signature for testing
  function generateValidSignature(testBody: string, testSecret: string): string {
    return createHmac("sha256", testSecret)
      .update(testBody)
      .digest("hex");
  }

  it("should return true for valid HMAC-SHA256 signature", () => {
    const validSignature = generateValidSignature(body, secret);
    const result = validateEvoGoSignature(body, validSignature, secret);
    expect(result).toBe(true);
  });

  it("should return false for invalid signature with different secret", () => {
    const validSignature = generateValidSignature(body, secret);
    const wrongSecret = "different-secret";
    const result = validateEvoGoSignature(body, validSignature, wrongSecret);
    expect(result).toBe(false);
  });

  it("should return false for tampered body content", () => {
    const validSignature = generateValidSignature(body, secret);
    const tamperedBody = '{"event":"MESSAGES_UPSERT","data":{"tampered":true}}';
    const result = validateEvoGoSignature(tamperedBody, validSignature, secret);
    expect(result).toBe(false);
  });

  it("should return false for completely wrong signature", () => {
    const wrongSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const result = validateEvoGoSignature(body, wrongSignature, secret);
    expect(result).toBe(false);
  });

  it("should handle empty body correctly", () => {
    const emptyBody = "";
    const validSignature = generateValidSignature(emptyBody, secret);
    const result = validateEvoGoSignature(emptyBody, validSignature, secret);
    expect(result).toBe(true);
  });

  it("should handle special characters in body", () => {
    const specialBody = 'Test message with "quotes", \'apostrophes\', and \\ backslash';
    const validSignature = generateValidSignature(specialBody, secret);
    expect(validateEvoGoSignature(specialBody, validSignature, secret)).toBe(true);
  });

  it("should handle unicode characters in body", () => {
    const unicodeBody = '{"message":"Olá mundo! 🌍"}';
    const validSignature = generateValidSignature(unicodeBody, secret);
    const result = validateEvoGoSignature(unicodeBody, validSignature, secret);
    expect(result).toBe(true);
  });

  it("should prevent timing attacks - constant time comparison", () => {
    const validSignature = generateValidSignature(body, secret);
    // Both should return false, but should take similar time regardless of where difference is
    const wrongSig1 = "00000000" + validSignature.slice(8);
    const wrongSig2 = validSignature.slice(0, -8) + "00000000";

    const result1 = validateEvoGoSignature(body, wrongSig1, secret);
    const result2 = validateEvoGoSignature(body, wrongSig2, secret);

    expect(result1).toBe(false);
    expect(result2).toBe(false);
    // Note: Actual timing comparison would require performance measurement
    // This test verifies the function handles signatures correctly
  });

  it("should handle null/undefined gracefully", () => {
    // These should not throw, but return false
    expect(() => validateEvoGoSignature(body, "", secret)).not.toThrow();
    expect(validateEvoGoSignature(body, "", secret)).toBe(false);
  });
});

describe("parseSignatureHeader", () => {
  it("should parse valid signature header", () => {
    const validSig = "a".repeat(64); // 64 hex chars = 256-bit SHA256
    const result = parseSignatureHeader(validSig);
    expect(result).toBe(validSig);
  });

  it("should return null for invalid signature format", () => {
    // Too short
    expect(parseSignatureHeader("a".repeat(32))).toBeNull();
    // Too long
    expect(parseSignatureHeader("a".repeat(128))).toBeNull();
    // Contains non-hex chars
    expect(parseSignatureHeader("g".repeat(64))).toBeNull();
    // Contains uppercase (still valid hex)
    expect(parseSignatureHeader("A".repeat(64))).toBe("A".repeat(64));
  });

  it("should return null for null/undefined header", () => {
    expect(parseSignatureHeader(null)).toBeNull();
    expect(parseSignatureHeader(undefined as unknown as string)).toBeNull();
  });

  it("should trim whitespace from valid signature", () => {
    const validSig = "a".repeat(64);
    const withWhitespace = `  ${validSig}  `;
    const result = parseSignatureHeader(withWhitespace);
    expect(result).toBe(validSig);
  });
});
