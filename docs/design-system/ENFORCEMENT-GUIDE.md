# Design System Enforcement Guide

**Document:** Phase 4 — Enforcement  
**Version:** 1.0  
**Last Updated:** 2026-04-17  

---

## Purpose

Maintain integrity and consistency of "The Digital Atelier v2.0" design system across the codebase. This guide outlines enforcement mechanisms, code review standards, and CI/CD checks.

---

## 1. Design Token Usage Rules

### ✅ DO: Use Design Tokens

```tsx
// ✅ Correct
<div className="bg-primary text-text-inverse shadow-ambient">
  Component with tokens
</div>
```

### ❌ DON'T: Hardcoded Colors

```tsx
// ❌ Wrong
<div className="bg-emerald-500 text-white shadow-lg">
  Component with hardcoded colors
</div>
```

### Token Reference

| Category | Examples | Usage |
|----------|----------|-------|
| **Colors** | `primary`, `secondary`, `error`, `success`, `warning` | Actions, status states |
| **Surface** | `surface-bright`, `surface-container-low`, `surface-container-high` | Backgrounds, elevation |
| **Text** | `text-primary`, `text-secondary`, `text-text-inverse` | Typography |
| **Shadows** | `shadow-ambient` | Elevation, depth |
| **Radius** | Default is 8px (Tailwind's `rounded-lg`) | Corner roundness |
| **Spacing** | Tailwind scale (4px, 8px, 12px...) | Padding, margins |

**Full Reference:** `docs/design-system/TOKENS-REFERENCE.md`

---

## 2. Component-Level Enforcement

### File Structure Requirements

```
src/components/
├── ui/
│   ├── atoms/
│   │   ├── button.tsx              ✅ Must use tokens
│   │   ├── input.tsx               ✅ Must use tokens
│   │   └── __tests__/              ⚠️ Can have helper classes
│   ├── molecules/
│   │   ├── card.tsx                ✅ Must use tokens
│   │   └── __stories__/            ⚠️ Documentation, exceptions allowed
│   └── index.ts                    ✅ Central export
└── layout/
    ├── Header.tsx                  ✅ Must use tokens
    ├── Sidebar.tsx                 ✅ Must use tokens
    └── UserMenu.tsx                ✅ Must use tokens
```

### Rules by Component Type

| Type | Rule | Exception |
|------|------|-----------|
| **Atoms** | MUST use tokens | None |
| **Molecules** | MUST use tokens | None |
| **Organisms** | MUST use tokens | None |
| **Layout** | MUST use tokens | None |
| **Pages** | SHOULD use tokens | Feature-specific styling OK |
| **Stories** | SHOULD use tokens | Documentation/examples OK |
| **Tests** | SHOULD use tokens | Utility classes OK |

---

## 3. Code Review Checklist

When reviewing PRs that modify `src/components/` or layout components, check:

### ✅ Color Compliance

- [ ] No `bg-gray-*`, `bg-blue-*`, `bg-red-*` etc. in component classes
- [ ] No `text-white`, `text-black` (use `text-text-inverse`, `text-text-primary`)
- [ ] No hardcoded `shadow-sm`, `shadow-md` (use `shadow-ambient`)
- [ ] No hardcoded `border-gray-*` (use `border-surface-container-low`)

### ✅ Focus States

- [ ] Focus ring uses `focus:ring-primary` or `focus:ring-error`
- [ ] Focus ring offset uses `focus:ring-offset-2 dark:focus:ring-offset-surface`
- [ ] No hardcoded `focus:ring-emerald-500` or similar

### ✅ Dark Mode

- [ ] Component works in both light and dark modes
- [ ] Uses `dark:` prefix for dark mode variants
- [ ] Background colors have dark equivalents
  - `bg-white` → `dark:bg-gray-900` (old pattern ❌)
  - `bg-surface-bright` → `dark:bg-surface-container-highest` (new pattern ✅)

### ✅ Accessibility

- [ ] WCAG AA contrast ratios maintained
- [ ] Focus states visible and clear
- [ ] ARIA labels present where needed
- [ ] Semantic HTML used

---

## 4. CI/CD Enforcement

### Pre-commit Hook

File: `.claude/hooks/design-token-check.cjs`

```bash
# Checks for hardcoded colors in components/
npm run check:tokens
```

**What it does:**
- Scans `src/components/` for hardcoded Tailwind colors
- Reports files that violate design token rules
- Blocks commit if critical violations found

**Run manually:**
```bash
npm run check:tokens
```

### CI/CD Pipeline

**Phase 4 — Future:** Add to GitHub Actions
```yaml
- name: Design Token Compliance
  run: npm run check:tokens
```

---

## 5. Adding New Tokens

If new design tokens are needed:

1. **Proposal:** Create issue with token definition
   - Name, value, use case
   - Why existing tokens don't work

2. **Review:** Discuss with design + dev
   - Alignment with design system
   - Impact on existing components

3. **Implementation:**
   - Add to `src/tokens/tokens.yaml` (source of truth)
   - Regenerate `tokens.css`, `tokens.json`, `tokens.tailwind.js`
   - Update `tailwind.config.js` if needed
   - Export from `src/tokens/index.ts`
   - Document in `TOKENS-REFERENCE.md`

4. **Migration:** Update components to use new token

---

## 6. Exceptions & Deprecation

### When to Request Exception

- Feature-specific styling that doesn't fit design system
- One-off pages (landing page, special promotions)
- Temporary workarounds (with deprecation plan)

**Process:**
1. Add comment explaining exception: `// Exception: [reason]`
2. Link to GitHub issue discussing it
3. Set deprecation timeline (e.g., "Remove by Q3 2026")

### Example

```tsx
// ❌ Exception: Settings page has brand-specific color for EVO-GO integration
// Issue: #342 - Move EVO-GO branding to design tokens
// Deprecation: Q3 2026
className="bg-emerald-700"
```

---

## 7. Team Onboarding

### For New Team Members

1. **Read:** `docs/design-system/GETTING-STARTED.md`
2. **Review:** `docs/design-system/TOKENS-REFERENCE.md`
3. **Practice:** Build a component using tokens (guided)
4. **Pair Review:** First PR reviewed by design + dev team

### Design System Training

- Duration: 30 mins
- Topics:
  - Token structure & naming
  - Component patterns (Atomic Design)
  - Common pitfalls & mistakes
  - How to add new tokens

---

## 8. Metrics & Reporting

### Monthly Review

- % of components using design tokens
- # of hardcoded colors in production code
- Design system coverage by component type

**Target:** 100% compliance for atoms, molecules, organisms

---

## 9. Common Questions

**Q: Can I use custom Tailwind classes?**  
A: Only if you document them in token reference first. New tokens are additive, not exceptions.

**Q: What about inherited/old components?**  
A: Phase 4 focuses on NEW code. Refactoring legacy components happens in Phase 5.

**Q: Focus ring keeps breaking in dark mode...**  
A: Always use `dark:focus:ring-offset-surface`. Details: `TOKENS-REFERENCE.md`

---

## Contacts

- **Design System Owner:** Uma (UX Design Expert)
- **Enforcement:** Code review + CI/CD checks
- **Questions/Issues:** GitHub Issues with label `design-system`

---

*Version 1.0 — Phase 4 Enforcement  
Last updated: 2026-04-17*
