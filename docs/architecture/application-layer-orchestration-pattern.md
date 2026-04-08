# Application-Layer Orchestration Pattern

**Version:** 1.0  
**Status:** Active (Project Standard)  
**Last Updated:** 2026-04-07  
**Owner:** Product & Architecture Team

---

## Overview

Synkra AIOX uses **application-layer orchestration exclusively** for multi-step operations that involve database mutations, external API calls, and state management. This pattern replaces PostgreSQL Triggers, Edge Functions, and stored procedures as the canonical approach for automation.

**Why?** Simplicity, testability, debuggability, and consistency across the codebase.

---

## Core Principle

> **All orchestration happens in Node.js/TypeScript application code, never in the database layer.**

### What This Means

| What | Where | Why |
|------|-------|-----|
| **Multi-step workflows** | Node.js (API routes, Edge Runtime) | Full control, testable, debuggable |
| **Data validation** | Node.js application code | Business logic lives in app, not DB |
| **Error handling & rollback** | Node.js transaction management | Explicit, auditable, easy to trace |
| **External API calls** | Node.js (webhooks, integrations) | No network calls from DB |
| **State management** | Database tables + Node.js logic | Single source of truth in DB, compute in app |

### What NOT To Do

| ❌ DON'T | ❌ Why Not | ✅ Alternative |
|----------|-----------|-----------------|
| Create PostgreSQL triggers for auto-creation | Hidden logic, hard to debug, SQL-only testing | Implement in Node.js route handler |
| Use Supabase Edge Functions for DB mutations | Adds another layer, slow iteration, separate testing | Use Next.js API route with Supabase client |
| Store procedures for complex business logic | Version control issues, hard to test, SQL expertise required | TypeScript in application code |
| Database-driven automation (events, webhooks) | Coupling DB to business logic, poor observability | Application handles webhooks, decides DB mutations |

---

## Canonical Pattern: `app/api/auth/register/route.ts`

This file is the **model implementation** for application-layer orchestration.

### Structure (Multi-Step Pattern)

```typescript
// File: app/api/auth/register/route.ts
// Reference: Lines 146-210 (STEP 4-5 example)

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize client
    const supabase = createClient(url, key);
    
    // STEP 1: Validate input
    const { email, name, password } = await request.json();
    if (!email || !name || !password) return error(400);
    
    // STEP 2: Rate limit (prevent abuse)
    const ipLimit = checkIPLimit(clientIP);
    if (!ipLimit.allowed) return error(429);
    
    // STEP 3: Create auth user (external call to Supabase Auth)
    const { data: authData } = await supabase.auth.admin.createUser({
      email,
      password,
    });
    if (!authData?.user) return error(500);
    
    const userId = authData.user.id;
    
    // STEP 4: Create tenant record (DB)
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert([{ name: `${name}'s Workspace` }])
      .select("id")
      .single();
    
    if (tenantError || !tenantData) {
      // ROLLBACK: Clean up auth user
      await supabase.auth.admin.deleteUser(userId);
      return error(500);
    }
    
    const tenantId = tenantData.id;
    
    // STEP 5: Create user record (DB)
    const { error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email,
          name,
          tenant_id: tenantId,
          role: "owner",
        },
      ]);
    
    if (userError) {
      // ROLLBACK: Clean up auth + tenant
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from("tenants").delete().eq("id", tenantId);
      return error(500);
    }
    
    // STEP 6: Send email (external call)
    const emailResult = await sendConfirmationEmail(email, confirmationLink);
    if (!emailResult.success) {
      // Log for audit, keep user alive (retry-able via /resend-confirmation)
      await logFailedRegistration(email, userId, tenantId);
      return success(202, { email_send_failed: true });
    }
    
    // STEP 7: Success
    return success(202, { message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    return error(500);
  }
}
```

### Key Characteristics

✅ **Sequential execution** — Each step completes before next begins  
✅ **Explicit rollback** — On failure, clean up previous steps  
✅ **Error handling** — Every step has try/catch and fallback  
✅ **Logging** — Each step can be logged for audit trail  
✅ **Testable** — Mock Supabase, inject dependencies  
✅ **Debuggable** — Single source of truth (the route handler)

---

## Story 1.5: Kanban Auto-Creation Example

Demonstrates extending the pattern for new functionality.

### Before (Incomplete)

```typescript
// Only STEP 4-5 implemented
const { data: authData } = await supabase.auth.admin.createUser({ email, password });
const { data: tenantData } = await supabase.from("tenants").insert([...]);
const { error: userError } = await supabase.from("users").insert([...]);
// ❌ Missing: kanban creation
```

### After (Story 1.5 Implementation)

```typescript
// STEP 4: Create tenant
const tenantId = tenantData.id;

// STEP 5: Create user
await supabase.from("users").insert([{ id: userId, tenant_id: tenantId, ... }]);

// STEP 5.5: Create default kanban ← NEW
const kanbanId = await createDefaultKanban(supabase, tenantId);
if (!kanbanId) {
  // ROLLBACK: Delete auth user, tenant, user
  await supabase.auth.admin.deleteUser(userId);
  await supabase.from("tenants").delete().eq("id", tenantId);
  await supabase.from("users").delete().eq("id", userId);
  return error(500);
}

// Continue with remaining steps...
```

### Helper Function Pattern

```typescript
// File: lib/kanban.ts

export async function createDefaultKanban(
  supabase: SupabaseClient,
  tenantId: string
): Promise<string | null> {
  try {
    // Create kanban in transaction
    const { data: kanbanData, error: kanbanError } = await supabase
      .from("kanbans")
      .insert([{
        tenant_id: tenantId,
        name: "Main",
        is_main: true,
        order: 1,
      }])
      .select("id")
      .single();
    
    if (kanbanError || !kanbanData) {
      console.error("Kanban creation failed:", kanbanError);
      return null;
    }
    
    const kanbanId = kanbanData.id;
    
    // Create default columns
    const columns = [
      { name: "Novo", order: 1 },
      { name: "Qualificado", order: 2 },
      { name: "Em Negociação", order: 3 },
      { name: "Fechado", order: 4 },
    ];
    
    const { error: columnsError } = await supabase
      .from("columns")
      .insert(
        columns.map((col) => ({
          kanban_id: kanbanId,
          ...col,
        }))
      );
    
    if (columnsError) {
      console.error("Columns creation failed:", columnsError);
      // Rollback: delete kanban
      await supabase.from("kanbans").delete().eq("id", kanbanId);
      return null;
    }
    
    return kanbanId;
  } catch (error) {
    console.error("Unexpected error in createDefaultKanban:", error);
    return null;
  }
}
```

---

## Webhook Example: Epic 4 (Webhook → DB Integration)

### Pattern for Story 4.1-4.2: Auto-Register Contacts & Conversations

```typescript
// File: app/api/webhooks/evo-go/route.ts

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createClient(url, key);
    const body = await request.json();
    
    // STEP 1: Validate webhook signature (HMAC-SHA256)
    const isValid = validateWebhookSignature(body, process.env.EVO_GO_SECRET);
    if (!isValid) return error(401);
    
    const { wa_phone, message_text, media_url, tenant_id } = body;
    
    // STEP 2: Lookup or auto-create contact
    let { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .eq("phone", wa_phone)
      .eq("tenant_id", tenant_id)
      .single();
    
    if (!contact) {
      // Auto-create contact
      const { data: newContact, error: contactError } = await supabase
        .from("contacts")
        .insert([{
          tenant_id,
          phone: wa_phone,
          name: `Contact ${wa_phone}`, // Placeholder
        }])
        .select("id")
        .single();
      
      if (contactError || !newContact) {
        console.error("Contact creation failed:", contactError);
        return error(500);
      }
      
      contact = newContact;
    }
    
    // STEP 3: Lookup or auto-create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("tenant_id", tenant_id)
      .single();
    
    if (!conversation) {
      // Auto-create conversation (routed to Main kanban)
      const { data: mainKanban } = await supabase
        .from("kanbans")
        .select("id")
        .eq("tenant_id", tenant_id)
        .eq("is_main", true)
        .single();
      
      const { data: firstColumn } = await supabase
        .from("columns")
        .select("id")
        .eq("kanban_id", mainKanban?.id)
        .order("order", { ascending: true })
        .limit(1)
        .single();
      
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert([{
          tenant_id,
          contact_id: contact.id,
          kanban_id: mainKanban?.id,
          column_id: firstColumn?.id,
          wa_phone,
          status: "active",
        }])
        .select("id")
        .single();
      
      if (convError || !newConversation) {
        console.error("Conversation creation failed:", convError);
        return error(500);
      }
      
      conversation = newConversation;
    }
    
    // STEP 4: Save message to DB
    const { error: messageError } = await supabase
      .from("messages")
      .insert([{
        conversation_id: conversation.id,
        sender_type: "contact",
        content: message_text,
        media_url,
      }]);
    
    if (messageError) {
      console.error("Message save failed:", messageError);
      return error(500);
    }
    
    // STEP 5: Broadcast via Real-time
    await broadcastUpdate(supabase, conversation.id);
    
    // Return 200 OK immediately (webhook must respond <200ms)
    return success(200, { processed: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return error(500);
  }
}
```

### Key Points for Webhooks

- ✅ Validate signature first (prevent unauthorized calls)
- ✅ Auto-create intermediate entities as needed (contact → conversation)
- ✅ Use lookups before creates (prevent duplicates)
- ✅ Return 200 OK early (don't block webhook)
- ✅ Log failures for audit trail (no silent failures)
- ✅ Broadcast changes via Real-time (keep UI in sync)

---

## Implementation Checklist

When adding new automation, follow this checklist:

- [ ] **Is it a multi-step workflow?** → Use application-layer
- [ ] **Does it involve external APIs?** → Use application-layer
- [ ] **Do you need transaction rollback?** → Use application-layer
- [ ] **Is it testable?** → Must be application-layer (not SQL-only)
- [ ] **Can you log each step?** → Use application-layer (for audit trail)
- [ ] **Does it need error handling?** → Application-layer required
- [ ] **Is it performance-critical?** → Consider, but still apply pattern (optimize after proving correctness)

**Decision:** If ANY of these are true, implement in application-layer following `register/route.ts` pattern.

---

## Testing Strategy

### Unit Tests (Mocked Supabase)

```typescript
import { createDefaultKanban } from "@/lib/kanban";
import { createMockSupabase } from "@/tests/mocks";

describe("createDefaultKanban", () => {
  it("creates kanban with 4 default columns", async () => {
    const mockSupabase = createMockSupabase();
    mockSupabase.from = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: "kanban-123" },
          }),
        }),
      }),
    });
    
    const result = await createDefaultKanban(mockSupabase, "tenant-123");
    
    expect(result).toBe("kanban-123");
    expect(mockSupabase.from).toHaveBeenCalledWith("kanbans");
  });
  
  it("returns null on kanban creation failure", async () => {
    const mockSupabase = createMockSupabase();
    mockSupabase.from = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            error: { message: "Insert failed" },
          }),
        }),
      }),
    });
    
    const result = await createDefaultKanban(mockSupabase, "tenant-123");
    
    expect(result).toBeNull();
  });
});
```

### Integration Tests (Real DB or Test DB)

```typescript
describe("POST /api/auth/register (Integration)", () => {
  it("creates user, tenant, and default kanban on successful registration", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
          password: "SecurePass123!",
        }),
      })
    );
    
    expect(response.status).toBe(202);
    
    // Verify all records created
    const user = await db.users.findOne({ email: "test@example.com" });
    const tenant = await db.tenants.findOne({ id: user.tenant_id });
    const kanban = await db.kanbans.findOne({ tenant_id: tenant.id });
    const columns = await db.columns.findMany({ kanban_id: kanban.id });
    
    expect(user).toBeDefined();
    expect(tenant.name).toBe("Test User's Workspace");
    expect(kanban.is_main).toBe(true);
    expect(columns).toHaveLength(4);
  });
  
  it("rolls back all changes if kanban creation fails", async () => {
    // Mock kanban creation to fail
    jest.spyOn(db.kanbans, "insert").mockRejectedValueOnce(
      new Error("Insert failed")
    );
    
    const response = await POST(...);
    
    expect(response.status).toBe(500);
    
    // Verify rollback happened
    const user = await db.users.findOne({ email: "test@example.com" });
    expect(user).toBeUndefined(); // Should be deleted
  });
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Creating a Trigger Instead

```typescript
// DON'T DO THIS
// SQL: CREATE TRIGGER auto_create_kanban AFTER INSERT ON users...

// DO THIS INSTEAD
// TypeScript in register/route.ts:
const kanbanId = await createDefaultKanban(supabase, tenantId);
if (!kanbanId) return rollback();
```

**Why?** Triggers are hidden, hard to test, and difficult to modify.

---

### ❌ Pitfall 2: Silent Failures

```typescript
// DON'T DO THIS
const { data: kanban } = await supabase.from("kanbans").insert([...]);
// Assumes success, no error check!

// DO THIS INSTEAD
const { data: kanban, error } = await supabase.from("kanbans").insert([...]);
if (error || !kanban) {
  console.error("Kanban creation failed:", error);
  // Rollback previous steps
  return error(500);
}
```

**Why?** Silent failures are impossible to debug and lead to data inconsistency.

---

### ❌ Pitfall 3: Nested Async Without Await

```typescript
// DON'T DO THIS
createDefaultKanban(supabase, tenantId); // Fire and forget!
return success(202); // Returns before kanban created!

// DO THIS INSTEAD
const kanbanId = await createDefaultKanban(supabase, tenantId);
if (!kanbanId) return error(500);
return success(202);
```

**Why?** Race conditions and lost data.

---

## Documentation & Onboarding

### For New Developers

1. **Read this file** → Understand the pattern
2. **Study `app/api/auth/register/route.ts`** → See it in action
3. **Review Story 1.5** → Implementation example
4. **Implement new feature** → Follow the checklist above
5. **Test thoroughly** → Both unit and integration tests

### For Code Reviews

When reviewing PRs with new automation:

- [ ] Is orchestration in Node.js, not DB?
- [ ] Does it have explicit error handling?
- [ ] Is rollback implemented for failures?
- [ ] Are there both unit and integration tests?
- [ ] Is each step logged/auditable?
- [ ] Does it follow the canonical pattern?

---

## FAQ

**Q: What if I need to perform this operation very frequently (1000s/sec)?**  
A: Application-layer orchestration is still the answer. Optimize with caching, batching, or async queues, but keep the logic in Node.js for observability.

**Q: What about performance — isn't a trigger faster?**  
A: For MVP, correctness > performance. If you hit a real bottleneck (measure first!), optimize within the pattern. Don't sacrifice debuggability for theoretical speed.

**Q: Can I use this pattern with Supabase Real-time or other features?**  
A: Yes! Real-time subscriptions, RLS policies, and other DB features work perfectly with application-layer orchestration. This pattern doesn't prevent their use.

**Q: What if the operation is simple (just one INSERT)?**  
A: Still use application-layer. A simple route handler is clear, testable, and future-proof. Don't create functions/triggers for one-liners.

---

## References

- **Canonical Implementation:** `app/api/auth/register/route.ts` (lines 146-210)
- **Story 1.5:** `docs/stories/1.5.story.md` (Default Kanban Setup)
- **PRD Section 9.3-9.4:** `docs/prd/9-technical-architecture.md` (Webhook flows)
- **Epic 4 Stories:** `docs/prd/14-implementation-roadmap-7-epics-sequenced.md` (Auto-create patterns)

---

**Last Reviewed:** 2026-04-07  
**Next Review:** When Epic 4 implementation begins
