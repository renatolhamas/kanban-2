/**
 * JWT Generator for RLS Testing
 *
 * Generates test JWTs using Supabase Admin API
 * This ensures JWTs are properly signed with ES256 (P-256 ECC)
 * matching Supabase's actual key configuration
 */

import { createClient } from '@supabase/supabase-js';
import { TEST_USERS, TEST_TENANTS } from './rls-test-data';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy-initialized admin client (only created when needed)
let adminClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (!adminClient) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return adminClient;
}

// ============================================================================
// Supabase JWT Token Structure (for reference)
// ============================================================================

export interface SupabaseJWTPayload {
  sub: string; // User ID (from auth.users.id)
  aud: string; // Audience (typically 'authenticated')
  role: string; // User role (from auth.users.role)
  iat: number; // Issued at
  exp: number; // Expires
  email: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  user_metadata?: {
    tenant_id?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// Valid JWT Generation (for authenticated tests)
// ============================================================================

/**
 * Generate valid JWT for a test user
 *
 * Uses Supabase Admin API to create/get auth user and issue JWT
 * This ensures proper ES256 (P-256 ECC) signing
 *
 * Usage:
 * ```
 * const token = await generateValidJWT(TEST_USERS.A1);
 * const supabase = createClient(url, key, {
 *   auth: { persistSession: false },
 *   global: {
 *     headers: {
 *       Authorization: `Bearer ${token}`,
 *     },
 *   },
 * });
 * const { data, error } = await supabase.from('kanbans').select();
 * ```
 */
export async function generateValidJWT(
  user: typeof TEST_USERS.A1
): Promise<string> {
  try {
    const PASSWORD = 'TestPassword123!';

    // Try to create auth user via admin API
    const { data: createData, error: createError } = await getAdminClient().auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      user_metadata: {
        tenant_id: user.tenant_id,
      },
      email_confirm: true, // Auto-confirm for testing
    });

    // Ignore "already exists" errors - user may exist from previous runs
    if (createError && createError.code !== 'email_exists') {
      throw createError;
    }

    // Create anon client to sign in and get session
    if (!SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY environment variable is required');
    }
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    // Sign in with password to get valid JWT
    const { data: sessionData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: user.email,
      password: PASSWORD,
    });

    if (signInError) {
      throw signInError;
    }

    if (!sessionData.session?.access_token) {
      throw new Error('No access token in session');
    }

    return sessionData.session.access_token;
  } catch (error) {
    console.error('Failed to generate JWT:', error);
    throw error;
  }
}

/**
 * Generate forged JWT with different tenant_id
 * (Simulates attempt to impersonate another tenant)
 *
 * For this test case, we return a syntactically valid but unsigned token
 * that Supabase will reject due to signature validation
 */
export async function generateForgedJWT(
  user: typeof TEST_USERS.A1,
  forgedTenantId: string
): Promise<string> {
  // Get a valid token first (properly signed)
  const validToken = await generateValidJWT(user);

  // Decode and modify the payload (will fail signature verification)
  // For testing purposes, we create a token with wrong tenant_id
  // that looks valid but isn't actually signed correctly
  const parts = validToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }

  // This is a synthetic token that WILL fail validation
  // Supabase will reject it due to signature mismatch
  return `${parts[0]}.eyJzdWIiOiIke3VzZXIuaWR9IiwidGVuYW50X2lkIjoiJHtmb3JnZWRUZW5hbnRJZH0iLCJlbWFpbCI6IiR7dXNlci5lbWFpbH0ifQ.${parts[2]}`;
}

/**
 * Generate JWT with missing tenant_id claim
 * (Simulates unauthenticated or malformed token)
 */
export async function generateMalformedJWT(): Promise<string> {
  // Create a basic token but with malformed/incomplete payload
  // This will fail RLS checks when accessed without tenant_id claim
  const validToken = await generateValidJWT(TEST_USERS.A1);
  const parts = validToken.split('.');

  // Create a payload without tenant_id (will fail RLS)
  const malformedPayload = Buffer.from(
    JSON.stringify({
      sub: TEST_USERS.A1.id,
      // Missing tenant_id - RLS will deny access
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64url');

  // Return token with modified payload but original signature
  // (will fail signature validation but tests payload validation)
  return `${parts[0]}.${malformedPayload}.${parts[2]}`;
}

// ============================================================================
// Auth Context Helpers (for Supabase client setup)
// ============================================================================

/**
 * Create Supabase client with specific user context
 *
 * Usage:
 * ```
 * const supabase = createSupabaseClientForUser(url, key, TEST_USERS.A1);
 * const { data } = await supabase.from('kanbans').select();
 * // Sees only Tenant A kanbans due to RLS
 * ```
 */
export function createAuthContextForUser(user: typeof TEST_USERS.A1) {
  return {
    jwt: async () => generateValidJWT(user),
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        tenant_id: user.tenant_id,
      },
    },
  };
}

// ============================================================================
// Test Scenarios
// ============================================================================

export const TestScenarios = {
  /**
   * Scenario 1: User A (Tenant A) authentication
   * Expected: Should see only Tenant A data
   */
  userATenantA: async () => ({
    user: TEST_USERS.A1,
    jwt: await generateValidJWT(TEST_USERS.A1),
    expectedTenant: TEST_TENANTS.A.id,
    description: 'User A authenticated as Tenant A member',
  }),

  /**
   * Scenario 2: User B (Tenant B) authentication
   * Expected: Should see only Tenant B data
   */
  userBTenantB: async () => ({
    user: TEST_USERS.B1,
    jwt: await generateValidJWT(TEST_USERS.B1),
    expectedTenant: TEST_TENANTS.B.id,
    description: 'User B authenticated as Tenant B member',
  }),

  /**
   * Scenario 3: Forged JWT (User A trying to access Tenant B)
   * Expected: Supabase signature validation should reject
   */
  forgedJWTTenantB: async () => ({
    user: TEST_USERS.A1,
    jwt: await generateForgedJWT(TEST_USERS.A1, TEST_TENANTS.B.id),
    expectedTenant: TEST_TENANTS.B.id,
    description: 'Forged JWT: User A claiming Tenant B access',
    expectedOutcome: 'REJECTED_BY_SUPABASE_SIGNATURE_VALIDATION',
  }),

  /**
   * Scenario 4: Malformed JWT (missing tenant_id)
   * Expected: RLS policies should return 0 rows
   */
  malformedJWT: async () => ({
    user: TEST_USERS.A1,
    jwt: await generateMalformedJWT(),
    description: 'Malformed JWT: missing tenant_id claim',
    expectedOutcome: 'RLS_BLOCKS_QUERY_NO_ROWS',
  }),

  /**
   * Scenario 5: No authentication (no JWT)
   * Expected: RLS policies should return 0 rows
   */
  noAuthentication: () => ({
    user: null,
    jwt: null,
    description: 'Unauthenticated request (no JWT)',
    expectedOutcome: 'RLS_BLOCKS_QUERY_NO_ROWS',
  }),
};

// ============================================================================
// Debug/Logging Helpers
// ============================================================================

/**
 * Decode and display JWT claims (for debugging)
 */
export function decodeJWTClaims(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payloadB64 = parts[1];
  const payload = JSON.parse(
    Buffer.from(payloadB64, 'base64url').toString('utf-8')
  );

  return payload;
}

/**
 * Log JWT claims for test debugging
 */
export function logJWTClaims(token: string, label?: string): void {
  const claims = decodeJWTClaims(token);
  console.log(`\n${label || 'JWT Claims'}:`, JSON.stringify(claims, null, 2));
}
