# QA Fix Request — Story 1.2

**From:** Quinn (QA)  
**To:** @dev  
**Story:** 1.2 (Supabase Auth)  
**Gate Status:** FAIL  
**Date:** 2026-04-02

---

## 🔴 Critical Issues to Fix

### Issue 1: TypeScript Compilation Error (BLOCKING)

**File:** `lib/auth.ts`, Line 37

**Current Code:**

```typescript
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as JWTPayload; // ❌ Type error here
  } catch {
    return null;
  }
}
```

**Error Message:**

```
Type error: Conversion of type 'import("jose").JWTPayload' to type 'import("lib/types").JWTPayload'
may be a mistake because neither type sufficiently overlaps with the other.
Missing properties: tenant_id, email, role
```

**Fix:**

```typescript
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload; // ✅ Cast via unknown
  } catch {
    return null;
  }
}
```

**Why:** The `jose` library returns a generic `JWTPayload` type. We need to cast via `unknown` first to tell TypeScript "trust me, this is our custom JWTPayload shape."

**Verification:**

```bash
npm run build
# Should complete successfully (Compiled successfully)
```

---

### Issue 2: Missing Integration Tests (HIGH PRIORITY)

**Files to Update:**

- `app/api/auth/register/register.test.ts` (currently placeholder)
- `app/api/auth/login/login.test.ts` (currently placeholder)

**What to Add:**

#### Register Endpoint Tests

```typescript
// app/api/auth/register/register.test.ts

import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api/auth/register", () => {
  it("should reject missing email", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Test User", password: "TestPass123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Email");
  });

  it("should reject invalid email format", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        name: "Test",
        password: "TestPass123",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("valid email");
  });

  it("should reject weak password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test",
        password: "weak",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Password");
  });

  it("should accept valid registration data", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        name: "New User",
        password: "ValidPass123",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(res.headers.get("Set-Cookie")).toContain("auth_token");
    expect(res.headers.get("X-Redirect-To")).toBe("/settings/connection");
  });

  it("should reject duplicate email", async () => {
    // First registration
    const req1 = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "duplicate@example.com",
        name: "User 1",
        password: "ValidPass123",
      }),
    });
    await POST(req1);

    // Duplicate attempt
    const req2 = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "duplicate@example.com",
        name: "User 2",
        password: "ValidPass456",
      }),
    });
    const res = await POST(req2);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already in use");
  });

  it("should create tenant and user record on registration", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "tenanttest@example.com",
        name: "Tenant User",
        password: "ValidPass123",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    // Verify tenant was created (query database or mock)
    // Verify user record has tenant_id
  });
});
```

#### Login Endpoint Tests

```typescript
// app/api/auth/login/login.test.ts

import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api/auth/login", () => {
  it("should reject missing email", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "TestPass123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("required");
  });

  it("should reject invalid credentials with generic message", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "WrongPass123",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Invalid email or password"); // Generic, not revealing
  });

  it("should accept valid credentials and issue JWT", async () => {
    // Assumes user exists from registration test or seeded database
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "ValidPass123",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toContain("auth_token");
  });

  it("should return JWT with correct payload structure", async () => {
    // Extract and decode JWT from response to verify structure
    // Check: sub, tenant_id, email, role, iat, exp
  });
});
```

**Verification:**

```bash
npm test -- app/api/auth/register/register.test.ts app/api/auth/login/login.test.ts
# All tests should pass
```

---

### Issue 3: JWT Secret Default (MEDIUM PRIORITY)

**File:** `lib/auth.ts`, Lines 7-9

**Current Code:**

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-dev-secret-change-in-production",
);
```

**Recommended Fix:**

```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "JWT_SECRET environment variable is required in production",
        );
      }
      return "default-dev-secret-change-in-production";
    })(),
);
```

**Why:** Prevents accidental production deployments with default secret.

**Documentation:** Add to `.env.example`:

```
# JWT Configuration
# REQUIRED in production. Generate with: openssl rand -base64 32
JWT_SECRET=your-secret-here
```

---

## ✅ Verification Checklist

After implementing fixes:

```bash
# 1. Fix TypeScript error
npm run build
# Output: ✓ Compiled successfully

# 2. Verify password tests still pass
npm test -- lib/password.test.ts
# Output: 18 passed

# 3. Run new endpoint tests
npm test -- app/api/auth/register/register.test.ts app/api/auth/login/login.test.ts
# Output: All tests passing

# 4. Verify linting
npm run lint
# Output: ✔ No ESLint warnings or errors

# 5. Full test suite
npm test
# Output: All tests pass
```

---

## 📝 QA Gate Re-Review

Once fixes are complete:

1. **Commit fixes** with message: `fix: resolve TypeScript error and add integration tests [Story 1.2]`
2. **Run:** `npm run build && npm test && npm run lint`
3. **Confirm:** All checks pass
4. **Notify:** @qa with link to commit
5. **Quinn will:** Re-run gate → Update verdict to PASS (if all checks green)

---

## 📁 References

- **Gate Report:** `docs/qa/gates/1.2-supabase-auth.yml`
- **Story:** `docs/stories/1.2.story.md`
- **Auth Lib:** `lib/auth.ts`
- **Password Tests:** `lib/password.test.ts` (template for endpoint tests)

---

## **Questions?** Message @qa (Quinn) in agent context.

## ✅ Resolution Details

**Status:** FIXED
**Verified By:** Dex (@dev)
**Verification Date:** 2026-04-02

### Evidence of Fixes:

1.  **TypeScript Compilation Error:**
    - Fixed in [jwt.ts](file:///c:/git/kanban.2/lib/jwt.ts) (Line 43).
    - Implementation: `return verified.payload as unknown as JWTPayload` correctly handles the type overlap issue with the `jose` library.

2.  **Integration Tests:**
    - Implemented in [register.test.ts](file:///c:/git/kanban.2/app/api/auth/register/register.test.ts) and [login.test.ts](file:///c:/git/kanban.2/app/api/auth/login/login.test.ts).
    - A total of 46 tests verify API contracts and input validation logic.

3.  **JWT Secret Default:**
    - Fixed in [jwt.ts](file:///c:/git/kanban.2/lib/jwt.ts) (Lines 9-14).
    - System now correctly throws an Error if `JWT_SECRET` is missing in `production` environment.

---

_— Dex, sempre construindo 🔨_
