# QA Fix Request — Story 2.6 (UI Expansion - Layout & Data Components)

**From:** Quinn (QA)  
**To:** @dev (Dex)  
**Story/Component:** 2.6  
**Gate Status:** FAIL  
**Date:** 2026-04-11

---

## 🔴 Critical Issues to Fix

### Issue 1: TypeScript - Storybook Import Error (Stories)
**Severity:** BLOCKING

**Files:** 
- `components/common/Avatar.stories.tsx` (line 1)
- `components/common/Badge.stories.tsx` (line 1)
- `components/common/Card.stories.tsx` (line 1)
- `components/common/Modal.stories.tsx` (line 1)
- `components/common/Tabs.stories.tsx` (line 1)

**Current:**
```typescript
import type { Meta, StoryObj } from "@storybook/nextjs";
```

**Problem:** `@storybook/nextjs` module is not found or not properly declared. TypeScript compiler cannot resolve this import, causing build to fail during `npm run typecheck`.

**Fix:** Import from `@storybook/nextjs-vite` (modern Vite-based framework for Next.js projects):
```typescript
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
```

**Why `@storybook/nextjs-vite`?**
- ✅ This project is already configured to use Vite (verified in `.storybook/main.ts`)
- ✅ Faster builds and better test support with Vite
- ✅ Modern, simpler configuration
- ✅ No custom Webpack/Babel configurations in this project (checked `next.config.js`)
- ✅ **DECISION: Use `@storybook/nextjs-vite` for all 5 story files**

**Verification:** Run `npm run typecheck` and confirm no errors on these lines.

---

### Issue 2: TypeScript - Badge.test.tsx Missing Required Prop
**Severity:** HIGH

**File:** `components/common/Badge.test.tsx` (line 193)

**Current:**
```typescript
it("renders even with empty content", () => {
  const { container } = render(<Badge></Badge>);  // ❌ children is required
  expect(container.firstChild).toBeInTheDocument();
});
```

**Problem:** `BadgeProps` interface defines `children: React.ReactNode` as required. Test is attempting to render `<Badge></Badge>` without children, violating TypeScript contract.

**Fix:** Provide minimum content:
```typescript
it("renders even with empty content", () => {
  const { container } = render(<Badge>·</Badge>);  // Provide minimal content
  expect(container.firstChild).toBeInTheDocument();
});
```

**Verification:** Run `npm run typecheck` and confirm Badge.test.tsx has no errors.

---

### Issue 3: TypeScript - Modal.tsx Interface Type Mismatch
**Severity:** HIGH

**File:** `components/common/Modal.tsx` (line 4)

**Current:**
```typescript
export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
  title?: React.ReactNode;  // ❌ Conflicts with HTMLAttributes
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Problem:** Interface extends `HTMLAttributes<HTMLDivElement>` (which defines `title: string`), but ModalProps defines `title?: React.ReactNode`. These are incompatible types.

**Fix:** Use `Omit<>` to exclude conflicting `title` property from HTMLAttributes:

```typescript
export interface ModalProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  onOpenChange?: (_open: boolean) => void;
  title?: React.ReactNode;  // ✅ Now compatible with HTMLAttributes
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Why this approach?**
- ✅ Resolves type conflict cleanly
- ✅ Maintains HTMLAttributes support (`className`, `id`, `data-testid`, etc.)
- ✅ No breaking changes
- ✅ Industry standard (Material-UI, Chakra UI use this pattern)
- ✅ Supports future design system scaling

**Verification:** Run `npm run typecheck` and confirm Modal.tsx has no type errors.

---

## ✅ Verification Checklist

- [ ] All 5 stories (Avatar, Badge, Card, Modal, Tabs) import from correct Storybook package
- [ ] Badge.test.tsx provides children prop in empty content test
- [ ] Modal.tsx ModalProps interface resolves type conflict with HTMLAttributes
- [ ] TypeScript check passes: `npm run typecheck` (zero errors)
- [ ] Linting passes: `npm run lint` (still passing)
- [ ] Tests pass: `npm run test` (205+ tests still passing)
- [ ] No build errors when running `npm run build`

---

## 📝 QA Gate Re-Review Process

1. @dev implements all fixes above
2. @dev runs verification checklist
3. @dev commits fixes and notifies @qa
4. @qa re-runs gate with `*gate 2.6`
5. @qa updates gate verdict (PASS/CONCERNS/FAIL/WAIVED)

---

## 📁 References

- **Story:** docs/stories/2.6.story.md
- **TypeScript Config:** tsconfig.json
- **Storybook Config:** .storybook/

---

## Summary

**Total Issues:** 3 CRITICAL/HIGH  
**Files Affected:** 6 files  
**Root Cause:** TypeScript configuration and type system compliance  
**Time to Fix (Est.):** 15-30 minutes  
**Blocking Merge:** YES — TypeScript errors must be resolved before merging

