# Phase 3: Long-Tail Cleanup

**Goal:** Consolidate remaining patterns and edge cases

**Timeline:** 1-2 sprints (7-14 days)  
**Effort:** 6-8 hours  
**Risk:** ⚫⚫⚪⚪⚪ LOW

---

## Overview

Phase 3 handles the remaining edge cases and ensures 100% adoption of design tokens:

- ✅ Sheet component styling (mobile drawer)
- ✅ Remaining hardcoded colors in layout
- ✅ Focus states standardization
- ✅ Hover states consistency
- ✅ Dark mode refinement

This phase is low-risk because all patterns are proven in Phases 1-2.

---

## Tasks

### Task 3.1: Refactor Sheet Component

**File:** `src/components/layout/Sheet.tsx` (if exists)

**Objective:** Style sheet using Card component tokens

**Current Patterns:**
```tsx
// Sheet backdrop
bg-black/50 dark:bg-black/60

// Sheet panel
bg-white dark:bg-gray-800
border border-gray-200 dark:border-gray-700
```

**Refactored Patterns:**
```tsx
// Sheet backdrop (use shadow-ambient for depth)
bg-black/40 dark:bg-black/50

// Sheet panel (use Card styling)
bg-surface-bright dark:bg-surface-container-highest
border-0  // Use tonal layering instead
```

**Implementation:**
```tsx
<div className="... bg-black/40 dark:bg-black/50 ...">  {/* Backdrop */}
  <div className="... bg-surface-bright dark:bg-surface-container-highest shadow-ambient ...">
    {/* Sheet content */}
  </div>
</div>
```

---

### Task 3.2: Standardize Focus States

**Objective:** Ensure all interactive elements use consistent focus rings

**Standard Focus Pattern:**
```tsx
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface
```

**Check These Components:**
- [ ] Header — all buttons
- [ ] Sidebar — all links
- [ ] UserMenu — trigger button and menu items
- [ ] ThemeToggle — button
- [ ] Any custom inputs or buttons

**Where to Check:**
```bash
# Find all focus states
grep -r "focus:ring" src/components/layout/
```

**Replace Pattern:**
```bash
# Old patterns
focus:ring-emerald-500
focus:ring-gray-500
focus:ring-red-500

# New pattern
focus:ring-primary
focus:ring-error
focus:ring-secondary
```

---

### Task 3.3: Standardize Hover States

**Objective:** Ensure consistent hover state colors

**Standard Hover Pattern:**
```tsx
// Light backgrounds on hover
hover:bg-surface-container-low

// Text on hover
hover:text-primary
hover:text-text-primary
```

**Check These Components:**
- [ ] Navigation items
- [ ] Menu items
- [ ] Button groups
- [ ] Any clickable text

---

### Task 3.4: Verify Dark Mode

**Objective:** Ensure all components correctly adapt to dark mode

**Manual Verification:**

1. Open dev server:
```bash
npm run dev
```

2. Navigate to each route:
- [ ] / (Kanban Board)
- [ ] /contacts
- [ ] /settings
- [ ] /login

3. Toggle dark mode (or use browser dev tools: `document.documentElement.classList.add('dark')`)

4. Verify appearance:
- [ ] No text is unreadable
- [ ] No background/text contrast issues
- [ ] Colors transition smoothly
- [ ] No flashing or color shifts
- [ ] Icons visible in both modes

**Dark Mode Token Mapping:**

| Component | Light | Dark |
|-----------|-------|------|
| Background | `bg-surface-bright` | `bg-surface-container-highest` |
| Text | `text-text-primary` | `text-text-primary` |
| Borders | `border-surface-container-low` | `border-surface-container-high` |
| Hover | `hover:bg-surface-container-low` | `hover:bg-surface-container-low` |

---

### Task 3.5: Audit Remaining Hardcoded Colors

**Objective:** Find and replace any remaining hardcoded colors

**Search for patterns:**
```bash
# Find all color class names
grep -r "bg-\|text-\|border-\|focus:ring-" src/components/layout/ | grep -E "emerald|gray|red|blue|green|purple"

# Filter to show only the non-token patterns
grep -r "bg-gray-\|bg-emerald-\|text-red-\|border-gray-" src/components/layout/
```

**Replace using mapping tables from Phase 2:**
- Header colors → see MIGRATION-PHASE-2.md Sprint 1
- Sidebar colors → see MIGRATION-PHASE-2.md Sprint 2
- UserMenu colors → see MIGRATION-PHASE-2.md Sprint 3

---

### Task 3.6: Consistency Check

**Objective:** Ensure all similar elements have consistent styling

**Checklist:**
- [ ] All buttons same focus ring style
- [ ] All text readable in dark mode
- [ ] All interactive elements have hover state
- [ ] All borders use tonal layering (no 1px solid)
- [ ] All shadows use shadow-ambient token
- [ ] All spacing uses spacing tokens

---

## Implementation Strategy

### One-Sprint Approach (7-8 hours)

If you have capacity, complete all tasks in one sprint:

1. **Day 1:** Tasks 3.1-3.2 (Sheet + focus states) — 3 hours
2. **Day 2:** Tasks 3.3-3.4 (Hover + dark mode) — 3 hours
3. **Day 3:** Tasks 3.5-3.6 (Audit + consistency) — 2 hours
4. **Testing:** All day, verification

### Two-Sprint Approach (1-2 weeks)

Spread work across two sprints:

- **Sprint 1:** Tasks 3.1-3.3 (Components + focus states)
- **Sprint 2:** Tasks 3.4-3.6 (Dark mode + final audit)

---

## Success Criteria

- [ ] Sheet component uses Card styling
- [ ] All focus states standardized (focus-ring-primary)
- [ ] All hover states use surface-container-low
- [ ] Dark mode fully functional
- [ ] No hardcoded colors remain in `src/components/layout/`
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type check passes

---

## Validation Checklist

After Phase 3, verify:

```bash
# 1. Build succeeds
npm run build

# 2. Tests pass
npm test

# 3. No hardcoded colors in layout
grep -r "bg-gray-\|bg-emerald-\|bg-red-\|text-gray-\|border-gray-" src/components/layout/
# Should return: 0 matches

# 4. Type check
npm run typecheck

# 5. Linting
npm run lint

# 6. Visual regression test
npm run dev
# Manual check: all routes, light + dark mode
```

---

## Troubleshooting

### Dark Mode Not Working

**Symptom:** Colors don't change when toggling dark mode

**Solution:**
1. Verify `data-theme="dark"` or `dark` class on `<html>` element
2. Check CSS has `@media (prefers-color-scheme: dark)` rules
3. Verify tokens.css has dark mode variants
4. Check tailwind.config.js has `darkMode: 'class'` or `darkMode: 'media'`

---

### Colors Still Hardcoded

**Symptom:** `grep` finds remaining hardcoded colors

**Solution:**
1. Review Phase 2 mapping tables
2. Replace using exact token names
3. Test visually to ensure colors match
4. Verify dark mode variant exists

---

### Focus Rings Not Visible

**Symptom:** Focus states not showing

**Solution:**
1. Check CSS includes `outline: none` (removes default)
2. Verify `ring-2` class present
3. Verify token color is correct
4. Check contrast ratio: should be visible on background

---

## Next Steps

Once Phase 3 complete:

1. ✅ Verify all success criteria met
2. ✅ Run full validation checklist
3. ✅ Document any adjustments made
4. → **Proceed to [Phase 4: Enforcement](./MIGRATION-PHASE-4.md)**

---

**Status:** ✅ PHASE 3 READY

See [MIGRATION-STRATEGY.md](./MIGRATION-STRATEGY.md) for overview
