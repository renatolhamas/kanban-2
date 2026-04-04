/**
 * Rate Limiting Module (In-Memory MVP)
 * Protects against spam and abuse registration
 *
 * Rules:
 * - IP-based: max 10 attempts per 15 minutes
 * - Email-based: max 3 attempts per 60 minutes
 * - Apply BEFORE input validation (prevents enumeration attacks)
 *
 * TODO Phase 1.5: Migrate to Redis for multi-instance deployments
 */

interface RateLimitEntry {
  attempts: number;
  resetAt: number; // Timestamp when counter resets
}

// In-memory stores (wiped on server restart)
const ipAttempts = new Map<string, RateLimitEntry>();
const emailAttempts = new Map<string, RateLimitEntry>();

const IP_LIMIT = 10; // attempts per window
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const EMAIL_LIMIT = 3; // attempts per window
const EMAIL_WINDOW_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Extract client IP from request headers
 * Proxy/load balancer aware: checks X-Forwarded-For before connection remoteAddress
 */
export function getClientIP(
  headers: { get: (name: string) => string | null },
): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, first is original client
    return forwarded.split(",")[0].trim();
  }

  // Fallback to direct connection IP
  // Note: In Next.js API routes, this is typically unavailable, so X-Forwarded-For is more reliable
  return "127.0.0.1";
}

/**
 * Check IP-based rate limit
 * Returns: { allowed: boolean, remainingAttempts: number, resetIn: number (seconds) }
 */
export function checkIPLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = ipAttempts.get(ip);

  // No history or window expired
  if (!entry || now >= entry.resetAt) {
    ipAttempts.set(ip, {
      attempts: 1,
      resetAt: now + IP_WINDOW_MS,
    });
    return {
      allowed: true,
      remainingAttempts: IP_LIMIT - 1,
      resetIn: Math.ceil(IP_WINDOW_MS / 1000),
    };
  }

  // Increment counter
  entry.attempts += 1;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  // Check if over limit (block at #11)
  if (entry.attempts > IP_LIMIT) {
    console.warn(
      `[RATE_LIMIT] IP ${ip} blocked: ${entry.attempts} attempts in ${IP_WINDOW_MS / 1000 / 60}min`,
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      resetIn,
    };
  }

  return {
    allowed: true,
    remainingAttempts: IP_LIMIT - entry.attempts,
    resetIn,
  };
}

/**
 * Check email-based rate limit
 * Returns: { allowed: boolean, remainingAttempts: number, resetIn: number (seconds) }
 */
export function checkEmailLimit(email: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = emailAttempts.get(email);

  // No history or window expired
  if (!entry || now >= entry.resetAt) {
    emailAttempts.set(email, {
      attempts: 1,
      resetAt: now + EMAIL_WINDOW_MS,
    });
    return {
      allowed: true,
      remainingAttempts: EMAIL_LIMIT - 1,
      resetIn: Math.ceil(EMAIL_WINDOW_MS / 1000),
    };
  }

  // Increment counter
  entry.attempts += 1;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  // Check if over limit (block at #4)
  if (entry.attempts > EMAIL_LIMIT) {
    console.warn(
      `[RATE_LIMIT] Email ${email} blocked: ${entry.attempts} attempts in ${EMAIL_WINDOW_MS / 1000 / 60}min`,
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      resetIn,
    };
  }

  return {
    allowed: true,
    remainingAttempts: EMAIL_LIMIT - entry.attempts,
    resetIn,
  };
}

/**
 * Clear rate limit for testing/manual overrides
 */
export function clearLimits(): void {
  ipAttempts.clear();
  emailAttempts.clear();
}
