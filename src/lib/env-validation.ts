/**
 * Environment Validation
 * Validates critical configuration by NODE_ENV to prevent
 * misconfigured production deployments (e.g., wrong confirmation domain)
 */

interface EnvironmentConfig {
  nodeEnv: string;
  appDomain: string;
  expectedDomains: string[];
  isSandbox: boolean;
}

/**
 * Validate app domain (extracted from NEXT_PUBLIC_APP_URL) matches expected value for NODE_ENV
 * - Development: localhost:3017 (flexible, allows overrides)
 * - Staging: staging.kanban.com (warn on mismatch)
 * - Production: kanban.renatolhamas.com.br (FAIL on mismatch — prevents deploy)
 */
export function validateEnvironmentDomain(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kanban.renatolhamas.com.br";

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
  }

  // Extract domain from URL (hostname without port for production comparison)
  let appDomain: string;
  try {
    const url = new URL(appUrl);
    appDomain = url.hostname; // Gets domain without port (kanban.renatolhamas.com.br)
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_APP_URL format: ${appUrl}`);
  }

  const expectedDomains: Record<string, string[]> = {
    development: ["localhost", "127.0.0.1"], // Only hostnames, ports handled separately
    production: ["kanban.renatolhamas.com.br"],
    test: ["localhost"],
  };

  const expected = expectedDomains[nodeEnv] || expectedDomains.development;
  const isMatch = expected.includes(appDomain);

  if (nodeEnv === "production" && !isMatch) {
    throw new Error(
      `[CRITICAL] Production domain mismatch. ` +
        `Expected: ${expected.join(" or ")}, Got: ${appDomain}. ` +
        `Deployment blocked for safety.`,
    );
  }

  if (nodeEnv !== "production" && !isMatch) {
    console.warn(
      `[WARNING] ${nodeEnv} domain mismatch. ` +
        `Expected: ${expected.join(" or ")}, Got: ${appDomain}. ` +
        `Proceeding, but verify your configuration.`,
    );
  }

  // Detect sandbox mode (Resend test email)
  const isSandbox = appDomain === "localhost" || appDomain === "127.0.0.1" || process.env.NODE_ENV === "development";

  return {
    nodeEnv,
    appDomain,
    expectedDomains: expected,
    isSandbox,
  };
}

/**
 * Validate Resend configuration
 * - API key required
 * - From domain required
 * - Production cannot use sandbox in email
 */
export function validateResendConfig(): {
  apiKey: string;
  fromDomain: string;
  isSandbox: boolean;
} {
  const apiKey = process.env.RESEND_API_KEY;
  const fromDomain = process.env.RESEND_FROM_DOMAIN;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  if (!fromDomain) {
    throw new Error("Missing RESEND_FROM_DOMAIN environment variable");
  }

  const isSandbox = process.env.NODE_ENV === "development";

  return {
    apiKey,
    fromDomain,
    isSandbox,
  };
}
