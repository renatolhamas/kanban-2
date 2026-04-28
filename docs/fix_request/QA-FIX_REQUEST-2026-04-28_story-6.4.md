# QA Fix Request — Story 6.4 (Message History Pagination)

**From:** Quinn (QA)  
**To:** @dev (Dex)  
**Story/Component:** 6.4  
**Gate Status:** FAIL  
**Date:** 2026-04-28

---

## 🔴 Critical Issues to Fix

### Issue 1: Missing Architecture Compliance Filter (Severity: BLOCKING)

**File:** `app/api/messages/route.ts`  
**Location:** Lines 29-38 (query builder)  
**Current Code:**
```typescript
let query = supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: false })
  .limit(limit);
```

**Problem:** 
- AC 6 explicitly requires: "All queries include `.eq('service', 'ttcx')` filter"
- Source: `architecture/9-performance-strategy.md#92-database-optimization`
- This is a **violation of architecture requirements**, not optional
- Without this filter, query may return messages from other services (data isolation issue)

**Fix:**
```typescript
let query = supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .eq('service', 'ttcx')  // ← ADD THIS LINE
  .order('created_at', { ascending: false })
  .limit(limit);
```

**Verification:** 
- Ensure filter appears in final query
- Re-run tests to confirm no regressions
- Verify existing messages still load correctly

---

### Issue 2: Missing Performance Test (AC 7) (Severity: HIGH)

**File:** `tests/unit/hooks/useMessagePagination.test.ts`  
**Location:** End of file (add new test)  
**Current:** No test for < 200ms latency requirement

**Problem:**
- AC 7: "Query performance: **< 200ms** for paginated message fetches"
- Current tests don't validate this requirement
- No `console.time()` / `console.timeEnd()` measurements in tests

**Fix:** Add performance test:
```typescript
it('loadInitialMessages completes in < 200ms', async () => {
  const mockMessages = Array.from({ length: 50 }, (_, i) => ({
    id: `msg-${i}`,
    conversation_id: 'conv-1',
    content: `Message ${i}`,
    sender_type: 'agent' as const,
    created_at: new Date(1000000000000 + i * 1000).toISOString()
  }));

  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockMessages;
    }
  });

  const { result } = renderHook(() => useMessagePagination());
  
  const startTime = performance.now();
  await act(async () => {
    await result.current.loadInitialMessages('conv-1');
  });
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  expect(duration).toBeLessThan(200);
});
```

**Verification:**
- Test passes with latency < 200ms
- Performance baseline established

---

### Issue 3: Missing Large Dataset Test (AC 8) (Severity: HIGH)

**File:** `tests/unit/hooks/useMessagePagination.test.ts`  
**Location:** End of file (add new test)  
**Current:** No test for handling 500+ messages

**Problem:**
- AC 8: "Component supports **at least 500 messages** in memory without performance degradation"
- Current tests only use 50 messages
- No validation that component handles large datasets

**Fix:** Add large dataset test:
```typescript
it('supports 500+ messages in memory without degradation', async () => {
  const largeMessageSet = Array.from({ length: 500 }, (_, i) => ({
    id: `msg-${i}`,
    conversation_id: 'conv-1',
    content: `Message ${i}`,
    sender_type: 'agent' as const,
    created_at: new Date(1000000000000 + i * 1000).toISOString()
  }));

  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => largeMessageSet.slice(0, 50)
  });

  const { result } = renderHook(() => useMessagePagination());

  await act(async () => {
    await result.current.loadInitialMessages('conv-1');
  });

  // Simulate loading 9 more pages (9 * 50 = 450 messages)
  for (let i = 0; i < 9; i++) {
    const start = (i + 1) * 50;
    const end = Math.min(start + 50, largeMessageSet.length);
    
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => largeMessageSet.slice(start, end)
    });

    await act(async () => {
      await result.current.loadMoreMessages('conv-1');
    });
  }

  // Verify all messages loaded
  expect(result.current.messages.length).toBeGreaterThanOrEqual(500);
  
  // Verify state consistency
  expect(result.current.hasMore).toBe(true); // Still has more to load
  expect(result.current.isLoadingMore).toBe(false); // Not currently loading
});
```

**Verification:**
- Test completes without timeout
- All 500+ messages retained in state
- State consistency maintained

---

## ✅ Verification Checklist

- [ ] Add `.eq('service', 'ttcx')` filter to `route.ts` line 32
- [ ] Add performance test (< 200ms validation)
- [ ] Add large dataset test (500+ messages validation)
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run lint` — no new linting issues
- [ ] Run `npm run typecheck` — no TypeScript errors
- [ ] Verify existing messages load correctly after fix
- [ ] Confirm performance < 200ms measured in tests

---

## 📝 QA Gate Re-Review Process

1. @dev implements fixes above
2. @dev runs full verification checklist
3. @dev notifies @qa (link to commit)
4. @qa runs `*gate 6.4` again
5. @qa updates gate verdict (target: PASS)

---

## 📁 References

- **Story:** `docs/stories/6.4.story.md`
- **Architecture:** `architecture/9-performance-strategy.md#92-database-optimization`
- **AC 6:** "All queries include `.eq('service', 'ttcx')` filter"
- **AC 7:** "Query performance: < 200ms for paginated message fetches"
- **AC 8:** "Component supports at least 500 messages in memory"

---

**QA Gate Status:** 🔴 FAIL → Fix Request Created  
**Expected Timeline:** 1-2 hours for fixes  
**Re-Review:** Will proceed once all fixes verified

