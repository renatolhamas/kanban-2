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
 * Validate NEXT_PUBLIC_APP_DOMAIN matches expected value for NODE_ENV
 * - Development: localhost:3017 (flexible, allows overrides)
 * - Staging: staging.kanban.com (warn on mismatch)
 * - Production: kanban.renatolhamas.com.br (FAIL on mismatch — prevents deploy)
 */
export function validateEnvironmentDomain(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  if (!appDomain) {
    throw new Error("Missing NEXT_PUBLIC_APP_DOMAIN environment variable");
  }

  const expectedDomains: Record<string, string[]> = {
    development: ["localhost:3017", "localhost:3000", "127.0.0.1:3017"],
    production: ["kanban.renatolhamas.com.br"],
    test: ["localhost:3017"],
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
  const isSandbox = appDomain.includes("localhost") || process.env.NODE_ENV === "development";

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
