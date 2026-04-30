# QA Fix Request — Story 6.6.1

**From:** Quinn (QA)  
**To:** @dev (Dex)  
**Story/Component:** 6.6.1 — Multi-Kanban Column Selection  
**Gate Status:** CONCERNS  
**Date:** 2026-04-30

---

## 🔴 Critical Issues to Fix

### Issue 1: Real-time Synchronization Not Tested (Severity: HIGH)

**File:** `src/components/ui/organisms/chat/KanbanTransferDropdown.tsx`  
**Location:** Component logic + tests  
**Current:** No test coverage for AC 4 (real-time sync)

**Problem:**
- AC 4 requires: "Conversation moves to new kanban and appears on board" + "Other users/browsers see changes without refresh"
- Current component waits for API response before updating UI
- No optimistic UI update (conversation doesn't move immediately)
- No WebSocket listener visible in component
- No test verifying real-time synchronization

**Fix:**
1. Implement optimistic UI update in `handleColumnChange` (update state immediately, revert on error)
2. Verify WebSocket real-time subscription exists in parent `ChatModal` component
3. If missing, add real-time listener in ChatModal for conversation updates
4. Add integration test for real-time sync behavior

**Verification:** 
- [ ] Component updates UI immediately on column selection
- [ ] Component reverts UI on API error
- [ ] WebSocket subscription active for conversation updates
- [ ] Other tabs/browsers receive real-time updates
- [ ] Test: `it('should update UI immediately (optimistic update)')`
- [ ] Test: `it('should sync changes via WebSocket in real-time')`

---

### Issue 2: Cross-Kanban Integrity Not Fully Tested (Severity: HIGH)

**File:** `tests/unit/api/update-column.test.ts`  
**Location:** Integration test coverage  
**Current:** API tested in isolation, but integration scenarios missing

**Problem:**
- AC 5 requires: "Conversation exists in ONLY ONE kanban" + "Changes persisted on refresh"
- Current tests verify atomic update, but not:
  - Conversation removal from original kanban
  - Refresh persistence (data reload from DB)
  - Concurrent update handling
  - Duplicate prevention across kanbans

**Fix:**
1. Add integration test for conversation disappearance from original kanban
2. Add test for refresh persistence (fetch conversation, verify new kanban)
3. Add test for concurrent updates (2 simultaneous requests)

**Verification:**
- [ ] Test: `it('should remove conversation from original kanban after transfer')`
- [ ] Test: `it('should persist kanban assignment on page refresh')`
- [ ] Test: `it('should handle concurrent transfers atomically')`

---

### Issue 3: Lint Warnings — Type Safety Issues (Severity: MEDIUM)

**Files:** 3 files, 5 warnings  
**Current:** Code uses untyped `any` which reduces type safety

**Problems:**

#### 3a. useKanbanStructure.ts:49 — Untyped catch error
```typescript
catch (err: any) {  // ❌ Should be typed
  setError(err.message || 'Falha ao carregar...');
}
```

**Fix:**
```typescript
catch (err: unknown) {  // ✅ Proper typing
  const errorMsg = err instanceof Error ? err.message : 'Falha ao carregar...';
  setError(errorMsg);
}
```

#### 3b. ChatModal.test.tsx:6 — Unused import
```typescript
import { useKanbanStructure } from '@/hooks/useKanbanStructure';  // ❌ Never used
```

**Fix:**
- Remove the import line entirely

#### 3c. KanbanTransferDropdown.test.tsx — 4 `any` types in mocks (lines 41, 43, 50, 117)
```typescript
} as any  // ❌ Should be proper type
```

**Fix:**
```typescript
interface MockChatContext {
  activeConversation: Conversation | null;
  isLoadingConversation: boolean;
  // ... other required fields
}

vi.mocked(useChat).mockReturnValue({
  activeConversation: mockActiveConversation,
  isLoadingConversation: false,
} as MockChatContext);  // ✅ Properly typed
```

**Verification:**
- [ ] npm run lint → 0 errors, story-related warnings = 0
- [ ] npm run typecheck → PASS (no type errors)

---

### Issue 4: UI Option Labels Not Matching AC 3 Spec (Severity: LOW)

**File:** `src/components/ui/organisms/chat/KanbanTransferDropdown.tsx`  
**Location:** Line 114  
**Current:**
```typescript
<option key={col.id} value={col.id}>
  {col.name}  {/* ❌ Only column name */}
</option>
```

**Expected (AC 3):** "Kanban Name - Column Name" format

**Fix:**
```typescript
<option key={col.id} value={col.id}>
  {kanban.name} - {col.name}  {/* ✅ Full format */}
</option>
```

**Example Result:**
```
✅ Main - To Do
✅ Main - In Progress  
✅ Support - Backlog
✅ Files - Pending
```

**Verification:**
- [ ] Dropdown options show "Kanban - Column" format
- [ ] Labels are clear and consistent

---

## ✅ Verification Checklist

### Implementation Checklist
- [ ] Optimistic UI update implemented (`setSelectedColumnId` before API call)
- [ ] Error revert logic working (UI reverts to previous column on error)
- [ ] WebSocket listener verified/added in ChatModal
- [ ] Real-time subscription filters by conversation_id
- [ ] Unsubscribe cleanup on component unmount
- [ ] Lint warnings fixed (0 story-related warnings)
- [ ] Unused imports removed
- [ ] Type safety improved (no `any` types)
- [ ] Option labels updated to "Kanban - Column" format

### Testing Checklist
- [ ] `npm run lint` — PASS (0 errors, 5 warnings resolved)
- [ ] `npm run typecheck` — PASS
- [ ] `npm test` — All tests pass (should be 12+ now with new tests)
- [ ] New test: Optimistic update + revert
- [ ] New test: Real-time sync verification
- [ ] New test: Cross-kanban integrity
- [ ] New test: Concurrent update handling
- [ ] All AC 1-5 have test coverage

### Final Validation
- [ ] AC 1 (Hook): ✅ PASS — Loading, error handling, refetch
- [ ] AC 2 (API): ✅ PASS — Validation, atomic update, error responses
- [ ] AC 3 (Component): ✅ PASS — Optgroup, labels, loading/error states
- [ ] AC 4 (Real-time Sync): ✅ PASS — Optimistic UI, WebSocket, other browsers
- [ ] AC 5 (Cross-Kanban Integrity): ✅ PASS — Atomic, removal, persistence

---

## 📝 QA Gate Re-Review Process

1. **@dev implements fixes** following this request
2. **@dev runs verification checklist** and confirms all items
3. **@dev commits changes:**
   ```bash
   git add .
   git commit -m "fix: resolve QA gate CONCERNS for story 6.6.1
   
   - Implement optimistic UI updates for column transfer
   - Add WebSocket real-time sync verification
   - Add integration tests for cross-kanban scenarios
   - Fix lint warnings (any types, unused imports)
   - Update option labels to 'Kanban - Column' format
   - All AC 1-5 now fully tested and implemented"
   ```

4. **@dev notifies @qa:** "Ready for re-review"
5. **@qa re-runs gate:** `*gate 6.6.1`
   - Expects: PASS (or minimal concerns)
6. **On PASS:** Ready for @devops → `*push`

---

## 📁 References

- **Gate Report:** `docs/qa/gates/6.6.1-multi-kanban-selection.yml`
- **Story:** `docs/stories/6.6.1.story.md`
- **Epic:** `docs/stories/epics/epic-6-chat-realtime.md`
- **Implementation Roadmap:** `docs/prd/15-implementation-roadmap-7-epics-sequenced.md`

---

## 📊 Impact Summary

| Category | Count | Priority |
|----------|-------|----------|
| **Critical Issues** | 2 | HIGH |
| **Code Quality Issues** | 1 | MEDIUM |
| **UX Issues** | 1 | LOW |
| **Estimated Fix Time** | ~90 min | — |
| **Expected Outcome** | PASS | ✅ |

---

---

**Status:** ✅ RESOLVED  
**Resolved By:** Dex (@dev)  
**Date:** 2026-04-30  
**Resolution Summary:** All critical, medium, and low issues resolved. Optimistic UI implemented, type safety improved, and test coverage expanded to 100% of ACs.
