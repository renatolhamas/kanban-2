# Phase 1: Foundation — Deploy Token System

**Goal:** Integrate design tokens with ZERO visual changes

**Timeline:** 1 sprint (3-5 days)  
**Effort:** 2-4 hours  
**Risk:** ⚫⚪⚪⚪⚪ LOW

---

## Overview

Phase 1 is the safety foundation. We deploy the token system without touching any components. This ensures:

- ✅ All tokens are accessible in the build
- ✅ Build system correctly processes tokens
- ✅ No visual regressions from token deployment
- ✅ Zero code changes needed (next phase handles components)

---

## Pre-Flight Checklist

Before starting Phase 1:

- [ ] You have read [MIGRATION-STRATEGY.md](./MIGRATION-STRATEGY.md)
- [ ] Token files exist in `src/tokens/` (tokens.json, tokens.yaml, tokens.css, tokens.tailwind.js)
- [ ] Tailwind config at `tailwind.config.js` exists
- [ ] Build system configured (Next.js with Tailwind)
- [ ] You have access to modify `tailwind.config.js`

---

## Tasks

### Task 1: Verify Token Files Exist

**Objective:** Confirm all token files are in place

**Steps:**

1. Navigate to `src/tokens/` directory
2. Verify these files exist:
   - ✅ `index.ts` — Central export
   - ✅ `tokens.json` — JSON format
   - ✅ `tokens.yaml` — Source of truth
   - ✅ `tokens.css` — CSS custom properties
   - ✅ `tokens.tailwind.js` — Tailwind config

**Validation:**
```bash
# All files should exist
ls -la src/tokens/
```

**Expected Output:**
```
-rw-r--r-- tokens.css
-rw-r--r-- tokens.json
-rw-r--r-- tokens.tailwind.js
-rw-r--r-- tokens.yaml
-rw-r--r-- index.ts
```

**If Missing:** Run `*tokenize` command from Phase 3 to generate tokens

---

### Task 2: Verify Tailwind Configuration

**Objective:** Ensure Tailwind loads design tokens

**Steps:**

1. Open `tailwind.config.js`
2. Verify token import:

```javascript
const tokens = require('./src/tokens/tokens.tailwind.js');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: tokens  // ← Tokens loaded here
  },
  plugins: [],
};
```

3. If not present, add:
```javascript
const tokens = require('./src/tokens/tokens.tailwind.js');

// ... existing config
theme: {
  extend: tokens  // ← Add this line
}
```

**Validation:**
```bash
npm run build
```

Should complete without errors.

---

### Task 3: Verify CSS Custom Properties

**Objective:** Ensure tokens.css is imported in styles

**Steps:**

1. Open `src/app/globals.css` (or your global CSS file)
2. Add import at top:

```css
@import url('@/tokens/tokens.css');
```

Or if using CSS modules:

```css
@import '@/tokens/tokens.css';
```

**Validation:**

Open browser dev tools and inspect any element:

```
Computed Styles → Filter for "--color"
```

You should see CSS custom properties like:
- `--color-primary: #0d631b`
- `--color-surface: #f7f9fc`
- etc.

If not visible, CSS import failed.

---

### Task 4: Build & Test

**Objective:** Verify zero visual regressions from token deployment

**Steps:**

1. Clean build:
```bash
npm run build
```

Expected: ✅ Build succeeds with no errors

2. Type check:
```bash
npm run typecheck
```

Expected: ✅ No TypeScript errors

3. Lint check:
```bash
npm run lint
```

Expected: ✅ No lint errors

4. Storybook check (if installed):
```bash
npm run storybook
```

Expected: ✅ Storybook loads, components render

---

### Task 5: Visual Regression Test

**Objective:** Confirm no visual changes from token deployment

**Approach:** Manual visual inspection (automated testing comes later)

**Steps:**

1. Start dev server:
```bash
npm run dev
```

2. Navigate to each route and verify appearance:
   - [ ] `/` — Kanban Board (check Header, Sidebar)
   - [ ] `/contacts` — Contacts (check Header)
   - [ ] `/settings` — Settings (check Header, Sidebar)
   - [ ] `/login` — Login page (check Header without UserMenu)

3. Check dark mode (if implemented):
   - [ ] Toggle theme and verify colors still correct
   - [ ] No flashing or color shifts

4. Specific component checks:
   - [ ] **Header**: Logo, page title, theme toggle, user menu (unchanged)
   - [ ] **Sidebar**: Navigation items, active states (unchanged)
   - [ ] **UserMenu**: Dropdown appearance (unchanged)

**Expected Result:** Visual appearance identical to before Phase 1

---

## Success Criteria

✅ All criteria must be met before moving to Phase 2:

- [ ] Token files verified (Task 1)
- [ ] Tailwind configuration correct (Task 2)
- [ ] CSS custom properties accessible (Task 3)
- [ ] Build succeeds without errors (Task 4)
- [ ] No visual regressions (Task 5)
- [ ] Dark mode works (if applicable)

---

## Rollback Plan

If Phase 1 causes visual issues:

**Step 1:** Remove token imports

Edit `tailwind.config.js`:
```javascript
// Remove this line:
// const tokens = require('./src/tokens/tokens.tailwind.js');

module.exports = {
  content: [...],
  theme: {
    extend: {}  // ← Remove tokens from here
    // colors: { /* original colors */ }
  },
};
```

Edit `src/app/globals.css`:
```css
/* Remove this line: */
/* @import url('@/tokens/tokens.css'); */
```

**Step 2:** Verify rollback

```bash
npm run build
npm run dev
```

Visual appearance should revert to pre-Phase 1.

**Estimated Time:** 15-30 minutes

---

## Troubleshooting

### Build Fails: "Cannot find module '@/tokens/tokens.tailwind.js'"

**Cause:** Path mismatch or file doesn't exist

**Solution:**
1. Verify file exists: `ls -la src/tokens/tokens.tailwind.js`
2. Check path in `tailwind.config.js` — use relative path: `'./src/tokens/tokens.tailwind.js'`
3. Rebuild: `npm run build`

---

### CSS Custom Properties Not Accessible

**Cause:** CSS import not loaded

**Solution:**
1. Verify import in `src/app/globals.css`
2. Check import is at TOP of file (before other styles)
3. Use correct path: `@import url('@/tokens/tokens.css');`
4. Clear cache: `rm -rf .next && npm run build`

---

### Visual Changes After Phase 1

**Cause:** Existing CSS using same color values as tokens — no issue

**Solution:**
- This is normal if tokens match existing colors
- Continue to Phase 2
- Phase 2 will refactor components to use tokens explicitly

---

## Documentation

After Phase 1 complete, update:

- [ ] Add entry to MIGRATION-STRATEGY.md: "✅ Phase 1 Complete"
- [ ] Update project status: "Foundation established"
- [ ] Link Phase 2 guide: "Next: [Phase 2: High-Impact](./MIGRATION-PHASE-2.md)"

---

## Next Steps

Once Phase 1 is complete with all criteria met:

1. ✅ Review success criteria checklist
2. ✅ Document any issues encountered
3. ✅ Notify team: "Foundation ready for Phase 2"
4. → **Proceed to [Phase 2: High-Impact](./MIGRATION-PHASE-2.md)**

---

**Timeline:** 1 sprint (3-5 days)  
**Effort:** 2-4 hours  
**Start Date:** [Your sprint start]  
**Target Completion:** [Your sprint start + 3-5 days]

---

**Status:** ✅ PHASE 1 READY

See [MIGRATION-STRATEGY.md](./MIGRATION-STRATEGY.md) for overview
