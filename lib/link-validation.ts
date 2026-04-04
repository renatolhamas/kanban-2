/**
 * Link Validation Module
 * Validates Supabase confirmation links before sending to users
 *
 * Robust URL parsing (not substring matching):
 * - Path must contain /auth/v1/verify
 * - type parameter must be exactly 'signup'
 * - token parameter must exist and not be empty
 */

export interface LinkValidationResult {
  passed: boolean;
  path: string;
  typeParam: string | null;
  tokenParam: string | null;
  errors: string[];
}

/**
 * Validate Supabase confirmation link format
 * Returns detailed validation result for logging/debugging
 */
export function validateConfirmationLink(link: string): LinkValidationResult {
  const errors: string[] = [];

  try {
    const url = new URL(link);
    const path = url.pathname;
    const typeParam = url.searchParams.get("type");
    const tokenParam = url.searchParams.get("token");

    // Check path contains /auth/v1/verify
    if (!path.includes("/auth/v1/verify")) {
      errors.push(`Path missing /auth/v1/verify (got: ${path})`);
    }

    // Check type is exactly 'signup'
    if (typeParam !== "signup") {
      errors.push(`type parameter must be 'signup' (got: ${typeParam})`);
    }

    // Check token exists and not empty
    if (!tokenParam || tokenParam.trim() === "") {
      errors.push(`token parameter missing or empty (got: ${tokenParam})`);
    }

    const passed = errors.length === 0;

    console.log(
      `[LINK_VALIDATION] ${passed ? "✅ PASSED" : "⚠️  WARNING"}: ${link}`,
      {
        path,
        typeParam,
        tokenParam: tokenParam ? "[REDACTED]" : null,
        errors,
      },
    );

    return {
      passed,
      path,
      typeParam,
      tokenParam,
      errors,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      path: "",
      typeParam: null,
      tokenParam: null,
      errors: [`Invalid URL format: ${error}`],
    };
  }
}
