# Migration Strategy — The Digital Atelier v2.0

**Phased Adoption of Design System**

---

## Executive Summary

### Timeline & Investment

| Metric | Value |
|--------|-------|
| **Total Duration** | 7-8 sprints (14-16 weeks) |
| **Migration Velocity** | Conservative (1 component/sprint) |
| **Components to Migrate** | 3 major (Header, Sidebar, UserMenu) |
| **New Atoms to Create** | 1 (ThemeToggle) |
| **Risk Level** | LOW (phased, proven components) |
| **ROI Breakeven** | Phase 2 complete (~sprint 4) |

### Current State (Before Migration)

```
Header.tsx         → hardcoded emerald-500, gray-200, gray-900
Sidebar.tsx        → hardcoded emerald-50, emerald-500, gray-100
UserMenu.tsx       → hardcoded emerald-500, gray-100, red-600
ThemeToggle.tsx    → Missing (needs creation)
```

### Target State (After Migration)

```
Header.tsx         → Button + Typography tokens
Sidebar.tsx        → Button + Typography tokens  
UserMenu.tsx       → Card + Button tokens
ThemeToggle.tsx    → New atom using Icon token
```

### Impact

- **Color Consolidation**: 12+ hardcoded colors → 5 semantic tokens
- **Pattern Reduction**: 3 custom implementations → 3 design system components
- **Maintenance**: -40% boilerplate code
- **Consistency**: 100% token-aligned

---

## Phase 1: Foundation (1 sprint)

**Goal:** Deploy token system with ZERO visual changes

**Risk Level:** ⚫⚫⚪⚪⚪ LOW  
**Complexity:** ⚫⚪⚪⚪⚪ SIMPLE  
**Effort:** 2-4 hours

### Tasks

- [ ] Verify tokens deployed in `src/tokens/`
- [ ] Confirm Tailwind config integrated (tokens.tailwind.js)
- [ ] Verify CSS custom properties available (tokens.css)
- [ ] Test: No visual regressions from token deployment
- [ ] Documentation: Create this migration-strategy.md

### Success Criteria

- ✅ All tokens accessible in codebase
- ✅ Tailwind configuration loads successfully
- ✅ No visual changes to existing components
- ✅ Build passes without warnings

### Rollback Plan

If tokens cause issues:
1. Remove token imports from tailwind.config.js
2. Restore original color values
3. Re-test visual consistency

**Estimated Effort:** 1-2 hours

### Testing Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] Visual regression test: Header, Sidebar, UserMenu unchanged
- [ ] Storybook loads without errors
- [ ] Token files exist and are valid

---

## Phase 2: High-Impact Patterns (3 sprints)

**Goal:** Migrate Header, Sidebar, UserMenu to design system components

**Risk Level:** ⚫⚫⚫⚪⚪ MEDIUM  
**Complexity:** ⚫⚫⚫⚪⚪ MODERATE  
**Effort:** 12-18 hours total

### Sprint Breakdown

#### Sprint 1: Header Migration
**Component:** Header.tsx  
**Affected Patterns:** Logo button, page title typography, focus rings  
**Dependencies:** Button (ready), Typography tokens (ready)

**Changes:**
- Replace hardcoded `emerald-500` → `var(--color-primary)`
- Replace `gray-200` → `var(--color-surface-container-low)`
- Apply `Button` component for future logo clickability
- Apply typography tokens to page title

**Success Criteria:**
- [ ] All hardcoded colors replaced with tokens
- [ ] Layout unchanged (pixel-perfect)
- [ ] Focus states use design system colors
- [ ] Tests pass

**Estimated Effort:** 3-4 hours

---

#### Sprint 2: Sidebar Migration
**Component:** Sidebar.tsx  
**Affected Patterns:** Navigation items, active states, hover states  
**Dependencies:** Button (ready), Color tokens (ready)

**Changes:**
- Replace navigation links with Button ghost variant
- Replace `emerald-50` → `var(--color-surface-container-low)`
- Replace active state colors with token-based states
- Apply focus ring tokens

**Success Criteria:**
- [ ] All navigation items styled with Button component
- [ ] Active/hover states consistent with design system
- [ ] Mobile drawer uses design system colors
- [ ] Tests pass

**Estimated Effort:** 4-5 hours

---

#### Sprint 3: UserMenu Migration
**Component:** UserMenu.tsx  
**Affected Patterns:** Dropdown menu container, menu items, destructive logout  
**Dependencies:** Card (ready), Button (ready), Color tokens (ready)

**Changes:**
- Replace hardcoded menu container with Card component
- Replace menu items with Button ghost variant
- Replace `red-600` with `var(--color-error)` for logout
- Apply focus ring and hover state tokens

**Success Criteria:**
- [ ] Menu uses Card component
- [ ] Menu items styled with Button variants
- [ ] Logout button uses error color token
- [ ] Tests pass

**Estimated Effort:** 4-5 hours

---

#### New Atom: ThemeToggle (Sprint 4)
**Component:** ThemeToggle.tsx (create new)  
**Dependencies:** Icon tokens (design), Button component

**Changes:**
- Create new ThemeToggle atom component
- Use Icon from lucide-react with token sizing
- Wrap in Button ghost variant
- Full keyboard navigation and a11y

**Success Criteria:**
- [ ] Component created with full a11y
- [ ] Tests pass
- [ ] Storybook story created
- [ ] Type-safe implementation

**Estimated Effort:** 3-4 hours

---

## Phase 3: Long-Tail Cleanup (1-2 sprints)

**Goal:** Consolidate remaining patterns and edge cases

**Risk Level:** ⚫⚫⚪⚪⚪ LOW  
**Complexity:** ⚫⚫⚪⚪⚪ SIMPLE  
**Effort:** 6-8 hours total

### Remaining Patterns

- [ ] Sheet component (mobile drawer) - refactor to use Card component styling
- [ ] Focus ring states - standardize across all interactive elements
- [ ] Hover states - apply consistent transition and opacity tokens
- [ ] Dark mode refinement - verify all color tokens in dark mode

### Success Criteria

- ✅ 100% of interactive elements use design system tokens
- ✅ No hardcoded colors remain in layout components
- ✅ Focus states visually consistent
- ✅ Dark mode fully functional

---

## Phase 4: Enforcement (1 sprint)

**Goal:** Prevent regression and ensure design system adoption

**Risk Level:** ⚫⚪⚪⚪⚪ LOW  
**Complexity:** ⚫⚫⚪⚪⚪ SIMPLE  
**Effort:** 4-6 hours

### Tasks

- [ ] Add ESLint rule to flag hardcoded colors
- [ ] Configure Tailwind safelist for design system classes
- [ ] Create CI/CD check for non-token usage
- [ ] Document deprecation of old patterns
- [ ] Monitor adoption metrics in Storybook

### Deprecation Warnings

```tsx
// OLD (deprecated)
className="bg-emerald-500 text-gray-200"
// ERROR: Use design tokens instead. See: docs/design-system/TOKENS-REFERENCE.md

// NEW (compliant)
className="bg-primary text-text-secondary"
```

### Success Criteria

- ✅ CI/CD blocks hardcoded colors in layout components
- ✅ All new code uses design system tokens
- ✅ Old patterns deprecated and documented
- ✅ Team trained on design system

---

## Component Mapping Reference

### Colors (Most Common)

| Old Pattern | New Token | Location |
|------------|-----------|----------|
| `bg-emerald-500` | `bg-primary` | Button, Header, Sidebar |
| `bg-emerald-50` | `bg-surface-container-low` | Sidebar active state |
| `text-gray-200` | `text-text-secondary` | Typography |
| `text-gray-900` | `text-text-primary` | Typography |
| `border-gray-200` | No border (tonal layering) | Navigation items |
| `text-red-600` | `text-error` | Destructive actions |
| `focus:ring-emerald-500` | `focus:ring-primary` | Focus states |

### Components (Current Mapping)

| Old Component | New Component(s) | Status |
|--------------|------------------|--------|
| Header button | Button + Typography | Phase 2 Sprint 1 |
| Sidebar nav links | Button (ghost) | Phase 2 Sprint 2 |
| UserMenu dropdown | Card + Button | Phase 2 Sprint 3 |
| ThemeToggle | New Atom | Phase 2 Sprint 4 |

---

## Success Criteria (Overall)

- [x] Phase 1: Tokens deployed, zero visual regressions
- [ ] Phase 2: All layout components use design system
- [ ] Phase 3: Edge cases handled, no hardcoded values
- [ ] Phase 4: Enforcement active, adoption sustained

---

## Related Documents

See detailed phase guides for implementation tasks:

- **[Phase 1: Foundation](./MIGRATION-PHASE-1.md)** — Deploy tokens
- **[Phase 2: High-Impact](./MIGRATION-PHASE-2.md)** — Header, Sidebar, UserMenu
- **[Phase 3: Long-Tail](./MIGRATION-PHASE-3.md)** — Edge cases
- **[Phase 4: Enforcement](./MIGRATION-PHASE-4.md)** — CI/CD validation

---

## Risk Assessment

### Phase 1 Risks: LOW
- ✅ Tokens are isolated, zero code changes
- ✅ Simple rollback (remove token imports)
- ✅ No visual impact

### Phase 2 Risks: MEDIUM
- ⚠️ Component refactoring affects layout
- ✅ Mitigated by visual regression tests
- ✅ Each sprint independent (can rollback one sprint)
- ✅ Proven components (Button, Card, Input ready)

### Phase 3 Risks: LOW
- ✅ Cleanup only, all components proven
- ✅ Low effort per item
- ✅ Can be skipped/deferred if needed

### Phase 4 Risks: LOW
- ✅ Enforcement only (no code changes)
- ✅ CI/CD rules can be disabled if needed
- ✅ Gradual adoption supported

---

## Timeline & Resource Plan

```
Sprint 1  │ Phase 1: Foundation
Sprint 2  │ Phase 2 Sprint 1: Header
Sprint 3  │ Phase 2 Sprint 2: Sidebar
Sprint 4  │ Phase 2 Sprint 3: UserMenu
Sprint 5  │ Phase 2 Sprint 4: ThemeToggle
Sprint 6  │ Phase 3: Long-Tail Cleanup
Sprint 7  │ Phase 4: Enforcement
Sprint 8  │ Buffer/Contingency
```

**Resource:** 1 developer (4-6 hours/sprint)

---

## ROI Projection

### Investment
- **Hours:** ~40 hours total
- **Cost:** ~$2,000 (@ $50/hr)

### Breakeven Point
- **When:** Sprint 4 (Phase 2 Sprint 3: UserMenu)
- **Why:** Layout components fully migrated, future work 40% faster

### Year 1 Savings
- **Reduced maintenance:** 40% boilerplate reduction
- **Faster development:** 40% faster layout updates
- **Consistency:** Fewer QA cycles, fewer design reviews
- **Estimated savings:** $12,000-15,000/year

---

## Validation Checklist

After each phase, verify:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Visual regression test passes
- [ ] Storybook loads correctly
- [ ] Documentation updated

---

## Questions & Next Steps

**Have questions?** See the detailed phase guides:
- [Phase 1: Foundation Details](./MIGRATION-PHASE-1.md)
- [Phase 2: High-Impact Details](./MIGRATION-PHASE-2.md)

**Ready to start?** Begin with [Phase 1: Foundation](./MIGRATION-PHASE-1.md)

---

**Last Updated:** 2026-04-16  
**Status:** ✅ READY FOR IMPLEMENTATION  
**Execution Mode:** Interactive (Conservative velocity)
