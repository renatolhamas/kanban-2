/**
 * JWT Generator for RLS Testing
 *
 * Generates test JWTs with tenant_id and sub claims
 * for simulating authenticated requests in RLS tests
 *
 * These are MOCK JWTs for testing only.
 * In production, Supabase validates JWT signatures.
 */

import { SignJWT } from 'jose';
import { TEST_USERS, TEST_TENANTS } from './rls-test-data';

// Mock signing key (for testing only - NOT SECURE)
const SECRET_KEY = new TextEncoder().encode('test-secret-key-for-rls-validation-only');

// ============================================================================
// JWT Token Interfaces
// ============================================================================

export interface TestJWTPayload {
  sub: string; // User ID
  tenant_id: string; // Tenant ID
  email: string;
  iat: number;
  exp: number;
}

export interface ForgedJWTPayload {
  sub: string;
  tenant_id: string;
  email: string;
  // Missing/invalid signature in real scenario
}

// ============================================================================
// Valid JWT Generation (for authenticated tests)
// ============================================================================

/**
 * Generate valid JWT for a test user
 *
 * Usage:
 * ```
 * const token = await generateValidJWT(TEST_USERS.A1);
 * const supabase = createClient(url, key, {
 *   auth: { persistSession: false }
 * });
 * const { data, error } = await supabase
 *   .from('kanbans')
 *   .select()
 *   .setAuth(token);
 * ```
 */
export async function generateValidJWT(
  user: typeof TEST_USERS.A1
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload: TestJWTPayload = {
    sub: user.id,
    tenant_id: user.tenant_id,
    email: user.email,
    iat: now,
    exp: now + 60 * 60, // 1 hour expiry
  };

  // Note: This creates a mock JWT structure.
  // In actual tests, use Supabase's own JWT generation or mock the auth context
  return createMockJWT(payload);
}

/**
 * Generate forged JWT with different tenant_id
 * (Simulates attempt to impersonate another tenant)
 *
 * Real Supabase would reject this due to signature validation,
 * but this tests the structure
 */
export async function generateForgedJWT(
  user: typeof TEST_USERS.A1,
  forgedTenantId: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload: ForgedJWTPayload = {
    sub: user.id,
    tenant_id: forgedTenantId, // Forged claim
    email: user.email,
  };

  return createMockJWT(payload);
}

/**
 * Generate JWT with missing tenant_id claim
 * (Simulates unauthenticated or malformed token)
 */
export async function generateMalformedJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    sub: TEST_USERS.A1.id,
    // Missing tenant_id
    iat: now,
    exp: now + 60 * 60,
  };

  return createMockJWT(payload);
}

// ============================================================================
// Mock JWT Creation (for testing without real Supabase)
// ============================================================================

/**
 * Create mock JWT structure
 *
 * Format: header.payload.signature
 * For testing RLS policies that depend on JWT claims,
 * not signature validation
 */
function createMockJWT(payload: any): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Mock signature (not verified in these tests)
  const mockSignature = 'mock_signature_not_validated_in_tests';

  return `${headerB64}.${payloadB64}.${mockSignature}`;
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
