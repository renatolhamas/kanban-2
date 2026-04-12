# Issue #2: Phase 3 Refactored — Auth Pages Complete Refactor
## Story 2.12: Pages Refactor — Design System Full Compliance

**Status:** Replaces original vague Phase 3 with detailed, page-by-page specification  
**Based on:** Detailed audit from AUDIT-2026-04-11_auth-pages-detailed-analysis.md  
**Goal:** 100% Design System compliance, all 5 auth pages  

---

## 📋 PHASE 3: REFACTOR ALL AUTH PAGES (4-6 hours)

### Discovery Finding
**Story 2.5 refactored ONLY:** `/login`, `/register` (with issues remaining)  
**NOT refactored:** `/change-password`, `/forgot-password`, `/resend-confirmation`  
**Decision:** Expand Story 2.12 Phase 3 to include complete refactor of ALL 5 auth pages

### Phase 3 Approach
**Sub-phases:**
- 3.A: Fix Login page (resolve remaining issues)
- 3.B: Fix Register page (resolve remaining issues + remove PasswordInput)
- 3.C: Complete refactor Change-Password (currently 1% compliant)
- 3.D: Complete refactor Forgot-Password (currently 1% compliant)
- 3.E: Complete refactor Resend-Confirmation (currently 1% compliant)

---

## 🔴 PHASE 3.A: LOGIN PAGE COMPLETE REFACTOR (1h)

### File: `components/LoginPageContent.tsx`

#### ✅ Already Compliant
- [x] Uses `bg-surface` for page background
- [x] Uses `bg-surface-lowest` for form container
- [x] Hero section structure (icon + title + subtitle)
- [x] Uses `font-manrope` typography
- [x] Layout spacing respects editorial scale
- [x] Uses `Input` component from Design System
- [x] Uses `Button` component from Design System
- [x] Uses `useToast()` hook for notifications
- [x] Loading state with Loader2 spinner

#### ❌ Issues to Fix

**Issue 3.A.1: Dark Mode Support Missing**
- [ ] Line 51: Add dark mode variant
  ```jsx
  // CURRENT
  <div className="min-h-screen bg-surface flex ..."
  
  // FIX
  <div className="min-h-screen bg-surface dark:bg-surface-dark flex ..."
  ```
- [ ] Line 74-75: Add dark mode to text colors
  ```jsx
  // CURRENT
  <p className="mt-4 text-center text-base text-on-surface/70 font-manrope">
  
  // FIX
  <p className="mt-4 text-center text-base text-on-surface/70 dark:text-on-surface-dark/70 font-manrope">
  ```

**Issue 3.A.2: Focus Ring Consistency (Button)**
- [ ] Verify Button focus ring matches Input focus ring
  - Input uses: `focus:ring-2 focus:ring-emerald-500/20`
  - Button uses: `focus:ring-2 focus:ring-emerald-500` (should be `/20`)
  - **Action:** Document in Button.tsx refactor (separate story if needed)

**Validation Checklist:**
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] Visual test light mode — ✅
- [ ] Visual test dark mode — ✅
- [ ] Keyboard nav: Tab through email → password → button
- [ ] AXE accessibility scan — 0 CRITICAL, 0 HIGH
- [ ] WCAG AA contrast verified (4.5:1 minimum)

---

## 🔴 PHASE 3.B: REGISTER PAGE COMPLETE REFACTOR (1.5h)

### File: `components/RegisterForm.tsx` (+ RegisterPageContent)

#### ✅ Already Compliant
- [x] Uses `bg-surface` and `bg-surface-lowest`
- [x] Hero section present
- [x] Uses `font-manrope`
- [x] Uses `Input` component
- [x] Uses `Button` component
- [x] Uses `useToast()` hook
- [x] Loading state with Loader2

#### ❌ Issues to Fix

**Issue 3.B.1: PasswordInput Custom Component Still in Use**
- [ ] Line 7: Remove deprecated PasswordInput import
  ```jsx
  // CURRENT
  import { PasswordInput } from "./PasswordInput";
  
  // FIX
  // DELETE this line entirely
  ```

- [ ] Line 18-19, 54-56: Replace PasswordInput with Input component
  ```jsx
  // CURRENT (if using PasswordInput for confirmPassword)
  <PasswordInput
    id="confirm-password"
    value={confirmPassword}
    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
  />
  
  // FIX
  <Input
    id="confirm-password"
    type="password"
    label="Confirm Password"
    value={confirmPassword}
    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
    placeholder="••••••••"
    error={confirmPasswordError || undefined}
    disabled={loading}
  />
  ```

- [ ] Verify password validation shows in Input error prop, not custom component

**Issue 3.B.2: Dark Mode Support Missing (RegisterPageContent.tsx)**
- [ ] Line 52: Add dark mode to page background
  ```jsx
  <div className="min-h-screen bg-surface dark:bg-surface-dark ..."
  ```
- [ ] Line 75-76: Add dark mode to text colors
  ```jsx
  <p className="... text-on-surface/70 dark:text-on-surface-dark/70 ..."
  ```

**Issue 3.B.3: Password Strength Indicator (OPTIONAL — Document Decision)**
- [ ] Story 2.5 mentions "showStrength: true" for PasswordInput
- [ ] Decide: Include password strength visual, or document as deferred?
- [ ] If including: Add visual indicator (weak/medium/strong) using Input helper text
- [ ] If deferring: Add comment explaining decision

**Validation Checklist:**
- [ ] No PasswordInput import anywhere in the file
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] Visual test light mode — ✅
- [ ] Visual test dark mode — ✅
- [ ] Keyboard nav: Tab through name → email → password → confirm → button
- [ ] AXE accessibility scan — 0 CRITICAL, 0 HIGH
- [ ] Password validation errors show inline via Input
- [ ] Success Toast shows before redirect

---

## 🔴 PHASE 3.C: CHANGE-PASSWORD PAGE COMPLETE REFACTOR (1.5h)

### File: `components/ChangePasswordPageContent.tsx` (+ ChangePasswordForm)

**Current Status:** 1/10 conformity — MAJOR refactor needed

#### ❌ All Issues to Fix (10 critical items)

**Issue 3.C.1: Replace Hardcoded Page Background**
- [ ] Line 35: Replace hardcoded color with design token
  ```jsx
  // CURRENT
  <div className="min-h-screen bg-[#f8fafc] flex ..."
  
  // FIX
  <div className="min-h-screen bg-surface dark:bg-surface-dark flex ..."
  ```

**Issue 3.C.2: Replace Hardcoded Icon Container**
- [ ] Line 38: Replace hardcoded blue with primary color
  ```jsx
  // CURRENT
  <div className="w-12 h-12 bg-blue-600 rounded-2xl ... shadow-xl shadow-blue-500/30">
  
  // FIX
  <div className="w-12 h-12 bg-primary dark:bg-primary-dark rounded-lg shadow-ambient">
  ```

**Issue 3.C.3: Replace Hardcoded Typography**
- [ ] Line 49: Fix heading color + add font + dark mode
  ```jsx
  // CURRENT
  <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
  
  // FIX
  <h2 className="text-center text-3xl font-semibold text-on-surface dark:text-on-surface-dark tracking-tight font-manrope">
  ```

- [ ] Line 52: Fix paragraph color + add font + dark mode
  ```jsx
  // CURRENT
  <p className="mt-2 text-center text-sm text-gray-600">
  
  // FIX
  <p className="mt-2 text-center text-sm text-on-surface/70 dark:text-on-surface-dark/70 font-manrope">
  ```

**Issue 3.C.4: Replace Hardcoded Form Container**
- [ ] Line 58: Complete refactor of form container
  ```jsx
  // CURRENT
  <div className="bg-white py-10 px-4 shadow-2xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
  
  // FIX
  <div className="bg-surface-lowest dark:bg-surface-lowest-dark py-10 px-6 shadow-ambient rounded-lg">
  // NOTE: Remove border entirely (Design System has no 1px borders)
  // NOTE: Change rounded-3xl to rounded-lg (8px, not 24px)
  // NOTE: Change px-4 sm:px-12 to consistent px-6
  ```

**Issue 3.C.5: Replace Custom Error Display (CRITICAL)**
- [ ] Lines 61-82: Remove custom error div entirely
  ```jsx
  // CURRENT (DELETE ALL)
  {error && (
    <div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl ...">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" ...>...</svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    </div>
  )}
  ```

- [ ] Replace with Input error prop (in ChangePasswordForm)
  ```jsx
  // FIX: In ChangePasswordForm component
  <Input
    id="password"
    type="password"
    label="New Password"
    error={passwordError || undefined}
    // ... other props
  />
  ```

- [ ] Add Toast for global error messages
  ```jsx
  // In ChangePasswordPageContent
  const { addToast } = useToast();
  
  const handleError = (errorMessage: string | null) => {
    if (errorMessage) {
      addToast(errorMessage, "error");
    }
    setError(errorMessage);
  };
  ```

**Issue 3.C.6: Fix Success Toast (if custom)**
- [ ] Line 86-92: Verify Toast component usage
  ```jsx
  // CURRENT
  {successMessage && (
    <Toast
      message={successMessage}
      type="success"
      onClose={() => setSuccessMessage(null)}
    />
  )}
  
  // FIX: Should be using useToast hook instead
  const { addToast } = useToast();
  const handleSuccess = () => {
    addToast("Password successfully updated!", "success");
  };
  ```

**Issue 3.C.7: Use Button Component (in ChangePasswordForm)**
- [ ] Verify form submit button uses Button component
  ```jsx
  // EXPECTED
  import { Button } from "@/components/common/Button";
  
  <Button
    type="submit"
    variant={loading ? "disabled" : "primary"}
    disabled={loading}
    className="w-full"
  >
    {loading ? "Updating..." : "Update Password"}
  </Button>
  ```

**Issue 3.C.8: Use Input Component (in ChangePasswordForm)**
- [ ] Verify ALL form inputs use Input component
  ```jsx
  // EXPECTED
  import { Input } from "@/components/common/Input";
  
  <Input
    id="new-password"
    type="password"
    label="New Password"
    error={passwordError || undefined}
    // ... other props
  />
  ```

**Issue 3.C.9: Add Dark Mode to All Colors**
- [ ] Verify NO hardcoded colors remain in file
- [ ] All background colors have `dark:` variant
- [ ] All text colors have `dark:` variant
- [ ] All borders removed (Design System rule)

**Issue 3.C.10: Add Font Manrope to Typography**
- [ ] Line 49, 52: Verify `font-manrope` added to all text
- [ ] Verify font weights: `font-semibold` (headings), `font-normal` (body)

**Validation Checklist:**
- [ ] No hardcoded colors (use `bg-surface`, `text-on-surface`, etc)
- [ ] No hardcoded `#` colors anywhere
- [ ] All colors have `dark:` variants
- [ ] No borders in entire file
- [ ] `rounded-lg` only (no `rounded-2xl`, `rounded-3xl`)
- [ ] `font-manrope` on all text
- [ ] No custom error divs (use Input error + Toast)
- [ ] Button component used for submit
- [ ] Input component used for all fields
- [ ] Toast via `useToast()` hook, not direct import
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run lint` — 0 errors
- [ ] Visual test light mode — ✅
- [ ] Visual test dark mode — ✅
- [ ] AXE accessibility scan — 0 CRITICAL, 0 HIGH
- [ ] WCAG AA contrast verified (4.5:1 minimum)

---

## 🔴 PHASE 3.D: FORGOT-PASSWORD PAGE COMPLETE REFACTOR (1.5h)

### File: `components/ForgotPasswordPageContent.tsx` (+ ForgotPasswordForm)

**Current Status:** 1/10 conformity — Identical issues to Change-Password

#### ❌ All 10 Issues Apply (see Phase 3.C checklist)

**Additional Issue 3.D.1: Toast Import Incorreto**
- [ ] Line 5: Change from component import to hook import
  ```jsx
  // CURRENT
  import { Toast } from "@/components/Toast";
  
  // FIX
  import { useToast } from "@/components/common/useToast";
  ```

- [ ] Update usage throughout component
  ```jsx
  // FIX
  const { addToast } = useToast();
  
  const handleSuccess = () => {
    addToast("Password reset link sent! Check your email.", "success");
  };
  
  const handleError = (errorMessage: string | null) => {
    if (errorMessage) {
      addToast(errorMessage, "error");
    }
  };
  
  // Remove: {successMessage && <Toast ... />} pattern
  ```

**Validation Checklist:** (Same as 3.C, plus)
- [ ] No direct `import { Toast }` remaining
- [ ] Using `useToast()` hook
- [ ] Success/error messages via `addToast()` calls

---

## 🔴 PHASE 3.E: RESEND-CONFIRMATION PAGE COMPLETE REFACTOR (1.5h)

### File: `components/ResendConfirmationPageContent.tsx` (+ ResendConfirmationForm)

**Current Status:** 1/10 conformity — Identical issues to Forgot-Password

#### ❌ All 10 Issues Apply (see Phase 3.C + 3.D checklist)

**Validation Checklist:** (Same as 3.D)

---

## 📊 PHASE 3 TASK BREAKDOWN (Updated Tasks/Subtasks)

### Phase 3.A: Login Page (1h)

- [ ] 3.A.1 Read LoginPageContent.tsx audit findings
- [ ] 3.A.2 Add dark mode support to page background (line 51)
- [ ] 3.A.3 Add dark mode support to typography (line 74-75)
- [ ] 3.A.4 Document Button focus ring issue for future refactor
- [ ] 3.A.5 Run typecheck, lint, visual tests (light + dark mode)
- [ ] 3.A.6 Run AXE accessibility scan — verify 0 CRITICAL/HIGH
- [ ] 3.A.7 Verify WCAG AA contrast — all text >= 4.5:1 in both themes

### Phase 3.B: Register Page (1.5h)

- [ ] 3.B.1 Read RegisterPageContent.tsx + RegisterForm.tsx audit findings
- [ ] 3.B.2 Remove PasswordInput import from RegisterForm (line 7)
- [ ] 3.B.3 Replace PasswordInput with Input component for confirmPassword
- [ ] 3.B.4 Add dark mode to RegisterPageContent (line 52, 75-76)
- [ ] 3.B.5 Decide: Include password strength indicator or defer?
- [ ] 3.B.6 Document password validation decision in story
- [ ] 3.B.7 Run typecheck, lint, visual tests (light + dark mode)
- [ ] 3.B.8 Run AXE accessibility scan — verify 0 CRITICAL/HIGH
- [ ] 3.B.9 Verify WCAG AA contrast

### Phase 3.C: Change-Password Page (1.5h)

- [ ] 3.C.1 Read ChangePasswordPageContent audit findings
- [ ] 3.C.2 Replace hardcoded bg-[#f8fafc] with bg-surface dark:bg-surface-dark
- [ ] 3.C.3 Replace hardcoded bg-blue-600 with bg-primary dark:bg-primary-dark
- [ ] 3.C.4 Fix icon shadow: shadow-2xl shadow-gray-200/50 → shadow-ambient
- [ ] 3.C.5 Fix icon rounded: rounded-2xl → rounded-lg
- [ ] 3.C.6 Fix headings: Add font-manrope, font-semibold, fix colors
- [ ] 3.C.7 Fix paragraph: Add font-manrope, fix colors with dark: variants
- [ ] 3.C.8 Replace form container: bg-white → bg-surface-lowest, fix shadow, remove border, fix rounded
- [ ] 3.C.9 Delete entire custom error div (lines 61-82)
- [ ] 3.C.10 Update ChangePasswordForm: Verify Input components used
- [ ] 3.C.11 Update ChangePasswordForm: Verify Button component used
- [ ] 3.C.12 Update success/error handling: Use useToast() hook instead of custom Toast
- [ ] 3.C.13 Verify no hardcoded colors remain anywhere
- [ ] 3.C.14 Run typecheck, lint, visual tests (light + dark)
- [ ] 3.C.15 Run AXE scan — verify 0 CRITICAL/HIGH
- [ ] 3.C.16 Verify WCAG AA contrast

### Phase 3.D: Forgot-Password Page (1.5h)

- [ ] 3.D.1 Read ForgotPasswordPageContent audit findings
- [ ] 3.D.2-3.D.9 (Repeat 3.C.2-3.C.9 fixes for Forgot-Password)
- [ ] 3.D.10 Change Toast import: `import { Toast }` → `import { useToast }`
- [ ] 3.D.11 Update success/error: Use `const { addToast } = useToast()`
- [ ] 3.D.12 Verify no direct Toast component import
- [ ] 3.D.13 Run typecheck, lint, visual tests (light + dark)
- [ ] 3.D.14 Run AXE scan — verify 0 CRITICAL/HIGH
- [ ] 3.D.15 Verify WCAG AA contrast

### Phase 3.E: Resend-Confirmation Page (1.5h)

- [ ] 3.E.1 Read ResendConfirmationPageContent audit findings
- [ ] 3.E.2-3.E.9 (Repeat 3.C.2-3.C.9 fixes for Resend-Confirmation)
- [ ] 3.E.10-3.E.11 (Repeat 3.D.10-3.D.11 Toast fixes)
- [ ] 3.E.12 Run typecheck, lint, visual tests (light + dark)
- [ ] 3.E.13 Run AXE scan — verify 0 CRITICAL/HIGH
- [ ] 3.E.14 Verify WCAG AA contrast

### Phase 3.F: Cross-Page Validation (1h)

- [ ] 3.F.1 Compare all 5 pages side-by-side for visual consistency
- [ ] 3.F.2 Verify all pages use identical layout structure
- [ ] 3.F.3 Verify all pages have same button styles/spacing
- [ ] 3.F.4 Verify all pages have same input styles/spacing
- [ ] 3.F.5 Verify all pages support dark mode identically
- [ ] 3.F.6 Run full test suite: `npm run test` — all passing
- [ ] 3.F.7 Run full lint: `npm run lint` — 0 errors
- [ ] 3.F.8 Run full typecheck: `npm run typecheck` — 0 errors
- [ ] 3.F.9 Create Storybook stories for all 5 pages (if not existing)
- [ ] 3.F.10 Final AXE scan across all pages

---

## ✅ ACCEPTANCE CRITERIA (Updated)

### Auth Pages Refactor (Core)

- [ ] **All 5 auth pages refactored:** `/login`, `/register`, `/change-password`, `/forgot-password`, `/resend-confirmation`
- [ ] **100% Design System Compliance:** Each page verified against audit checklist
- [ ] **No Hardcoded Colors:** All colors use design tokens (bg-surface, text-on-surface, etc)
- [ ] **Dark Mode Complete:** All colors have dark: variants, light + dark mode renders correctly
- [ ] **No 1px Borders:** All borders removed, tonal hierarchy only
- [ ] **Border Radius Consistent:** All rounded-lg (8px), no rounded-2xl or rounded-3xl
- [ ] **Manrope Typography:** All text uses font-manrope, proper font weights
- [ ] **Button Component:** Submit buttons use Button from Design System
- [ ] **Input Component:** All form fields use Input from Design System
- [ ] **No PasswordInput:** Deprecated component completely removed
- [ ] **Toast Hook:** All success/error via useToast() hook, no direct imports

### Design System Application

- [ ] **Component Usage:** All pages use Button, Input, Card from Design System
- [ ] **Dark Mode Support:** Ambas as páginas refatoradas renderizam corretamente em light e dark mode
- [ ] **Responsive Layout:** Pages mantêm usabilidade em mobile (Tailwind breakpoints: sm, md, lg, xl)

### Accessibility & Quality

- [ ] **Keyboard Navigation:** Tab/Shift+Tab/Enter/Esc funcionam em formulários de todas as páginas
- [ ] **ARIA & Semantic HTML:** Inputs têm labels apropriados, buttons têm roles corretos
- [ ] **WCAG AA Compliance:** Contrast ratios >= 4.5:1 em ambos os temas (TODAS as 5 páginas)
- [ ] **Nenhuma Regressão:** Funcionalidade de login/register/change-password/forgot/resend preservada

### Quality Gates

- [ ] **Build Sucesso:** `npm run build` passes sem erros
- [ ] **Linting Sucesso:** `npm run lint` passes com 0 erros
- [ ] **Type Checking Sucesso:** `npm run typecheck` passes com 0 erros
- [ ] **Existing Tests Passing:** Testes existentes de páginas passam, nenhuma regressão
- [ ] **AXE Accessibility:** All 5 pages: 0 CRITICAL, 0 HIGH violations

---

## 📈 EFFORT ESTIMATE (UPDATED)

| Phase | Task | Original | New | Notes |
|-------|------|----------|-----|-------|
| 3.A | Login refactor | 0.5h | 1h | Add dark mode |
| 3.B | Register refactor | 0.5h | 1.5h | Remove PasswordInput, add dark mode |
| 3.C | Change-Password | 0h | 1.5h | **NEW - Complete refactor** |
| 3.D | Forgot-Password | 0h | 1.5h | **NEW - Complete refactor** |
| 3.E | Resend-Confirmation | 0h | 1.5h | **NEW - Complete refactor** |
| 3.F | Cross-page validation | 1h | 1h | Consistency checks |
| **Total** | **Phase 3** | **2h** | **8h** | **4x expansion** |

**Overall Story Estimate:**
- Home refactor: 1-2h
- Profile refactor: 2-3h
- **Auth pages refactor: 8h** (UPDATED)
- Final validation: 1-2h
- **Story Total: 12-15h** (vs original 6-8h)

---

## 📝 SUCCESS CRITERIA (All or Nothing)

✅ **Phase 3 is DONE when ALL 5 pages are 100% compliant:**

```
[ ] 0 hardcoded colors anywhere
[ ] 0 pages missing dark mode
[ ] 0 custom error displays
[ ] 0 borders in any page
[ ] 0 rounded-2xl or rounded-3xl (all rounded-lg)
[ ] 0 missing font-manrope
[ ] 0 direct Toast imports (all useToast hook)
[ ] 5/5 pages using Button component
[ ] 5/5 pages using Input component
[ ] 0 PasswordInput imports anywhere
[ ] 5/5 pages WCAG AA compliant (4.5:1 contrast)
[ ] npm run typecheck: 0 errors
[ ] npm run lint: 0 errors
[ ] npm run build: SUCCESS
[ ] AXE scan all pages: 0 CRITICAL, 0 HIGH
```

**If any criteria is not met, Phase 3 returns to @dev for fixes.**

---

## 📎 References

- **Detailed Audit:** `docs/qa/AUDIT-2026-04-11_auth-pages-detailed-analysis.md`
- **Design System Standards:** Stories 2.1-2.11, Design Tokens (Story 2.7), Dark Mode (Story 2.10)
- **Component Documentation:** See components/common/Button.tsx, Input.tsx
- **Accessibility:** WCAG 2.1 Level AA, AXE DevTools

---

**This Phase 3 specification is binding. All items must be completed to achieve 100% Design System compliance.**

— Pax, garantindo qualidade ao máximo detalhe 🎯
