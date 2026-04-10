# QA Fix Request — Story 2.2: The Lab (Storybook Setup)

**From:** Quinn (QA)  
**To:** @dev (Dex)  
**Story/Component:** 2.2  
**Gate Status:** CONCERNS  
**Date:** 2026-04-10

---

## 🔴 Issues to Fix

### Issue 1: ESLint Violation in SmokeTest.stories.tsx (Severity: HIGH)

**File:** [components/common/SmokeTest.stories.tsx](../../components/common/SmokeTest.stories.tsx)  
**Location:** Line 1  
**Current:**
```typescript
import type { Meta, StoryObj } from "@storybook/react";
```

**Problem:** Storybook ESLint plugin rule (`storybook/no-renderer-packages`) forbids importing renderer packages directly. Must use the framework-specific package (`@storybook/nextjs-vite`).

**Fix:**
```typescript
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
```

**Verification:** Run `npm run lint` — should pass without errors in SmokeTest.stories.tsx.

---

### Issue 2: ESLint Config Missing storybook-static Ignore (Severity: MEDIUM)

**File:** [eslint.config.js](../../eslint.config.js)  
**Location:** Line 8 (ignores array)  
**Current:**
```javascript
ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', '.aiox-core/**', 'squads/**']
```

**Problem:** Generated Storybook files in `storybook-static/` are being linted even though they're gitignored. This causes ~200 lint errors in minified code.

**Fix:** Add `storybook-static/**` to the ignores array:
```javascript
ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', '.aiox-core/**', 'squads/**', 'storybook-static/**']
```

**Verification:** Run `npm run lint` — errors from storybook-static should disappear.

---

## ✅ Verification Checklist

- [ ] Fix Issue 1: Update import in SmokeTest.stories.tsx
- [ ] Fix Issue 2: Add storybook-static to eslint ignores
- [ ] Run `npm run lint` — should pass with no errors
- [ ] Run `npm test` — should still pass
- [ ] Run `npm run build-storybook` — should still pass
- [ ] No regressions in other tests

---

## 📝 QA Gate Re-Review Process

1. @dev implements fixes above
2. @dev runs verification checklist
3. @dev notifies @qa (link to commit)
4. @qa re-runs gate with `*gate 2.2`
5. @qa updates gate verdict to PASS

---

## 🎯 Summary

**Functionality:** ✅ Complete  
**Tests:** ✅ Passing  
**Acceptance Criteria:** ✅ All met  
**Code Quality:** ⚠️ ESLint violations block merge

This is a quick fix — ~2 lines of code to correct. Once fixed, story is ready to merge.

---

**References:**
- **Story:** docs/stories/2.2.story.md
- **Storybook ESLint Rule:** [storybook/no-renderer-packages](https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-renderer-packages.md)
