# Development Patterns — Quick Reference

**For new developers working on Synkra AIOX**

---

## 🎯 The One Pattern You Need to Know

**Application-Layer Orchestration:** All multi-step operations (automation, workflows, webhooks) happen in Node.js/TypeScript, never in the database.

✅ **DO:**
- Multi-step logic in API route handlers (e.g., `register/route.ts`)
- Error handling with explicit rollback
- Helper functions for reusable operations
- Unit + integration tests

❌ **DON'T:**
- PostgreSQL triggers
- Supabase Edge Functions for DB mutations
- Stored procedures
- Database-driven automation

---

## 🚀 Quick Start (3 Steps)

### 1. Read the Canonical Implementation

**File:** `app/api/auth/register/route.ts`

**Focus:** Lines 146-210 (STEP 4-5)
- How tenant is auto-created after user registration
- How errors trigger rollback (cleanup)
- How helper functions are called

**Time:** 10 minutes

### 2. Study the Pattern Guide

**File:** `docs/architecture/application-layer-orchestration-pattern.md`

**Sections to read:**
- Overview (why this pattern)
- Canonical Pattern (detailed walkthrough)
- Story 1.5 Example (before/after)
- Implementation Checklist (when to use it)

**Time:** 30 minutes

### 3. Implement Your Feature

**Template to follow:**

```typescript
export async function POST(request: NextRequest) {
  try {
    // STEP 1: Validate input
    const { ... } = await request.json();
    if (!valid) return error(400);
    
    // STEP 2: Check preconditions (rate limit, auth, etc.)
    if (rateLimited) return error(429);
    
    // STEP 3-N: Execute steps, with rollback on failure
    const result1 = await operation1();
    if (error) {
      // ROLLBACK: undo result1
      return error(500);
    }
    
    const result2 = await operation2();
    if (error) {
      // ROLLBACK: undo result1, result2
      return error(500);
    }
    
    // STEP N+1: Success
    return success(200, result);
  } catch (error) {
    return error(500);
  }
}
```

**Time:** Depends on feature complexity

---

## 📋 Before You Code

Ask yourself:

1. **Is this a multi-step operation?** (create user → create tenant → create kanban)
   - YES → Use application-layer ✅
   
2. **Do I need to call external APIs?** (Supabase, Evolution, Resend, etc.)
   - YES → Use application-layer ✅
   
3. **Do I need error handling & rollback?**
   - YES → Use application-layer ✅
   
4. **Is this testable?** (Can I mock dependencies?)
   - YES → Use application-layer ✅
   
5. **Do I need to log each step for audit trail?**
   - YES → Use application-layer ✅

**If ANY are true:** Use application-layer pattern.

---

## 🧪 Testing Checklist

**Unit Tests (with mocks):**
- [ ] Happy path: all steps succeed
- [ ] Failure at each step: proper error returned
- [ ] Rollback logic: previous steps cleaned up

**Integration Tests (with real/test DB):**
- [ ] End-to-end: full workflow succeeds
- [ ] Failure scenarios: partial state cleanup
- [ ] Data consistency: no orphaned records

**Example:**
```typescript
it("creates user, tenant, kanban in order", async () => {
  const response = await POST(createRequest({
    email: "test@example.com",
    name: "Test User",
    password: "SecurePass123!",
  }));
  
  expect(response.status).toBe(202);
  
  // Verify all records created
  const user = await db.users.findOne({ email: "test@example.com" });
  const tenant = await db.tenants.findOne({ id: user.tenant_id });
  const kanban = await db.kanbans.findOne({ tenant_id: tenant.id });
  
  expect(user).toBeDefined();
  expect(tenant).toBeDefined();
  expect(kanban.is_main).toBe(true);
});
```

---

## 🔗 Related Resources

| Resource | Purpose | Time |
|----------|---------|------|
| [Application-Layer Orchestration Pattern](./docs/architecture/application-layer-orchestration-pattern.md) | Complete guide with examples, pitfalls, FAQ | 45 min |
| `app/api/auth/register/route.ts` | Canonical implementation | 10 min |
| `docs/stories/1.5.story.md` | Implementation example (kanban auto-creation) | 15 min |
| `docs/prd/9-technical-architecture.md` | Webhook flows (section 9.3-9.4) | 20 min |

---

## ❓ Common Questions

**Q: "Can I use a trigger for this?"**  
A: No. Use application-layer. Triggers are hidden, hard to debug, and not testable.

**Q: "What if I need to do this very frequently (1000s/sec)?"**  
A: Still use application-layer. Optimize with caching/batching, but keep logic in Node.js for observability.

**Q: "What if it's just a simple INSERT?"**  
A: Still use application-layer. A simple route handler is clear, testable, and future-proof.

**Q: "Can I use RLS, Real-time subscriptions, etc. with this pattern?"**  
A: Yes! This pattern works perfectly with all Supabase features. Application-layer doesn't prevent their use.

**For more:** See [Pattern Guide FAQ](./docs/architecture/application-layer-orchestration-pattern.md#faq)

---

## 🚨 Code Review Checklist

When reviewing PRs, ask:

- [ ] Is orchestration in Node.js, not SQL?
- [ ] Does it have explicit error handling?
- [ ] Is rollback implemented for failures?
- [ ] Are there unit + integration tests?
- [ ] Is each step logged/auditable?
- [ ] Does it follow the canonical pattern?

---

## 📞 Need Help?

1. **Pattern questions?** → Read [Pattern Guide](./docs/architecture/application-layer-orchestration-pattern.md)
2. **Specific implementation?** → Study `app/api/auth/register/route.ts` + your task
3. **Code review feedback?** → Check checklist above
4. **Still stuck?** → Message the team

---

_Last Updated: 2026-04-07_  
_Synkra AIOX Project Standard_
