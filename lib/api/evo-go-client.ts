/**
 * Evo GO API Client
 * Handles communication with Evo GO API for WhatsApp instance management
 */

import { randomUUID } from 'crypto';

export interface EvoGoCreateInstanceRequest {
  name: string;
  token: string; // Unique instance token (UUID), NOT the API key
  proxy?: {
    address: string;
    port: string;
    username?: string;
    password?: string;
  };
}

export interface EvoGoCreateInstanceResponse {
  instance_id: string;
  token: string;
  qr_code: string;
  phone?: string;
  status?: "connecting" | "connected" | "failed";
  expires_at?: string; // ISO 8601
}

export interface EvoGoInstance {
  id: string;
  name: string;
  token: string;
  qrcode: string;
  connected: boolean;
  createdAt: string;
}

export interface EvoGoListInstancesResponse {
  data: EvoGoInstance[];
  message: string;
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
    token: randomUUID(), // Generate unique token for this instance (NOT the API key)
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      console.log(`[Evo GO] Attempt ${attempt + 1}/${retryConfig.maxRetries}`);
      console.log(`[Evo GO] Calling: ${EVOGO_API_BASE}/instance/create`);
      console.log(`[Evo GO] Using API Key: ${apiKey.substring(0, 10)}...`);
      console.log(`[Evo GO] Request body:`, JSON.stringify(request, null, 2));

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
            "apikey": apiKey, // Correct header name per Evo GO docs
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
        const errorBody = await response.text();
        console.log(`[Evo GO] Server error response body:`, errorBody);

        lastError = new EvoGoError(
          `Evo GO server error: ${errorBody}`,
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

      // Parse response (Evo GO wraps data in 'data' object)
      const responseData = data.data || data;

      // Validate response structure
      // Note: qrcode may come empty — it's generated asynchronously and sent via webhook
      if (!responseData.id) {
        throw new EvoGoError(
          "Invalid response from Evo GO — missing instance ID",
          "MALFORMED_RESPONSE",
          500,
        );
      }

      // Log successful creation
      console.log(
        `[Evo GO] Instance created successfully for tenant ${tenantId}`,
        {
          instance_id: responseData.id,
          timestamp: new Date().toISOString(),
        },
      );

      // Map response to our interface (convert camelCase to snake_case)
      // Note: qrcode may be empty — it's generated asynchronously via webhook
      return {
        instance_id: responseData.id,
        token: responseData.token,
        qr_code: responseData.qrcode || '', // can be empty initially
      } as EvoGoCreateInstanceResponse;
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
 * List all WhatsApp instances from Evo GO
 */
export async function listEvoGoInstances(): Promise<EvoGoInstance[]> {
  const apiKey = process.env.EVO_GO_API_KEY;

  console.log('[Evo GO] listEvoGoInstances() called');

  if (!apiKey) {
    throw new Error("EVO_GO_API_KEY environment variable is not set");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EVOGO_API_BASE}/instance/all`, {
      method: "GET",
      headers: {
        "apikey": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Evo GO] List instances response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('[Evo GO] List instances error:', errorBody);
      throw new EvoGoError(
        `Failed to list instances: ${errorBody}`,
        "LIST_INSTANCES_ERROR",
        response.status,
      );
    }

    const data = await response.json() as EvoGoListInstancesResponse;
    console.log(`[Evo GO] Found ${data.data?.length || 0} instances`);

    return data.data || [];
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new EvoGoError(
        "Request timeout listing instances (>5s)",
        "TIMEOUT",
        504,
      );
    }

    if (error instanceof EvoGoError) {
      throw error;
    }

    throw new EvoGoError(
      `Unexpected error listing instances: ${error instanceof Error ? error.message : String(error)}`,
      "UNKNOWN_ERROR",
      500,
    );
  }
}

/**
 * Get or create a WhatsApp instance for a tenant
 * Checks if instance already exists by name, reuses it if found
 */
export async function getOrCreateInstance(
  tenantId: string,
): Promise<EvoGoCreateInstanceResponse> {
  const instanceName = `kanban-instance-${tenantId.substring(0, 8)}`;

  console.log('[Evo GO] getOrCreateInstance() called', {
    tenantId,
    instanceName,
    timestamp: new Date().toISOString(),
  });

  try {
    // 1. List existing instances
    const existingInstances = await listEvoGoInstances();
    console.log('[Evo GO] Checking for existing instance with name:', instanceName);

    // 2. Look for instance with matching name
    const existingInstance = existingInstances.find(
      (instance) => instance.name === instanceName,
    );

    if (existingInstance) {
      console.log('[Evo GO] Found existing instance, reusing it', {
        instance_id: existingInstance.id,
        token: existingInstance.token,
        timestamp: new Date().toISOString(),
      });

      return {
        instance_id: existingInstance.id,
        token: existingInstance.token,
        qr_code: existingInstance.qrcode || '',
      };
    }

    // 3. If not found, create new instance
    console.log('[Evo GO] No existing instance found, creating new one');
    return await callEvoGoCreateInstance(tenantId);
  } catch (error) {
    console.error('[Evo GO] getOrCreateInstance error:', {
      tenantId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Connect/start a WhatsApp instance (initialize session)
 * Must use the instance-specific token, not the global API key
 */
export async function callEvoGoConnect(
  instanceToken: string,
  webhookUrl?: string,
): Promise<void> {
  console.log('[Evo GO] callEvoGoConnect() called', {
    instanceToken: instanceToken.substring(0, 10) + '...',
    webhookUrl: webhookUrl ? '✓' : '✗',
    timestamp: new Date().toISOString(),
  });

  if (!instanceToken) {
    throw new EvoGoError(
      "Instance token is required for connect",
      "MISSING_INSTANCE_TOKEN",
      400,
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const body: Record<string, unknown> = {
      immediate: true,
      subscribe: ['QRCODE', 'CONNECTION', 'MESSAGE'],
    };

    if (webhookUrl) {
      body.webhookUrl = webhookUrl;
    }

    const response = await fetch(`${EVOGO_API_BASE}/instance/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": instanceToken, // Use instance token, not global API key
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Evo GO] Connect response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('[Evo GO] Connect error:', errorBody);
      throw new EvoGoError(
        `Failed to connect instance: ${errorBody}`,
        "CONNECT_ERROR",
        response.status,
      );
    }

    console.log('[Evo GO] Instance connected successfully');
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new EvoGoError(
        "Connect request timeout (>5s)",
        "TIMEOUT",
        504,
      );
    }

    if (error instanceof EvoGoError) {
      throw error;
    }

    throw new EvoGoError(
      `Unexpected error connecting instance: ${error instanceof Error ? error.message : String(error)}`,
      "UNKNOWN_ERROR",
      500,
    );
  }
}

/**
 * Get QR code from an instance
 * Must use the instance-specific token
 */
export async function getEvoGoQRCode(
  instanceToken: string,
): Promise<{ qr_code: string; code: string }> {
  console.log('[Evo GO] getEvoGoQRCode() called');

  if (!instanceToken) {
    throw new EvoGoError(
      "Instance token is required for QR code",
      "MISSING_INSTANCE_TOKEN",
      400,
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EVOGO_API_BASE}/instance/qr`, {
      method: "GET",
      headers: {
        "apikey": instanceToken, // Use instance token, not global API key
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Evo GO] QR code response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new EvoGoError(
        `Failed to get QR code: ${errorBody}`,
        "QR_CODE_ERROR",
        response.status,
      );
    }

    const data = await response.json();
    const qrData = data.data || {};

    // Note: Evo GO returns "Qrcode" with uppercase Q
    const qrCode = (qrData.Qrcode || qrData.qrcode) as string;
    const code = (qrData.Code || qrData.code) as string;

    if (!qrCode) {
      console.log('[Evo GO] QR code is empty (not yet generated)');
      return { qr_code: '', code: '' };
    }

    console.log('[Evo GO] QR code retrieved successfully', {
      qrCodeLength: qrCode.length,
      timestamp: new Date().toISOString(),
    });

    return {
      qr_code: qrCode,
      code: code || '',
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new EvoGoError(
        "QR code request timeout (>5s)",
        "TIMEOUT",
        504,
      );
    }

    if (error instanceof EvoGoError) {
      throw error;
    }

    throw new EvoGoError(
      `Unexpected error getting QR code: ${error instanceof Error ? error.message : String(error)}`,
      "UNKNOWN_ERROR",
      500,
    );
  }
}

/**
 * Get status of a WhatsApp instance
 * Must use the instance-specific token
 */
export async function getEvoGoStatus(
  instanceToken: string,
): Promise<{ connected: boolean; logged_in: boolean; name?: string }> {
  console.log('[Evo GO] getEvoGoStatus() called');

  if (!instanceToken) {
    throw new EvoGoError(
      "Instance token is required for status",
      "MISSING_INSTANCE_TOKEN",
      400,
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EVOGO_API_BASE}/instance/status`, {
      method: "GET",
      headers: {
        "apikey": instanceToken, // Use instance token, not global API key
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[Evo GO] Status response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new EvoGoError(
        `Failed to get instance status: ${errorBody}`,
        "STATUS_ERROR",
        response.status,
      );
    }

    const data = await response.json();
    const statusData = data.data || {};

    // Note: Evo GO returns "Connected" with uppercase C
    const connected = (statusData.Connected || statusData.connected) as boolean;
    const loggedIn = (statusData.LoggedIn || statusData.logged_in) as boolean;
    const name = (statusData.Name || statusData.name) as string | undefined;

    console.log('[Evo GO] Status retrieved', {
      connected,
      logged_in: loggedIn,
      timestamp: new Date().toISOString(),
    });

    return {
      connected: connected || false,
      logged_in: loggedIn || false,
      name,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new EvoGoError(
        "Status request timeout (>5s)",
        "TIMEOUT",
        504,
      );
    }

    if (error instanceof EvoGoError) {
      throw error;
    }

    throw new EvoGoError(
      `Unexpected error getting status: ${error instanceof Error ? error.message : String(error)}`,
      "UNKNOWN_ERROR",
      500,
    );
  }
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
