# Story 5.4.1 — Implementation Checklist

**Executor:** @dev (Dex)  
**Plan Reference:** `docs/plans/fase.5/F5.plan.009.md`  
**Security Reference:** `docs/lessons/jwt.md`  
**Status:** 📋 Ready for Implementation

---

## ✅ PHASE 0: PRE-IMPLEMENTATION (Do This First!)

### 0.1 Read Security Context
- [ ] Read `docs/lessons/jwt.md` (5-10 min) — Understand the jwt ping-pong history
- [ ] Read `docs/plans/fase.5/F5.plan.009.md` completely (15-20 min) — Understand the plan
- [ ] Review the 4 Gotchas section (5 min) — Memorize them

### 0.2 Verify Database Readiness
```bash
# Run these commands and verify output:

# 1. Check migrations applied
supabase migration list
# Expected: 22 migrations, all ✅

# 2. Verify RPC exists
psql 'postgresql://...' -c \
  "SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'get_conversations_with_last_message';"
# Expected: 1 row returned

# 3. Verify custom_access_token_hook exists
psql 'postgresql://...' -c \
  "SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'custom_access_token_hook';"
# Expected: 1 row returned

# 4. Verify index exists
psql 'postgresql://...' -c \
  "SELECT indexname FROM pg_indexes 
   WHERE indexname = 'idx_messages_conversation_created';"
# Expected: 1 row returned
```
- [ ] All 4 checks pass ✅
- [ ] Contact @data-engineer if any check fails ❌

### 0.3 Setup Local Testing Environment
```bash
# 1. Create test accounts (2 different tenants)
npm run seed:test-users  # Create userA@test.com, userB@test.com

# 2. Export JWT tokens for testing
export JWT_A=$(npm run get-jwt -- userA@test.com)
export JWT_B=$(npm run get-jwt -- userB@test.com)

# 3. Verify tokens exist
echo $JWT_A  # Should be a long string
echo $JWT_B  # Should be a different long string
```
- [ ] JWT_A exported and valid
- [ ] JWT_B exported and valid (different tenant)
- [ ] Both JWTs contain app_metadata.tenant_id

---

## ✅ PHASE 1: API ROUTE IMPLEMENTATION

### 1.1 Create API Route File
- [ ] Create `app/api/conversations/route.ts`
- [ ] Copy code from F5.plan.009.md Passo 1 (API section)
- [ ] Replace `token` with JWT extraction logic

### 1.2 JWT Extraction Logic
```typescript
// In app/api/conversations/route.ts
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // ✅ CORRECT: Extract JWT from Authorization header or cookie
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  // ❌ WRONG: Hardcoding token
  // ❌ WRONG: Getting from URL query param
  // ❌ WRONG: Getting from user input
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Rest of implementation...
}
```
- [ ] JWT extraction logic correct
- [ ] Handles missing JWT (returns 401)
- [ ] Does NOT hardcode token

### 1.3 RPC Call
```typescript
// Key points:
const { data, error } = await supabase.rpc(
  'get_conversations_with_last_message',
  {
    p_kanban_id: kanbanId,
    // ❌ NOT passing p_tenant_id (vem do JWT)
  }
);
```
- [ ] RPC call uses correct function name
- [ ] Does NOT pass `p_tenant_id` manually
- [ ] Includes error handling (console.error + response)

### 1.4 Test with cURL
```bash
# Test with Tenant A JWT
curl -H "Authorization: Bearer $JWT_A" \
  "http://localhost:3000/api/conversations?kanban_id=kanban-a"

# Expected: [ { id, wa_phone, contact_name, last_message_content, ... } ]
# ❌ If empty array: Check JWT validity, RLS policies
# ❌ If error 401: Check JWT header, token validity
```
- [ ] Request with JWT returns conversations
- [ ] Response includes all required fields
- [ ] No errors in server logs

---

## ✅ PHASE 2: FRONTEND IMPLEMENTATION

### 2.1 Create useConversations Hook
- [ ] Create `src/hooks/useConversations.ts`
- [ ] Copy code from F5.plan.009.md Passo 2 (Hook section)
- [ ] Implement fetchConversations function

### 2.2 JWT Management in Hook
```typescript
// ✅ CORRECT:
const token = localStorage.getItem('sb-jwt-token');
// or from Supabase client:
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// ❌ WRONG:
// const token = userInput.token
// const token = 'hardcoded-token'
// const token = getTenantIdFromToken() // This is tenant_id, not JWT!
```
- [ ] Token retrieved from secure storage (localStorage, session, etc)
- [ ] Token passed in Authorization header
- [ ] Handles null/undefined token gracefully

### 2.3 Real-time Subscription with Debounce
```typescript
// ✅ CORRECT:
const debouncedFetch = debounce(() => fetchConversations(), 500);

channel.on('postgres_changes', {...}, (payload) => {
  debouncedFetch();  // ← Calls fetch at most once per 500ms
});

// ❌ WRONG:
// channel.on('postgres_changes', {...}, (payload) => {
//   fetchConversations();  // ← Calls fetch immediately = API spam
// });
```
- [ ] Debounce implemented (min 500ms)
- [ ] Real-time subscription activates
- [ ] Cleanup/unsubscribe on unmount

### 2.4 Test Hook in Component
```typescript
// In a test component:
const { conversations, isLoading, error } = useConversations(kanbanId);

// Verify:
// - conversations array populated
// - isLoading transitions correctly
// - error null on success
```
- [ ] Hook returns conversations array
- [ ] Hook handles loading state
- [ ] Hook handles error state
- [ ] Real-time updates visible in <500ms

### 2.5 Create ConversationCard Component
- [ ] Create `src/components/ui/molecules/ConversationCard.tsx`
- [ ] Copy code from F5.plan.009.md Passo 2 (Component section)
- [ ] Render contact name, phone, last message, timestamp
- [ ] Show media type icon if present

### 2.6 Component Tests
```typescript
// Render with mock data:
const mockConversation = {
  id: 'conv-123',
  contact_name: 'John Doe',
  wa_phone: '+5511999999999',
  last_message_content: 'Hello world',
  last_sender_type: 'customer',
  last_media_type: null,
  unread_count: 0,
};

render(<ConversationCard conversation={mockConversation} />);

expect(screen.getByText('John Doe')).toBeInTheDocument();
expect(screen.getByText('Hello world')).toBeInTheDocument();
```
- [ ] Component renders without errors
- [ ] Contact name displayed
- [ ] Last message displayed
- [ ] Timestamp displayed
- [ ] Media icon displayed (if media_type present)
- [ ] Unread badge displayed (if > 0)

---

## ✅ PHASE 3: SECURITY VALIDATION

### 3.1 Manual Code Review (MANDATORY)
Perform a careful manual security review of your implementation:
```bash
# Check for critical patterns
grep -r "p_tenant_id" app/api/conversations/route.ts  # Should be EMPTY
grep -r "Authorization" app/api/conversations/route.ts  # Should EXIST
```
- [ ] No p_tenant_id passed manually to RPC (grep shows empty)
- [ ] JWT in Authorization header (grep shows it exists)
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling (try/catch, 401/500 responses)
- [ ] Null safety checks on API responses

### 3.2 Run RLS Isolation Test (MANDATORY)
```bash
npm test -- tests/rls-isolation.test.ts

# Expected output:
# ✓ RLS: Tenant A não vê dados de Tenant B
# ✓ RLS: Tenant A com JWT de B retorna dados de B
# ✓ RLS: Sem JWT retorna vazio ou erro
```
- [ ] All 3 RLS tests passing
- [ ] Zero overlap between tenants
- [ ] Unauthorized access blocked
- [ ] If any test fails: **STOP** — Debug before proceeding

### 3.3 Verify No Manual tenant_id Passing
```bash
# Search for "p_tenant_id" in your code:
grep -r "p_tenant_id" app/ src/

# ❌ If found: Remove it!
# ✅ If not found: Good, continue
```
- [ ] No `p_tenant_id` passed manually from client code
- [ ] Only JWT header contains tenant_id information

### 3.4 Verify JWT Header in All Requests
```bash
# Search for fetch/supabase calls without Authorization:
grep -r "fetch\|supabase.rpc" app/ src/ | grep -v "Authorization"

# ❌ If found: Add JWT header!
```
- [ ] All fetch/rpc calls include Authorization header
- [ ] JWT header in all API routes
- [ ] JWT header in all React queries

---

## ✅ PHASE 4: PERFORMANCE VALIDATION

### 4.1 Performance Benchmark (50 conversations)
```bash
# In browser console (or Postman):
console.time('get_conversations');
const response = await fetch('/api/conversations?kanban_id=kanban-1', {
  headers: { Authorization: `Bearer $JWT_A` }
});
console.timeEnd('get_conversations');

// Expected: < 500ms
// ❌ If > 1s: Contact @data-engineer
```
- [ ] API response < 500ms
- [ ] Real-time updates < 1s
- [ ] No console errors during fetch

### 4.2 Test with >100 Conversations (Pagination)
```bash
# If your test data has > 100 conversations:
# Verify pagination LIMIT is implemented

// In api/conversations/route.ts:
const { data } = await supabase.rpc('...')
  .range(0, 49);  // LIMIT 50

// Verify each response is capped at 50 items
```
- [ ] Pagination implemented (if > 100 conversations exist)
- [ ] LIMIT 50 (or appropriate page size) per request
- [ ] Performance doesn't degrade with large result sets

### 4.3 Test Real-time Update Performance
```typescript
// In test:
1. Create 100 conversations in Tenant A
2. Fetch /api/conversations
3. Measure: < 500ms ✅
4. Send 10 messages in quick succession (100ms apart)
5. Count debounced fetches: Should be 1-2, not 10
```
- [ ] Debounce working correctly
- [ ] No API spam from real-time updates
- [ ] Performance remains < 500ms under update load

---

## ✅ PHASE 5: INTEGRATION TESTS

### 5.1 Run All Test Scenarios (From F5.plan.009.md)
- [ ] **Scenario 1: Happy Path** — All steps succeed
- [ ] **Scenario 2: Multi-Tenant Isolation** — Zero overlap
- [ ] **Scenario 3: JWT Expiry** — Handles gracefully
- [ ] **Scenario 4: Performance Under Load** — < 500ms
- [ ] **Scenario 5: Error Scenarios** — All errors caught

### 5.2 E2E Test (if available)
```bash
npm run test:e2e

# Expected: All tests pass
# ❌ If failing: Debug specific scenario
```
- [ ] E2E tests pass (or manually verify if no E2E)
- [ ] No regressions in existing features

### 5.3 Manual Multi-Tenant Verification
```bash
# 1. Login as User A (Tenant A)
# 2. Open kanban board → See Tenant A conversations ✅
# 3. Open DevTools → Network tab
# 4. Check Authorization header present in /api/conversations request ✅
# 5. Check response data only has Tenant A's tenant_id ✅

# 6. Logout

# 7. Login as User B (Tenant B)
# 8. Open kanban board → See Tenant B conversations ✅
# 9. Verify: Tenant B conversations ≠ Tenant A conversations ✅
# 10. Verify: No Tenant A data leaked ✅
```
- [ ] Tenant A sees only Tenant A conversations
- [ ] Tenant B sees only Tenant B conversations
- [ ] No data overlap between tenants
- [ ] Authorization header present in requests

---

## ✅ PHASE 6: FINAL VALIDATION

### 6.1 Code Quality Checklist
- [ ] No `console.log()` in production code (only in development)
- [ ] No hardcoded secrets or tokens
- [ ] No `any` types (TypeScript strict)
- [ ] Proper error handling (try/catch or error handling in async)
- [ ] All functions have JSDoc comments for security-critical code
- [ ] No SQL injection vulnerabilities (all queries via RPC)
- [ ] No XSS vulnerabilities (all output sanitized)

### 6.2 File Completeness Checklist
- [ ] `app/api/conversations/route.ts` — Created and tested
- [ ] `src/hooks/useConversations.ts` — Created and tested
- [ ] `src/components/ui/molecules/ConversationCard.tsx` — Created and tested
- [ ] `tests/rls-isolation.test.ts` — Created and all tests pass
- [ ] `tests/story-5.4.1.test.ts` (if E2E) — All scenarios pass

### 6.3 Documentation Checklist
- [ ] Code comments added for complex logic
- [ ] Dev Notes updated (if issues found)
- [ ] API endpoint documented (if needed)
- [ ] Test instructions documented

### 6.4 Story File Updates (docs/stories/5.4.1.story.md)
- [ ] Story status updated to "InProgress"
- [ ] Tasks marked as [x] complete
- [ ] File List updated with created/modified files
- [ ] Change Log updated with implementation summary
- [ ] Dev Agent Record updated with execution details

---

## ✅ PHASE 7: PRE-MERGE FINAL CHECK

### 7.1 Lint & Type Check
```bash
npm run lint    # Expected: 0 errors
npm run typecheck  # Expected: 0 errors
npm test     # Expected: All tests pass
```
- [ ] Lint passes (0 errors)
- [ ] TypeScript passes (0 errors)
- [ ] All tests pass
- [ ] No warnings in build output

### 7.2 Final Manual Security Review
Do a final check before committing:
```bash
# Final sanity checks
npm run typecheck  # Type safety
npm run lint       # Code style
npm test           # All tests passing

# Quick manual checks
grep -r "p_tenant_id" app/api/conversations/route.ts  # Should be EMPTY
grep -r "TODO\|FIXME" app/api src/hooks src/components  # Should be none
```
- [ ] TypeScript strict: 0 errors
- [ ] Lint: 0 errors
- [ ] Tests: all passing
- [ ] No p_tenant_id manual passing
- [ ] No TODO/FIXME comments
- [ ] Ready to commit

### 7.3 Git Commit & Prepare for Merge
```bash
git add app/api/conversations/route.ts \
        src/hooks/useConversations.ts \
        src/components/ui/molecules/ConversationCard.tsx \
        tests/rls-isolation.test.ts \
        docs/stories/5.4.1.story.md

git commit -m "feat: implement Story 5.4.1 — Frontend & API for Last Message Preview

- API route /api/conversations with JWT-based RLS isolation
- useConversations hook with real-time subscriptions and debouncing
- ConversationCard component with media type support
- RLS isolation tests (2+ tenants, zero overlap)
- All acceptance criteria met"
```
- [ ] Commit message follows convention
- [ ] All files staged and committed
- [ ] No uncommitted changes
- [ ] Ready for @github-devops push

---

## ✅ EMERGENCY PROCEDURES

### If Something Breaks Before Merge
```bash
# 1. Revert uncommitted changes
git restore .

# 2. Restart dev server
npm run dev

# 3. Verify old version works
curl -H "Authorization: Bearer $JWT" \
  "http://localhost:3000/api/conversations?kanban_id=..."
```
- [ ] Old version still works
- [ ] No data corrupted

### If Something Breaks After Merge
```bash
# 1. Find the commit hash
git log --oneline | head -5

# 2. Revert the story
git revert COMMIT_HASH

# 3. Push (via @github-devops)
git push origin master

# 4. Notify @data-engineer for investigation
```
- [ ] Reverted and pushed
- [ ] @data-engineer notified
- [ ] Post-mortem planned

---

## 📊 COMPLETION STATUS

| Phase | Status | Notes |
|-------|--------|-------|
| 0: Pre-Implementation | ⬜ | Start here |
| 1: API Route | ⬜ | |
| 2: Frontend | ⬜ | |
| 3: Security | ⬜ | MANDATORY |
| 4: Performance | ⬜ | |
| 5: Integration | ⬜ | |
| 6: Final Validation | ⬜ | |
| 7: Pre-Merge | ⬜ | |

**Total Estimated Time:** 10-14 hours (4-6 implementation + 4-8 testing + 2-3 debugging)

**If You Follow This Checklist:** ✅ Smooth sailing, no surprises  
**If You Skip Steps:** ❌ 2-3 extra days of debugging

---

**Last Updated:** 2026-04-23  
**Created For:** Story 5.4.1  
**Reference:** F5.plan.009.md, docs/lessons/jwt.md
