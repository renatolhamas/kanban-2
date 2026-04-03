# QA Fix Request — Story 1.2: RLS Security & Multi-Tenant Login Fix

**From:** Dara (Data Engineer)  
**To:** @dev (Implementation)  
**Story:** 1.2 - Supabase Auth Integration  
**Gate Status:** CONCERNS → BLOCKING  
**Date:** 2026-04-02

---

## 🔴 **CRITICAL ISSUE: Multi-Tenant RLS Policy Bypassed in Login Flow**

### Symptom
- ✅ User can register and login immediately (JWT cached in cookie)
- ❌ User CANNOT login after closing browser/clearing cookies
- ❌ Returns generic "Invalid email or password" error
- ⚠️ Permissions not enforced correctly across tenants

### Root Cause

**The login endpoint (`app/api/auth/login/route.ts`) has a critical security flaw:**

#### Current Broken Flow:

```
1. POST /api/auth/login { email, password }
   ↓
2. ✅ supabase.auth.signInWithPassword(email, password)
   → Authenticates with Supabase Auth ✅
   → Returns: authData.user with userId
   ↓
3. ❌ supabase.from("users").select("tenant_id, role").eq("id", userId)
   → Uses supabaseAnonKey (line 14)
   → No JWT in authorization header
   → RLS Policy evaluates: auth.jwt()['tenant_id'] == NULL
   → Query BLOCKED by RLS policy ❌
   → Function returns "Invalid email or password"
   ↓
4. ❌ User cannot login (even with correct credentials)
```

#### Why This Happens:

The RLS policy on `public.users` table is:

```sql
-- PERMISSIVE policy "users_select_own_tenant"
SELECT (tenant_id)::text = (auth.jwt() ->> 'tenant_id'::text)
```

When the server makes a query with `supabaseAnonKey` WITHOUT including the user's JWT in the Authorization header:
- `auth.jwt()` returns `NULL` in the RLS context
- `NULL != tenant_id` evaluates to `FALSE`
- Query is blocked ❌

#### Why It Works on First Login (After Registration):

After registration, user gets JWT in httpOnly cookie. Browser automatically includes cookie → Authorization header has user's JWT → RLS allows query. But once cookie expires or is cleared, the cycle breaks.

---

## 🔧 **Technical Implementation Details**

### The Correct Security Pattern:

**Use the user's JWT (from auth.signInWithPassword) to query their own data — NOT server credentials.**

```typescript
// ✅ CORRECT: Use user's JWT, not server role
export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase credentials");
    }

    // ✅ Use anonKey for client operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 1: Authenticate user with Supabase Auth
    const { data: authData, error: authError } = 
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user || !authData.session) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const accessToken = authData.session.access_token; // ✅ EXTRACT USER'S JWT

    // ✅ Step 2: Create a Supabase client with USER's JWT in Authorization header
    //    This allows RLS policies to evaluate auth.jwt() correctly
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}` // ✅ USER'S JWT, not server credentials
        }
      }
    });

    // Step 3: Query user's own tenant_id and role using THEIR JWT
    //         RLS policy now evaluates: auth.jwt()['tenant_id'] == user.tenant_id ✅
    const { data: userData, error: userError } = await userSupabase
      .from("users")
      .select("tenant_id, role")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const { tenant_id, role } = userData;

    // ✅ Step 4: Generate application JWT (custom JWT for your app)
    const token = await generateJWT({
      sub: userId,
      tenant_id: tenant_id,
      email,
      role: role as "owner" | "admin" | "member"
    });

    // Step 5: Return JWT in httpOnly cookie
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === "production";
    response.headers.set("Set-Cookie", setJWTCookie(token, isProduction));

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
```

---

## 🛡️ **Security Architecture (After Fix)**

### Query Flow with Proper RLS Enforcement:

```
Client Browser                    Server                        Supabase
    |                               |                              |
    |--- POST /api/auth/login ----->|                              |
    |                               |                              |
    |                        1. signInWithPassword()               |
    |                               |------ auth.signIn() -------->|
    |                               |<---- user + JWT ------------|
    |                               |                              |
    |                        2. Extract user's accessToken        |
    |                        3. Create Supabase client with       |
    |                           Authorization: Bearer <JWT>       |
    |                               |                              |
    |                        4. Query users table                 |
    |                        (with Bearer token in header)        |
    |                               |--- SELECT ... ------>|       |
    |                               |                      |       |
    |                               |   RLS Policy Check:  |       |
    |                               |   auth.jwt() = ?     |       |
    |                               |   tenant_id = ?      |       |
    |                               |   auth.jwt()['tenant_id']    |
    |                               |   == users.tenant_id? ✅     |
    |                               |                      |       |
    |                               |<---- user data ------|       |
    |                               |                              |
    |                        5. Generate app JWT                  |
    |                        6. Set-Cookie response               |
    |<----- JWT in httpOnly cookie ---|
    |                               |                              |
```

### Security Guarantees:

| Guarantee | How It's Enforced |
|-----------|------------------|
| **User can only access their own tenant** | RLS policy verifies `auth.jwt()['tenant_id']` == user.tenant_id |
| **No cross-tenant data leakage** | User's JWT from Supabase Auth contains their actual tenant_id |
| **Login always validates permissions** | Query uses user's JWT, not bypassed with service role |
| **Multi-tenant isolation** | Each query carries user's JWT with their tenant context |

---

## 📝 **Detailed Changes Required**

### File: `app/api/auth/login/route.ts`

**Lines to change:**

| Line | Current | Issue | New |
|------|---------|-------|-----|
| 3-4 | Imports missing | Need to import `generateJWT` from lib/jwt | Add `import { generateJWT } from "@/lib/jwt";` |
| 14 | `const supabase = createClient(supabaseUrl, supabaseAnonKey);` | Static client, no user JWT | Keep as is (this is correct) |
| 39-43 | Auth works ✅ | — | No change |
| 54 | `const userId = authData.user.id;` | Extract userId | **ADD:** `const accessToken = authData.session?.access_token;` |
| 56-69 | Query with anonKey ❌ | **This is the bug** | **Replace entire block with corrected code above** |

**Key Fix:**
```typescript
// ❌ BEFORE (Line 54-69)
const userId = authData.user.id;

const { data: userData, error: userError } = await supabase
  .from("users")
  .select("tenant_id, role")
  .eq("id", userId)
  .single();

// ✅ AFTER
const userId = authData.user.id;
const accessToken = authData.session?.access_token;

if (!accessToken) {
  return NextResponse.json(
    { success: false, error: "Session token missing" },
    { status: 401 }
  );
}

const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }
});

const { data: userData, error: userError } = await userSupabase
  .from("users")
  .select("tenant_id, role")
  .eq("id", userId)
  .single();
```

---

## ✅ **Verification Checklist**

- [ ] User can register with new email ✅
- [ ] User is logged in immediately after registration ✅
- [ ] User can logout and clear cookies
- [ ] User can login again with same email + password ✅ (THIS WAS FAILING)
- [ ] User cannot login with wrong password ✅
- [ ] User cannot access another tenant's data ✅
- [ ] RLS policy is enforced on every query ✅
- [ ] No service role key is used in client-facing APIs ✅
- [ ] Authorization header contains user's JWT ✅
- [ ] Multi-tenant isolation verified in database logs

---

## 🔒 **Security Validation**

### Before Fix (Vulnerable):
```
User A logs in → Query to public.users FAILS (RLS blocks) → "Invalid password"
```

### After Fix (Secure):
```
User A logs in → Query includes User A's JWT → RLS allows → Gets User A's tenant_id
User A cannot see User B's data → RLS blocks cross-tenant queries → Secure ✅
```

---

## 📚 **Related Architecture Documentation**

- **RLS Policy Definition:** `supabase/migrations/` (check for users table RLS)
- **JWT Structure:** `lib/jwt.ts` — defines payload structure with `tenant_id`
- **Auth Flow:** `lib/auth.ts` — JWT cookie management
- **Type Definitions:** `lib/types.ts` — LoginRequest, AuthResponse, JWTPayload

---

## 🎯 **Success Criteria**

After implementation, the system will have:

1. ✅ **True Multi-Tenant Security**: Users can only access their own tenant via RLS
2. ✅ **Stateless Authentication**: JWT contains all needed context (userId, tenantId, role)
3. ✅ **No Credential Leakage**: Service role key never used in client paths
4. ✅ **Persistent Sessions**: Users can close browser and login again successfully
5. ✅ **Audit Trail**: Every query carries user's JWT for logging/debugging

---

## 📖 **QA Re-Review Process**

1. @dev implements fix using code changes above
2. @dev runs: `npm test` (verify login tests pass)
3. @dev tests manually:
   - Register new user
   - Logout and close browser
   - Login with same credentials ← **This should now work**
   - Verify tenant_id is correct in JWT
4. @dev notifies @qa with commit hash
5. @qa re-runs `*gate story-1.2` with verification checklist
6. @qa updates gate verdict (should be PASS)

---

## 📁 **References**

- **Gate Report:** docs/qa/gates/1.2-supabase-auth.yml
- **Story:** docs/stories/1.2.story.md
- **Constitution Article IV (No Invention):** All changes follow Supabase auth best practices

---

**Status:** 🔴 BLOCKING — Implementation required before deployment  
**Priority:** 🔴 CRITICAL — Multi-tenant security issue  
**Severity:** 🔴 CRITICAL — Users cannot login after session expires

