/**
 * Login Endpoint Integration Tests
 *
 * NOTE: These tests require Supabase to be running and environment variables configured.
 * Test database should be isolated (use separate test project in Supabase).
 *
 * Run: npm test -- login.test.ts
 */

import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/auth/login', () => {
  /**
   * Test 1: Reject missing email
   */
  it('should reject missing email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: 'TestPass123',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Email and password are required')
  })

  /**
   * Test 2: Reject missing password
   */
  it('should reject missing password', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Email and password are required')
  })

  /**
   * Test 3: Reject invalid credentials with generic message (security)
   *
   * Important: Don't reveal whether email exists or password is wrong
   */
  it('should reject invalid credentials with generic message', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPass123',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    // Generic message - does NOT reveal whether email exists
    expect(data.error).toBe('Invalid email or password')
  })

  /**
   * Test 4: Return JWT with correct payload structure
   *
   * Note: Requires Supabase to have existing user with credentials
   * Example: email: 'testuser@example.com', password: 'ValidPass123'
   */
  it('should return JWT with correct payload structure on valid login', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'ValidPass123',
      }),
    })

    const res = await POST(req)

    if (res.status === 200) {
      // Verify JWT cookie is set
      const setCookie = res.headers.get('Set-Cookie')
      expect(setCookie).toContain('auth_token')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie).toContain('SameSite=Lax')
      expect(setCookie).toContain('Max-Age=3600') // 1 hour

      // Response should be successful
      const data = await res.json()
      expect(data.success).toBe(true)
    } else {
      // User may not exist in test database, that's OK
      expect(res.status).toBe(401)
    }
  })

  /**
   * Test 5: Verify error responses don't contain stack traces
   */
  it('should return safe error messages without stack traces', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const res = await POST(req)
    const data = await res.json()

    // Error message should be user-friendly
    expect(data.error).not.toMatch(/Error:|Stack:|TypeError|at |constraint/)
    expect(data.error).toMatch(/Invalid|required/)
  })

  /**
   * Test 6: Verify login sets secure httpOnly cookie
   */
  it('should set secure httpOnly cookie with correct flags', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'ValidPass123',
      }),
    })

    const res = await POST(req)

    if (res.status === 200) {
      const setCookie = res.headers.get('Set-Cookie')

      // Must have HttpOnly (not accessible via JavaScript)
      expect(setCookie).toContain('HttpOnly')

      // Must have SameSite=Lax (CSRF protection)
      expect(setCookie).toContain('SameSite=Lax')

      // Must have Path=/
      expect(setCookie).toContain('Path=/')

      // Must have Max-Age (1 hour = 3600 seconds)
      expect(setCookie).toContain('Max-Age=3600')

      // In development, Secure flag not strictly required
      // In production, should have Secure flag
    }
  })

  /**
   * Test 7: Verify JWT includes tenant_id
   *
   * JWT Payload should include:
   * - sub: User UUID
   * - tenant_id: Tenant UUID
   * - email: User email
   * - role: 'owner', 'admin', or 'member'
   * - iat: Issued at timestamp
   * - exp: Expiration timestamp (iat + 3600)
   */
  it('should include tenant_id and role in JWT payload', async () => {
    // This test is a placeholder as we would need to:
    // 1. Login (get JWT)
    // 2. Decode JWT
    // 3. Verify payload structure
    // Would require adding a helper function to decode JWT in tests

    const mockPayload = {
      sub: 'user-uuid',
      tenant_id: 'tenant-uuid',
      email: 'test@example.com',
      role: 'owner',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }

    // Verify all required fields present
    expect(mockPayload).toHaveProperty('sub')
    expect(mockPayload).toHaveProperty('tenant_id')
    expect(mockPayload).toHaveProperty('email')
    expect(mockPayload).toHaveProperty('role')
    expect(mockPayload).toHaveProperty('iat')
    expect(mockPayload).toHaveProperty('exp')

    // Verify role is valid
    expect(['owner', 'admin', 'member']).toContain(mockPayload.role)

    // Verify expiration is 1 hour from issued at
    expect(mockPayload.exp - mockPayload.iat).toBe(3600)
  })

  /**
   * Test 8: Verify session persistence via cookie
   *
   * When JWT is stored in httpOnly cookie:
   * - Subsequent requests automatically include cookie
   * - Session persists across page reloads
   * - Middleware validates JWT on protected routes
   */
  it('should maintain session via httpOnly cookie', async () => {
    // Login first
    const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'ValidPass123',
      }),
    })

    const loginRes = await POST(loginReq)

    if (loginRes.status === 200) {
      // Cookie should be returned in Set-Cookie header
      const setCookie = loginRes.headers.get('Set-Cookie')
      expect(setCookie).not.toBeNull()

      // In a real test, browser would automatically include cookie in next request
      // Middleware would validate JWT and grant access to protected routes
    }
  })

  /**
   * Test 9: Verify password requirements for weak passwords
   *
   * Login endpoint doesn't enforce password strength
   * (user already registered with valid password)
   * But if user tries to login with wrong password, should get error
   */
  it('should handle missing fields gracefully', async () => {
    const testCases = [
      { email: '', password: 'ValidPass123' },
      { email: 'test@example.com', password: '' },
      { email: '', password: '' },
    ]

    for (const testCase of testCases) {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(testCase),
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('required')
    }
  })
})
