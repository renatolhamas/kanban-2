# Phase 2: High-Impact Patterns — Migrate Layout Components

**Goal:** Replace Header, Sidebar, UserMenu with design system components

**Timeline:** 4 sprints (8-12 weeks)  
**Effort:** 14-18 hours total  
**Risk:** ⚫⚫⚫⚪⚪ MEDIUM (mitigated by component isolation)

---

## Overview

Phase 2 is where the real transformation happens. We migrate the three main layout components one per sprint:

| Sprint | Component | Risk | Effort | New Atom? |
|--------|-----------|------|--------|-----------|
| 1 | Header | MEDIUM | 3-4h | No |
| 2 | Sidebar | MEDIUM | 4-5h | No |
| 3 | UserMenu | MEDIUM | 4-5h | No |
| 4 | ThemeToggle | LOW | 3-4h | Yes |

Each sprint is independent — can roll back one without affecting others.

---

## Pre-Flight Checklist

Before starting Phase 2:

- [ ] Phase 1 complete (tokens deployed, zero visual regressions)
- [ ] Button component ready and tested
- [ ] Card component ready and tested
- [ ] Input component ready and tested
- [ ] You have read [MIGRATION-PHASE-1.md](./MIGRATION-PHASE-1.md)
- [ ] Design tokens accessible (`--color-primary`, etc.)

---

## Sprint 1: Header Migration

**Duration:** 1 sprint (5-7 days)  
**Effort:** 3-4 hours  
**Risk:** ⚫⚫⚪⚪⚪ MEDIUM

### Current Header State

**File:** `src/components/layout/Header.tsx`

**Hardcoded Patterns:**
```tsx
// Logo background
<div className="... bg-emerald-500 text-white ...">K</div>

// Page title
<h2 className="... text-gray-700 dark:text-gray-300 ...">

// Border
<header className="... border-b border-gray-200 dark:border-gray-800 ...">

// Focus ring
focus:ring-emerald-500
```

### Migration Tasks

#### Task 1.1: Replace Logo Colors

**Before:**
```tsx
<div className="... bg-emerald-500 text-white ...">K</div>
```

**After:**
```tsx
<div className="... bg-primary text-text-inverse ...">K</div>
```

**Tokens Used:**
- `--color-primary` → bg-primary
- `--color-text-inverse` → text-text-inverse

---

#### Task 1.2: Replace Page Title Typography

**Before:**
```tsx
<h2 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
```

**After:**
```tsx
<h2 className="text-sm sm:text-base font-medium text-text-primary">
```

**Tokens Used:**
- `--color-text-primary` → text-text-primary

---

#### Task 1.3: Replace Border Colors

**Before:**
```tsx
<header className="... border-b border-gray-200 dark:border-gray-800 ...">
```

**After:**
```tsx
<header className="... border-b border-surface-container-low ...">
```

**Rationale:** Replace visible border with tonal layering (background color difference)

**Tokens Used:**
- `--color-surface-container-low` → border-surface-container-low

---

#### Task 1.4: Replace Focus Ring

**Before:**
```tsx
focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
```

**After:**
```tsx
focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface
```

**Tokens Used:**
- `--color-primary` → focus:ring-primary
- `--color-surface` → dark:focus:ring-offset-surface

---

#### Task 1.5: Refactor Classnames

**Objective:** Clean up and organize refactored classes

**Before:**
```tsx
className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
```

**After:**
```tsx
className="sticky top-0 z-40 w-full border-b border-surface-container-low bg-surface-bright dark:bg-surface-container-highest shadow-ambient"
```

**Changes:**
- `border-gray-200 dark:border-gray-800` → `border-surface-container-low`
- `bg-white dark:bg-gray-900` → `bg-surface-bright dark:bg-surface-container-highest`
- `shadow-sm` → `shadow-ambient`

---

### Implementation Steps

1. **Open** `src/components/layout/Header.tsx`

2. **Find** all hardcoded colors:
```bash
grep -n "emerald\|gray-200\|gray-700\|gray-900\|gray-300" Header.tsx
```

3. **Replace** according to mapping table (below)

4. **Test** visually:
```bash
npm run dev
# Navigate to all routes: /, /contacts, /settings, /login
# Verify Header appearance unchanged
```

5. **Run tests:**
```bash
npm test -- Header
```

6. **Type check:**
```bash
npm run typecheck
```

---

### Color Mapping for Header

| Old Pattern | New Token | Tailwind Class |
|------------|-----------|----------------|
| `bg-emerald-500` | `--color-primary` | `bg-primary` |
| `text-white` | `--color-text-inverse` | `text-text-inverse` |
| `text-gray-700` | `--color-text-primary` | `text-text-primary` |
| `text-gray-300` | `--color-text-secondary` | `text-text-secondary` |
| `bg-white` | `--color-surface-bright` | `bg-surface-bright` |
| `bg-gray-900` | `--color-surface-container-highest` | `bg-surface-container-highest` |
| `border-gray-200` | `--color-surface-container-low` | `border-surface-container-low` |
| `border-gray-800` | `--color-surface-container-high` | `border-surface-container-high` |
| `shadow-sm` | `--shadow-ambient` | `shadow-ambient` |

---

### Success Criteria

- [ ] All hardcoded colors replaced with tokens
- [ ] Visual appearance pixel-perfect (no changes)
- [ ] Dark mode works correctly
- [ ] Tests pass
- [ ] Type check passes
- [ ] Linting passes

---

### Rollback Plan (Sprint 1)

If Header breaks during migration:

1. **Option A:** Revert to git:
```bash
git checkout -- src/components/layout/Header.tsx
```

2. **Option B:** Restore hardcoded colors:
```bash
# Replace token classes with original colors
# See table above (right column → left column)
```

**Estimated Time:** 15-30 minutes

---

## Sprint 2: Sidebar Migration

**Duration:** 1 sprint (5-7 days)  
**Effort:** 4-5 hours  
**Risk:** ⚫⚫⚫⚪⚪ MEDIUM

### Current Sidebar State

**File:** `src/components/layout/Sidebar.tsx`

**Hardcoded Patterns:**
```tsx
// Desktop sidebar border
border-r border-gray-200 dark:border-gray-800

// Active nav item background
bg-emerald-50 dark:bg-gray-800

// Active nav item text
text-emerald-700 dark:text-emerald-400

// Inactive hover state
hover:bg-gray-100 dark:hover:bg-gray-800

// Mobile button background
bg-emerald-500 text-white

// Focus ring
focus:ring-emerald-500
```

### Migration Tasks

#### Task 2.1: Replace Navigation Container Colors

**Before:**
```tsx
<nav className="... border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ...">
```

**After:**
```tsx
<nav className="... border-r border-surface-container-low bg-surface-bright dark:bg-surface-container-highest ...">
```

---

#### Task 2.2: Replace Active Navigation Item

**Before:**
```tsx
className={`... ${
  active
    ? 'bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
}`}
```

**After:**
```tsx
className={`... ${
  active
    ? 'bg-surface-container-low text-primary'
    : 'text-text-primary hover:bg-surface-container-low'
}`}
```

**Rationale:**
- Active state: light background + primary text
- Hover state: same as active background (simpler)

---

#### Task 2.3: Replace Mobile Button

**Before:**
```tsx
<button className="... bg-emerald-500 text-white ... focus:ring-emerald-500 ...">
```

**After:**
```tsx
<button className="... bg-primary text-text-inverse ... focus:ring-primary ...">
```

---

#### Task 2.4: Replace Focus Rings

**Before:**
```tsx
focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
```

**After:**
```tsx
focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface
```

---

### Implementation Steps

1. **Open** `src/components/layout/Sidebar.tsx`

2. **Replace** colors using mapping table (below)

3. **Refactor** SidebarContent classnames:
```tsx
// Before (long conditional)
className={`flex items-center gap-3 rounded-lg px-4 py-3 ... ${
  active ? '...' : '...'
}`}

// After (cleaner)
className={`flex items-center gap-3 rounded-lg px-4 py-3 ... ${
  active ? 'bg-surface-container-low text-primary' : 'text-text-primary hover:bg-surface-container-low'
}`}
```

4. **Test** visually on mobile and desktop:
```bash
npm run dev
# Test mobile drawer (hamburger button)
# Test desktop sidebar
# Test active/hover states
```

5. **Run tests:**
```bash
npm test -- Sidebar
```

---

### Color Mapping for Sidebar

| Old Pattern | New Token | Tailwind Class |
|------------|-----------|----------------|
| `bg-emerald-50` | `--color-surface-container-low` | `bg-surface-container-low` |
| `bg-emerald-500` | `--color-primary` | `bg-primary` |
| `text-emerald-700` | `--color-primary` | `text-primary` |
| `text-emerald-400` | `--color-primary` | `text-primary` |
| `text-gray-700` | `--color-text-primary` | `text-text-primary` |
| `text-gray-300` | `--color-text-secondary` | `text-text-secondary` |
| `bg-gray-100` | `--color-surface-container-low` | `bg-surface-container-low` |
| `bg-gray-800` | `--color-surface-container-high` | `bg-surface-container-high` |
| `border-gray-200` | `--color-surface-container-low` | `border-surface-container-low` |

---

## Sprint 3: UserMenu Migration

**Duration:** 1 sprint (5-7 days)  
**Effort:** 4-5 hours  
**Risk:** ⚫⚫⚫⚪⚪ MEDIUM

### Current UserMenu State

**File:** `src/components/layout/UserMenu.tsx`

**Hardcoded Patterns:**
```tsx
// Trigger button
text-gray-700 dark:text-gray-200
focus:ring-emerald-500
hover:bg-gray-100 dark:hover:bg-gray-800

// Avatar circle
bg-emerald-500 text-white

// Dropdown menu
bg-white dark:bg-gray-800
border border-gray-200 dark:border-gray-700
shadow-lg

// Menu items (normal)
text-gray-700 dark:text-gray-200
hover:bg-gray-100 dark:hover:bg-gray-700

// Logout item (destructive)
text-red-600 dark:text-red-400
hover:bg-red-50 dark:hover:bg-gray-700
```

### Migration Tasks

#### Task 3.1: Replace Trigger Button

**Before:**
```tsx
className="... text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-emerald-500 ..."
```

**After:**
```tsx
className="... text-text-primary hover:bg-surface-container-low focus:ring-primary ..."
```

---

#### Task 3.2: Replace Avatar Circle

**Before:**
```tsx
className="... bg-emerald-500 text-white ..."
```

**After:**
```tsx
className="... bg-primary text-text-inverse ..."
```

---

#### Task 3.3: Replace Dropdown Menu Container

**Before:**
```tsx
className="... bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg ..."
```

**After (use Card component):**
```tsx
<Card className="absolute right-0 top-full mt-2 w-48 p-0">
  {/* Menu items */}
</Card>
```

Or keep className but use tokens:
```tsx
className="... bg-surface-bright dark:bg-surface-container-highest border border-surface-container-low shadow-ambient ..."
```

---

#### Task 3.4: Replace Menu Items

**Before:**
```tsx
className="... text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ..."
```

**After:**
```tsx
className="... text-text-primary hover:bg-surface-container-low ..."
```

---

#### Task 3.5: Replace Logout Item (Destructive)

**Before:**
```tsx
className="... text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 ..."
```

**After:**
```tsx
className="... text-error hover:bg-error-background ..."
```

---

### Implementation Steps

1. **Open** `src/components/layout/UserMenu.tsx`

2. **Replace** colors using mapping table (below)

3. **Consider using Card component:**
```tsx
import { Card } from '@/components/ui'

// Instead of manual div with styles
<Card className="absolute right-0 top-full mt-2 w-48 p-1">
  {/* Menu items */}
</Card>
```

4. **Test** dropdown interaction:
```bash
npm run dev
# Click user menu
# Verify dropdown appearance
# Test keyboard navigation (Escape, Tab)
# Test dark mode
```

5. **Run tests:**
```bash
npm test -- UserMenu
```

---

### Color Mapping for UserMenu

| Old Pattern | New Token | Tailwind Class |
|------------|-----------|----------------|
| `bg-emerald-500` | `--color-primary` | `bg-primary` |
| `text-white` | `--color-text-inverse` | `text-text-inverse` |
| `text-gray-700` | `--color-text-primary` | `text-text-primary` |
| `text-gray-200` | `--color-text-secondary` | `text-text-secondary` |
| `hover:bg-gray-100` | `--color-surface-container-low` | `hover:bg-surface-container-low` |
| `hover:bg-gray-700` | `--color-surface-container-high` | `hover:bg-surface-container-high` |
| `bg-white` | `--color-surface-bright` | `bg-surface-bright` |
| `bg-gray-800` | `--color-surface-container-high` | `bg-surface-container-high` |
| `border-gray-200` | `--color-surface-container-low` | `border-surface-container-low` |
| `border-gray-700` | `--color-surface-container-high` | `border-surface-container-high` |
| `text-red-600` | `--color-error` | `text-error` |
| `text-red-400` | `--color-error` | `text-error` |
| `hover:bg-red-50` | `--color-error-background` | `hover:bg-error-background` |
| `shadow-lg` | `--shadow-ambient` | `shadow-ambient` |

---

## Sprint 4: ThemeToggle (New Atom)

**Duration:** 1 sprint (3-5 days)  
**Effort:** 3-4 hours  
**Risk:** ⚫⚪⚪⚪⚪ LOW (new component, isolated)

### Objective

Create a new `ThemeToggle` atom component to replace the hardcoded version in Header.

### Current State

**File:** `src/components/ui/theme-toggle.tsx` (likely missing or hardcoded)

**Usage in Header:**
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />  // ← Needs to be implemented
```

### Implementation

#### Step 1: Create Component

**File:** `src/components/ui/atoms/theme-toggle.tsx`

```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setIsDark(!isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={20} className="text-text-primary" />
      ) : (
        <Moon size={20} className="text-text-primary" />
      )}
    </Button>
  );
}
```

**Token Usage:**
- `Button` component → Reuses design system patterns
- `text-text-primary` → Icon color using token
- Icons from lucide-react with token sizing

---

#### Step 2: Create Tests

**File:** `src/components/ui/atoms/theme-toggle.test.tsx`

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('should render', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should toggle dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ThemeToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

#### Step 3: Create Storybook Story

**File:** `src/components/ui/atoms/theme-toggle.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';

const meta = {
  title: 'Atoms/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

---

#### Step 4: Export from UI Index

**File:** `src/components/ui/index.ts`

Add:
```tsx
export { ThemeToggle } from './atoms/theme-toggle';
```

---

### Success Criteria

- [ ] Component created with full implementation
- [ ] Tests pass
- [ ] Accessibility tests pass (jest-axe)
- [ ] Storybook story created
- [ ] Component properly exported
- [ ] Type-safe (no `any` types)

---

## Phase 2 Summary

| Sprint | Component | Status | Hours | Notes |
|--------|-----------|--------|-------|-------|
| 1 | Header | Ready | 3-4 | Color tokens |
| 2 | Sidebar | Ready | 4-5 | Navigation + active states |
| 3 | UserMenu | Ready | 4-5 | Dropdown + error color |
| 4 | ThemeToggle | Ready | 3-4 | New atom component |

**Total Effort:** 14-18 hours  
**Total Timeline:** 4 sprints

---

## Phase 2 Success Criteria

- [ ] Header fully migrated to tokens
- [ ] Sidebar fully migrated to tokens
- [ ] UserMenu fully migrated to tokens
- [ ] ThemeToggle atom created and tested
- [ ] All tests pass
- [ ] No visual regressions
- [ ] Dark mode fully functional
- [ ] Keyboard navigation preserved

---

## Next Steps

After Phase 2 complete:

1. ✅ Verify all 4 sprints complete
2. ✅ All success criteria met
3. ✅ Document component-token mappings
4. → **Proceed to [Phase 3: Long-Tail Cleanup](./MIGRATION-PHASE-3.md)**

---

**Status:** ✅ PHASE 2 READY

See [MIGRATION-STRATEGY.md](./MIGRATION-STRATEGY.md) for overview
