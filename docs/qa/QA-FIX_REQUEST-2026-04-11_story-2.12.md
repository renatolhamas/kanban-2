# QA Fix Request — Story 2.12: Pages Refactor

**From:** Pax (PO)  
**To:** Story 2.12 (pre-development fixes)  
**Story:** 2.12 — Pages Refactor  
**Validation Status:** GO with CONDITIONS  
**Date:** 2026-04-11

---

## 🔴 Critical Issues to Fix (MUST COMPLETE BEFORE GO)

### Issue #1: Scope Boundary — Task 3.6 (Clarify Auth Page Scope)

**File:** `docs/stories/2.12.story.md`  
**Location:** Phase 3, Task 3.6  
**Severity:** BLOCKING  

**Current State:**
```markdown
- [ ] 3.6 If any auth page still uses deprecated components, create sub-task to refactor
- [ ] 3.7 Verify all auth pages have dark mode support
```

**Problem:** 
- Creates scope creep risk: "If not refactored, add to scope" is ambiguous
- Don't know if auth pages WERE refactored in Story 2.5 or not
- Could expand story scope unexpectedly during dev

**Required Fix:**
1. Verify: Were auth pages refactored in Story 2.5? (Check Story 2.5 file)
2. Update the Decision Log table to explicitly document the decision
3. Update Task 3.6 language to be explicit

**Recommended Text to Replace:**

Replace the Phase 3 paragraph (line 213-231) with:

```markdown
### Phase 3: Verify Auth Pages (from Story 2.5) — 1-2h

**Decision:** ✅ Auth pages WERE refactored in Story 2.5 (Real World Test)  
This phase is **verification only** — not refactoring. If audit finds issues, create separate epic/story for fixes.

**Task 3.1: Audit Auth Pages**

Verify that Story 2.5 (Real World Test - Auth Refactor) properly refactored:
- `app/(auth)/login/page.tsx` 
- `app/(auth)/register/page.tsx`
- `app/(auth)/change-password/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/resend-confirmation/page.tsx`

**Verification Checklist (for each file):**
- [ ] Imports Button from `@/src/components/ui/button` (not custom components)
- [ ] Imports Input from `@/src/components/ui/input` (not custom PasswordInput)
- [ ] Zero imports of deprecated components: PasswordInput, FormError
- [ ] Renders correctly in light mode (Storybook)
- [ ] Renders correctly in dark mode (Storybook)
- [ ] AXE accessibility scan: 0 CRITICAL issues
- [ ] AXE accessibility scan: 0 HIGH issues
- [ ] Keyboard navigation: Tab through all fields, focus visible

**If audit finds issues:**
- Create separate Story/Epic for auth page refactor
- DO NOT include in Story 2.12 scope
- Log finding in Change Log
```

**Then replace Task 3.1-3.7 in the Tasks section (lines 415-423) with:**

```markdown
### Phase 3: Verify Auth Pages (from Story 2.5) — 1-2h

- [ ] 3.1 `app/(auth)/login/page.tsx`:
  - [ ] grep: imports Button/Input from @/src/components/ui
  - [ ] grep: NO imports of PasswordInput or FormError
  - [ ] Storybook: renders light mode ✅
  - [ ] Storybook: renders dark mode ✅
  - [ ] AXE scan: 0 CRITICAL, 0 HIGH
  - [ ] Keyboard nav: Tab through all fields
- [ ] 3.2 `app/(auth)/register/page.tsx`: (same checks as 3.1)
  - [ ] grep: imports Button/Input
  - [ ] grep: NO deprecated components
  - [ ] Storybook: light/dark mode ✅
  - [ ] AXE scan: 0 CRITICAL/HIGH
  - [ ] Keyboard nav ✅
- [ ] 3.3 `app/(auth)/change-password/page.tsx`: (same checks as 3.1)
- [ ] 3.4 `app/(auth)/forgot-password/page.tsx`: (same checks as 3.1)
- [ ] 3.5 `app/(auth)/resend-confirmation/page.tsx`: (same checks as 3.1)
- [ ] 3.6 If audit finds issues: escalate to @po (out of scope for 2.12)
```

---

### Issue #2: Measurable Acceptance Criteria — Phase 3 AC

**File:** `docs/stories/2.12.story.md`  
**Location:** Acceptance Criteria section, line 46  
**Severity:** BLOCKING  

**Current State:**
```markdown
- [ ] **Auth Pages validated**: `app/(auth)/login/page.tsx`, ... verificadas se usam Design System (refactored in Story 2.5 Real World Test)
```

**Problem:** "Verificadas se usam" is vague. How do you measure success?

**Required Fix:**

Replace line 46 with explicit, measurable criteria:

```markdown
- [ ] **Auth Pages Verification Complete**: Each page verified for:
  - Correct component imports (Button, Input from Design System)
  - No deprecated components (PasswordInput, FormError removed)
  - Dark mode rendering correct
  - WCAG AA accessibility (AXE: 0 CRITICAL/HIGH)
  - Keyboard navigation functional
```

---

### Issue #3: Story Format — Add Standard Template

**File:** `docs/stories/2.12.story.md`  
**Location:** Add new section after line 15 (frontmatter)  
**Severity:** IMPORTANT  

**Current State:**
```markdown
# Story 2.12 — Pages Refactor — Application Pages with Design System

## 📓 Decision Log (Atlas Analyst)
```

**Problem:** Missing standard "As a... I want... so that..." story format

**Required Fix:**

Add this section after the title and before the Decision Log:

```markdown
# Story 2.12 — Pages Refactor — Application Pages with Design System

## 📖 Story

**As a** Designer/Frontend Team,  
**I want** all application pages to use consistent Design System components,  
**so that** the UI is visually consistent, accessible, and maintainable across light/dark modes

---

## 📓 Decision Log (Atlas Analyst)
```

---

### Issue #4: CodeRabbit Configuration — REMOVE

**File:** `docs/stories/2.12.story.md`  
**Location:** CodeRabbit Integration section (if exists)  
**Severity:** REMOVE  

**Current State:**
```markdown
## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type**: Frontend/UI
...
```

**Problem:**
- Hardware limitation: CodeRabbit will not be used
- Remove entire section to avoid confusion

**Solution: OPTION C (REMOVE)**

**Action:**
1. **DELETE** entire `## 🤖 CodeRabbit Integration` section from story
2. **DO NOT** add anything to `core-config.yaml`
3. **Use** manual review against Design System checklist

**Why:** Hardware constraints prevent use. QA manual validation (Phase 3.F) ensures Design System compliance.

**No CodeRabbit config needed.**

---

### Issue #5: Browser Testing Coverage Undefined

**File:** `docs/stories/2.12.story.md`  
**Location:** Phase 4 (Visual validation), line 423  
**Severity:** IMPORTANT  

**Current State:**
```markdown
### Phase 4: Final Validation & Quality (1-2h)

- [ ] 4.1 Visual validation: Render `app/page.tsx` and `app/profile/page.tsx` in light/dark mode
```

**Problem:** No specific browser list defined

**Required Fix:**

Replace line 423-430 with:

```markdown
### Phase 4: Final Validation & Quality (1-2h)

- [ ] 4.1 Visual validation: Browser compatibility
  - [ ] Chrome v100+ (light mode)
  - [ ] Chrome v100+ (dark mode)
  - [ ] Firefox v120+ (light mode)
  - [ ] Firefox v120+ (dark mode)
  - [ ] Safari 15+ (light mode)
  - [ ] Safari 15+ (dark mode)
  - [ ] Mobile (iPhone 12, 375px viewport) light mode
  - [ ] Mobile (iPhone 12, 375px viewport) dark mode
```

Then continue with existing checks:

```markdown
- [ ] 4.2 AXE accessibility scan on both pages: verify 0 CRITICAL issues
- [ ] 4.3 Keyboard navigation: Tab through all inputs, verify focus visible
- [ ] 4.4 Responsive test: mobile (sm: 640px) — pages reflow properly
- [ ] 4.5 Contrast validation: All text >= 4.5:1 in both themes
```

---

## ✅ Verification Checklist

After making these 5 fixes:

- [ ] Issue #1: Scope boundary clarified (auth pages verification only)
- [ ] Issue #2: Phase 3 AC now measurable with specific checks
- [ ] Issue #3: Standard story format added ("As a... I want...")
- [ ] Issue #4: CodeRabbit config resolved (either enabled or removed)
- [ ] Issue #5: Browser testing coverage defined (6+ browsers/modes)

---

## 📊 Quality Impact

| Issue | Before Fix | After Fix |
|-------|-----------|-----------|
| Scope clarity | ⚠️ AMBIGUOUS | ✅ EXPLICIT |
| AC measurability | ⚠️ VAGUE | ✅ PRECISE |
| Story format | ⚠️ MISSING | ✅ STANDARD |
| CodeRabbit config | ⚠️ MISMATCH | ✅ ALIGNED |
| Browser coverage | ⚠️ UNDEFINED | ✅ SPECIFIED |

**Assessment:** From **GO with CONDITIONS** → **GO (ready for @dev)**

---

## 📝 Implementation Order

1. **First:** Fix Issue #1 (Scope boundary) — most critical for planning
2. **Second:** Fix Issues #2, #3, #4, #5 (all can be parallel)
3. **Final:** Update story status from `Draft` → `Ready` (once all fixed)

---

**Next:** Apply these fixes to `docs/stories/2.12.story.md`, then I'll approve and story moves to `Ready` status for @dev to start implementation.

— Pax, equilibrando prioridades 🎯
