/**
 * Evo GO API Client
 * Handles communication with Evo GO API for WhatsApp instance management
 */

export interface EvoGoCreateInstanceRequest {
  name: string;
  integration?: string; // "WHATSAPP-BUSINESS" or "WHATSAPP-PERSONAL"
  number?: string; // E.164 format: +5511987654321
}

export interface EvoGoCreateInstanceResponse {
  instanceId: string;
  token: string;
  qrCode: string;
  phone?: string;
  status?: "connecting" | "connected" | "failed";
  expires_at?: string; // ISO 8601
}

interface RetryConfig {
  maxRetries: number;
  delays: number[]; // delays in milliseconds
  timeout: number; // timeout in milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [1000, 2000, 4000], // 1s, 2s, 4s
  timeout: 5000, // 5 seconds
};

const EVOGO_API_BASE = process.env.EVOGO_API_URL || "https://evogo.renatop.com.br";

/**
 * Call Evo GO API to create a new WhatsApp instance
 * Implements retry logic with exponential backoff
 */
export async function callEvoGoCreateInstance(
  tenantId: string,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<EvoGoCreateInstanceResponse> {
  const apiKey = process.env.EVO_GO_API_KEY;

  console.log('[Evo GO] callEvoGoCreateInstance() called');
  console.log('[Evo GO] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Evo GO] API Key first 20 chars:', apiKey?.substring(0, 20));
  console.log('[Evo GO] Is test key?', apiKey?.startsWith('test_dev_'));

  if (!apiKey) {
    throw new Error("EVO_GO_API_KEY environment variable is not set");
  }

  // Development mock - DISABLED for real API testing
  // Uncomment below to re-enable mock mode
  /*
  if (process.env.NODE_ENV === 'development' && apiKey.startsWith('test_dev_')) {
    console.log('[Evo GO] ⚠️ MOCK MODE - Not calling real Evo GO API');
    console.log('[Evo GO] API Key starts with "test_dev_" - returning mock QR code');
    return {
      instance_id: 'mock_' + Math.random().toString(36).substr(2, 9),
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACheD8fAAAAIGNIUk0AAHomAAA' +
               'CgABEqwAcEAAACgABEqwAcEAAAAAJcEhZcwAAAHAAAABwAHpRyqkAAAKeSURBVHic7doxDoMwEERBT' +
               'JNuIBj4tP0BbmAbMIzgwEzSi/IhPfgQi9XJd4ql4xgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHiJ' +
               'qJhvVXU5Ho7H0+l0Go7H43VdX5fL5XI+n5fz+VxVVVVV1eVyuV6vV1VVlWVZWZaVZVkzM3NmZkY' +
               'AAAAAAAAAAAAAAOB/SiKqT09PAAAA',
      phone: '+5511999999999',
      status: 'connecting',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }
  */

  const request: EvoGoCreateInstanceRequest = {
    name: `kanban-instance-${tenantId.substring(0, 8)}`,
    integration: 'WHATSAPP-BUSINESS',
    // number is optional on create - only needed on update
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      console.log(`[Evo GO] Attempt ${attempt + 1}/${retryConfig.maxRetries}`);
      console.log(`[Evo GO] Calling: ${EVOGO_API_BASE}/instance/create`);
      console.log(`[Evo GO] Using API Key: ${apiKey.substring(0, 10)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        retryConfig.timeout,
      );

      const response = await fetch(
        `${EVOGO_API_BASE}/instance/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Token": apiKey,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        },
      );

      console.log(`[Evo GO] Response status: ${response.status}`);
      console.log(`[Evo GO] Response statusText: ${response.statusText}`);

      clearTimeout(timeoutId);

      // Handle specific HTTP errors
      if (response.status === 401) {
        throw new EvoGoError("Invalid Evo GO API key", "INVALID_TOKEN", 401);
      }

      if (response.status === 429) {
        // Rate limited - continue retry
        lastError = new EvoGoError(
          "Rate limit exceeded",
          "RATE_LIMIT",
          429,
        );

        if (attempt < retryConfig.maxRetries - 1) {
          await delay(retryConfig.delays[attempt]);
          continue;
        }
        throw lastError;
      }

      if (response.status >= 500) {
        // Server error - try retry
        lastError = new EvoGoError(
          "Evo GO server error",
          "SERVER_ERROR",
          response.status,
        );

        if (attempt < retryConfig.maxRetries - 1) {
          await delay(retryConfig.delays[attempt]);
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        throw new EvoGoError(
          "Failed to create instance",
          "API_ERROR",
          response.status,
        );
      }

      const data = await response.json();

      // Validate response structure (Evo GO uses camelCase)
      if (!data.instanceId || !data.qrCode || !data.token) {
        throw new EvoGoError(
          "Invalid response from Evo GO",
          "MALFORMED_RESPONSE",
          500,
        );
      }

      // Log successful creation
      console.log(
        `[Evo GO] Instance created successfully for tenant ${tenantId}`,
        {
          instanceId: data.instanceId,
          timestamp: new Date().toISOString(),
        },
      );

      return data as EvoGoCreateInstanceResponse;
    } catch (error) {
      // Handle timeout
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new EvoGoError(
          "Request timeout (>5s)",
          "TIMEOUT",
          504,
        );

        if (attempt < retryConfig.maxRetries - 1) {
          await delay(retryConfig.delays[attempt]);
          continue;
        }
        throw lastError;
      }

      // Re-throw known errors
      if (error instanceof EvoGoError) {
        lastError = error;
        if (attempt < retryConfig.maxRetries - 1 && error.isRetryable) {
          await delay(retryConfig.delays[attempt]);
          continue;
        }
        throw error;
      }

      // Unknown error
      lastError = new EvoGoError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        "UNKNOWN_ERROR",
        500,
      );

      if (attempt < retryConfig.maxRetries - 1) {
        await delay(retryConfig.delays[attempt]);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new EvoGoError("Failed to create instance", "UNKNOWN_ERROR", 500);
}

/**
 * Custom error class for Evo GO API errors
 */
export class EvoGoError extends Error {
  constructor(
    message: string,
    // eslint-disable-next-line no-unused-vars
    public code: string,
    // eslint-disable-next-line no-unused-vars
    public statusCode: number,
  ) {
    super(message);
    this.name = "EvoGoError";
  }

  get isRetryable(): boolean {
    // Don't retry auth errors
    if (this.code === "INVALID_TOKEN") return false;
    // Retry timeout, rate limit, and server errors
    return ["TIMEOUT", "RATE_LIMIT", "SERVER_ERROR"].includes(this.code);
  }
}

/**
 * Helper to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
