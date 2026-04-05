/**
 * Rate Limiting Module Tests
 * Validates IP-based and email-based rate limiting logic
 */

import { checkIPLimit, checkEmailLimit, getClientIP, clearLimits } from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    clearLimits();
  });

  describe("getClientIP", () => {
    it("should extract client IP from X-Forwarded-For header", () => {
      const headers = {
        get: (name: string) => {
          if (name === "x-forwarded-for") {
            return "192.168.1.100, 10.0.0.1, 172.16.0.1";
          }
          return null;
        },
      };
      const ip = getClientIP(headers);
      expect(ip).toBe("192.168.1.100"); // First IP only
    });

    it("should fallback to 127.0.0.1 if X-Forwarded-For missing", () => {
      const headers = {
        get: () => null,
      };
      const ip = getClientIP(headers);
      expect(ip).toBe("127.0.0.1");
    });

    it("should trim whitespace from X-Forwarded-For", () => {
      const headers = {
        get: (name: string) => {
          if (name === "x-forwarded-for") {
            return "  192.168.1.100  , 10.0.0.1";
          }
          return null;
        },
      };
      const ip = getClientIP(headers);
      expect(ip).toBe("192.168.1.100");
    });
  });

  describe("IP-Based Rate Limiting", () => {
    it("should allow first 10 requests from same IP per 15min window", () => {
      const ip = "192.168.1.100";

      // First 10 should be allowed
      for (let i = 0; i < 10; i++) {
        const result = checkIPLimit(ip);
        expect(result.allowed).toBe(true);
        expect(result.remainingAttempts).toBe(10 - (i + 1));
      }
    });

    it("should block 11th request from same IP", () => {
      const ip = "192.168.1.101";

      // Use up 10 attempts
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip);
      }

      // 11th should be blocked
      const result = checkIPLimit(ip);
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.resetIn).toBeGreaterThan(0);
    });

    it("should return resetIn time in seconds", () => {
      const ip = "192.168.1.102";

      // Block the IP
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip);
      }
      const result = checkIPLimit(ip);

      expect(result.allowed).toBe(false);
      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(900); // 15 minutes in seconds
    });

    it("should allow different IPs independently", () => {
      const ip1 = "192.168.1.200";
      const ip2 = "192.168.1.201";

      // Use up attempts for ip1
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip1);
      }

      // ip2 should still have attempts available
      const result1 = checkIPLimit(ip1);
      const result2 = checkIPLimit(ip2);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });

  describe("Email-Based Rate Limiting", () => {
    it("should allow first 3 requests from same email per 60min window", () => {
      const email = "user@example.com";

      // First 3 should be allowed
      for (let i = 0; i < 3; i++) {
        const result = checkEmailLimit(email);
        expect(result.allowed).toBe(true);
        expect(result.remainingAttempts).toBe(3 - (i + 1));
      }
    });

    it("should block 4th request from same email", () => {
      const email = "user2@example.com";

      // Use up 3 attempts
      for (let i = 0; i < 3; i++) {
        checkEmailLimit(email);
      }

      // 4th should be blocked
      const result = checkEmailLimit(email);
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.resetIn).toBeGreaterThan(0);
    });

    it("should return resetIn time in seconds", () => {
      const email = "user3@example.com";

      // Block the email
      for (let i = 0; i < 3; i++) {
        checkEmailLimit(email);
      }
      const result = checkEmailLimit(email);

      expect(result.allowed).toBe(false);
      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(3600); // 60 minutes in seconds
    });

    it("should allow different emails independently", () => {
      const email1 = "user@example.com";
      const email2 = "other@example.com";

      // Use up attempts for email1
      for (let i = 0; i < 3; i++) {
        checkEmailLimit(email1);
      }

      // email2 should still have attempts available
      const result1 = checkEmailLimit(email1);
      const result2 = checkEmailLimit(email2);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });

  describe("Rate Limit Combinations", () => {
    it("should enforce both IP and email limits independently", () => {
      const ip = "192.168.1.150";
      const email = "test@example.com";

      // Max out IP limit
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip);
      }

      // Max out email limit
      for (let i = 0; i < 3; i++) {
        checkEmailLimit(email);
      }

      // Both should be blocked
      const ipResult = checkIPLimit(ip);
      const emailResult = checkEmailLimit(email);

      expect(ipResult.allowed).toBe(false);
      expect(emailResult.allowed).toBe(false);
    });

    it("should allow request when only one limit is hit", () => {
      const ip = "192.168.1.151";
      const email = "test2@example.com";

      // Max out only IP limit
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip);
      }

      // But email has full attempts
      const ipResult = checkIPLimit(ip);
      const emailResult = checkEmailLimit(email);

      expect(ipResult.allowed).toBe(false);
      expect(emailResult.allowed).toBe(true);
    });
  });

  describe("clearLimits", () => {
    it("should reset all rate limits", () => {
      const ip = "192.168.1.160";
      const email = "clear@example.com";

      // Max out both
      for (let i = 0; i < 10; i++) {
        checkIPLimit(ip);
      }
      for (let i = 0; i < 3; i++) {
        checkEmailLimit(email);
      }

      // Both blocked
      expect(checkIPLimit(ip).allowed).toBe(false);
      expect(checkEmailLimit(email).allowed).toBe(false);

      // Clear limits
      clearLimits();

      // Both should work again
      expect(checkIPLimit(ip).allowed).toBe(true);
      expect(checkEmailLimit(email).allowed).toBe(true);
    });
  });
});
