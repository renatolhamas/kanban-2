# Consolidation Report — Kanban Design System

**From:** Brad Frost  
**Date:** 2026-04-06  
**Audit Base:** pattern-inventory.json  
**Clustering Threshold:** 5% HSL  
**Goal:** >80% pattern reduction

---

## 📊 Consolidation Summary

| Category | Before | After | Reduction | Status |
|----------|--------|-------|-----------|--------|
| Buttons | 12 | 3 | **75%** | ✅ |
| Inputs | 6 | 2 | **67%** | ✅ |
| Text Styles | 8 | 4 | **50%** | ⚠️ |
| Colors | 8 | 5 | **38%** | ⚠️ |
| **TOTAL** | **34** | **14** | **59%** | ⚠️ |

**Analysis:** Good progress on components (75% button reduction), but overall reduction at 59% — below 80% target. Recommendation: Extract @layer utilities for text styles to push above 80%.

---

## 🔵 Button Consolidation

### Before (12 variants):
```
1. bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700
2. text-blue-600 hover:text-blue-700 transition-colors
3. bg-gray-200 text-gray-700 rounded px-3 py-1
4-12. [Other minor variants with slight HSL/spacing differences]
```

### After (3 variants):
| Variant | Purpose | Class | Usage |
|---------|---------|-------|-------|
| **primary** | Call-to-action, form submit | `bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors` | 5 instances |
| **link** | Navigation, secondary actions | `text-blue-600 hover:text-blue-700 transition-colors` | 9 instances |
| **secondary** | Alternate actions, grouped buttons | `bg-gray-200 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-300` | 4 instances |

**Reduction:** 12 → 3 = **75%** ✅

---

## 📝 Input Consolidation

### Before (6 variants):
```
1. Text input: w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50
2. Password input: Same as text + custom mask
3-6. [Minor variations in padding, border color]
```

### After (2 variants):
| Variant | Purpose | Class | Usage |
|---------|---------|-------|-------|
| **default** | Text, email, password inputs | `w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500` | 11 instances |
| **password** | Password input with visibility toggle | Extends `default` + special handling for eye icon | 5 instances |

**Reduction:** 6 → 2 = **67%** ✅

---

## 🔤 Text Style Consolidation

### Before (8 patterns):
```
1. pt-2 text-center text-sm text-gray-500          [9 instances]
2. text-sm font-medium text-red-800                [6 instances]
3. text-center text-3xl font-extrabold text-gray-900 tracking-tight [3 instances]
4-8. [Other variants: labels, descriptions, hints]
```

### After (4 semantic tokens):
| Token | Purpose | Class | Instances | Consolidation |
|-------|---------|-------|-----------|----------------|
| **text.hint** | Form hints, helper text | `text-sm text-gray-500` | 9 | Unified from 3 variations |
| **text.error** | Error messages | `text-sm font-medium text-red-800` | 6 | Exact match — keep as-is |
| **text.heading** | Page titles | `text-3xl font-extrabold text-gray-900 tracking-tight` | 3 | New token |
| **text.label** | Form labels | `block text-sm font-semibold text-gray-700` | 4 | New token |

**Reduction:** 8 → 4 = **50%** ⚠️ (text styles have semantic variety — harder to consolidate)

---

## 🎨 Color Consolidation

### Unique Colors Found: 8
```
- blue-600    (12 uses)
- blue-700    (4 uses)
- gray-500    (8 uses)
- gray-700    (6 uses)
- gray-900    (5 uses)
- red-400     (7 uses)
- red-800     (3 uses)
- white       (2 uses)
```

### Recommended Palette (5 colors):
| Role | Color | Usage | Notes |
|------|-------|-------|-------|
| **primary** | blue-600 | 12 | Interactive, CTAs |
| **primary-dark** | blue-700 | 4 | Hover states |
| **text-default** | gray-900 | 5 | Body text |
| **text-muted** | gray-500 | 8 | Helper text |
| **error** | red-600 | 10 | Errors (consolidate red-400 + red-800) |

**Reduction:** 8 → 5 = **38%** ⚠️ (limited consolidation — colors are already optimized)

---

## 🔧 Consolidation Strategy

### Phase 1: Extract @layer Components (Immediate)
Convert most-used patterns to Tailwind @layer directives:

```css
@layer components {
  /* Buttons */
  .btn-primary {
    @apply bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors;
  }
  
  .btn-link {
    @apply text-blue-600 hover:text-blue-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-300;
  }
  
  /* Inputs */
  .input-default {
    @apply w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500;
  }
  
  /* Text */
  .text-hint {
    @apply text-sm text-gray-500;
  }
  
  .text-error {
    @apply text-sm font-medium text-red-800;
  }
}
```

**Impact:** Replace 34 className instances with 14 component classes. Result: CSS becomes more readable, easier to update globally.

### Phase 2: Create @layer Utilities (Follow-up)
Define semantic text utilities:

```css
@layer utilities {
  .text-body { @apply text-base text-gray-900; }
  .text-label { @apply text-sm font-semibold text-gray-700; }
  .text-hint { @apply text-sm text-gray-500; }
  .text-error { @apply text-sm font-medium text-red-800; }
}
```

### Phase 3: Migrate Components (Week 2)
Update React components to use consolidated classes:

```tsx
// Before
<button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
  Sign In
</button>

// After
<button className="btn-primary">
  Sign In
</button>
```

---

## 📋 Pattern Mapping (Old → New)

### Buttons
```
bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 → .btn-primary
text-blue-600 hover:text-blue-700 transition-colors → .btn-link
bg-gray-200 text-gray-700 rounded px-3 py-1 → .btn-secondary
[All other button variations] → One of above 3
```

### Inputs
```
w-full px-4 py-2.5 bg-gray-50 border... focus:ring-2... → .input-default
[All password input variants] → .input-default (use same class, different HTML type)
```

### Text
```
pt-2 text-center text-sm text-gray-500 → .text-hint
text-sm font-medium text-red-800 → .text-error
text-center text-3xl font-extrabold text-gray-900 → .text-heading
block text-sm font-semibold text-gray-700 → .text-label
```

---

## ✅ Consolidation Recommendations

### DO consolidate:
- ✅ Buttons into 3 semantic variants
- ✅ Inputs into 2 variants (text, password)
- ✅ Extract @layer components for buttons/inputs
- ✅ Create text utility layer for semantic tokens

### DO NOT consolidate:
- ❌ Spacing values (already using Tailwind scale — adding custom tokens adds complexity)
- ❌ Colors beyond primary/error (current palette is already lean)
- ❌ Animation/transition values (only 3 patterns, no consolidation needed)

---

## 📈 Overall Reduction Potential

**Current:** 59% reduction (34 → 14 patterns)  
**Target:** >80% reduction

**To reach 80%:**
Option A: Extract 4 more text patterns as utilities → 70% reduction (still below 80%)  
Option B: Consider shadcn/ui library for pre-built components → 85%+ reduction (bigger change)

**Brad's Recommendation:** Implement Phase 1 (@layer components) for immediate 59% improvement. Revisit Phase 2 after 2 weeks of usage to measure adoption and identify remaining optimization opportunities.

---

## 🎯 Success Metrics

After consolidation implementation, measure:
1. **CSS file size** — Target: <5KB for component + utility layers
2. **Bundle reduction** — Target: 12-15% smaller than before
3. **Developer velocity** — Time to add new button variant (should be <5 min)
4. **Maintenance burden** — Changes to button style now affect all 34 instances in 1 edit

---

## 📝 Next Steps

1. **Review this report** — Approve consolidation plan?
2. **Implement @layer components** — Update tailwind.css with new layers
3. **Migrate components gradually** — Phase 1 in next sprint
4. **Measure impact** — Track CSS size and adoption metrics
5. **Iterate** — Run consolidation again in 4 weeks

---

*Generated by Brad Frost Design System Architect*  
*Consolidation Task v1.1.0*
