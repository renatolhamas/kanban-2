/**
 * Evo GO Environment Variable Validation
 * Ensures all required Evo GO configuration is present
 */

export interface EvoGoEnvConfig {
  apiKey: string;
  apiUrl: string;
}

/**
 * Validate and retrieve Evo GO environment variables
 * @returns Configuration object if all required vars are set
 * @throws Error if required variables are missing
 */
export function validateEvoGoEnv(): EvoGoEnvConfig {
  const apiKey = process.env.EVO_GO_API_KEY;
  const apiUrl = process.env.EVOGO_API_URL || "https://evogo.renatop.com.br";

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: EVO_GO_API_KEY",
    );
  }

  if (!apiUrl) {
    throw new Error(
      "Missing required environment variable: EVOGO_API_URL",
    );
  }

  return {
    apiKey,
    apiUrl,
  };
}

/**
 * Validate environment variables at startup
 * Throws error if configuration is incomplete
 */
export function validateEvoGoStartup(): void {
  try {
    validateEvoGoEnv();
    console.log("[Evo GO] Environment configuration validated successfully");
  } catch (error) {
    console.error(
      "[Evo GO] Environment validation failed:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
