# Design System Quick Start Guide — Kanban App

**Status:** Ready to Execute  
**Created:** 2026-04-06  
**For:** Development Team  
**Timeline:** 6-8 weeks (1-week sprints)  
**Team Size:** 1-2 developers

---

## 📋 What This Guide Does

This is the **executable version** of the design system migration. Every step is:
- ✅ Concrete (not theoretical)
- ✅ Copy-paste ready (code included)
- ✅ Checkpoint validated (success criteria listed)
- ✅ Traceable (files referenced)

**Related Documents:**
- Full strategy: `outputs/design-system/kanban/migration/migration-strategy.md`
- Token reference: `outputs/design-system/kanban/tokens/TOKEN-REFERENCE.md`
- Pattern mapping: `outputs/design-system/kanban/consolidation/pattern-mapping.json`

---

## 🚀 Phase 1: Foundation (Week 1-2)

**Goal:** Add token infrastructure. Zero visual changes.

### Day 1-2: Copy Token Files to Repo

**Step 1.1:** Create token directories
```bash
mkdir -p app/tokens
mkdir -p app/styles
mkdir -p app/lib
```

**Step 1.2:** Copy token files from audit output to repo
```bash
# From: outputs/design-system/kanban/tokens/
# To: app/tokens/

cp outputs/design-system/kanban/tokens/tokens.yaml app/tokens/tokens.yaml
cp outputs/design-system/kanban/tokens/tokens.json app/tokens/tokens.json
```

**Step 1.3:** Copy token reference to docs
```bash
cp outputs/design-system/kanban/tokens/TOKEN-REFERENCE.md docs/DESIGN_TOKENS.md
```

**✅ Checkpoint 1.1:** Verify files exist
```bash
ls -la app/tokens/tokens.yaml
ls -la app/tokens/tokens.json
ls -la docs/DESIGN_TOKENS.md
```

Expected output: All 3 files listed, each >1KB

---

### Day 3-4: Update Tailwind Config

**Step 1.4:** Edit `tailwind.config.js`

**Current file location:** `tailwind.config.js` (in project root)

**Add this to the config:**

```javascript
// At the top of the file, after other imports:
const tokens = require('./app/tokens/tokens.json');

// Inside module.exports { theme: { ... } }
module.exports = {
  theme: {
    colors: {
      primary: tokens.color.primary.$value,           // #2563eb
      'primary-dark': tokens.color['primary-dark'].$value, // #1d4ed8
      'text-default': tokens.color['text-default'].$value,
      'text-muted': tokens.color['text-muted'].$value,
      error: tokens.color.error.$value,
      'error-background': tokens.color['error-background'].$value,
      'background-base': tokens.color['background-base'].$value,
      'background-input': tokens.color['background-input'].$value,
      'border-light': tokens.color['border-light'].$value,
      white: tokens.color.white.$value,
    },
    spacing: {
      xs: tokens.spacing.xs.$value,    // 0.25rem
      sm: tokens.spacing.sm.$value,    // 0.5rem
      md: tokens.spacing.md.$value,    // 1rem
      lg: tokens.spacing.lg.$value,    // 1.5rem
      xl: tokens.spacing.xl.$value,    // 2rem
      '2xl': tokens.spacing['2xl'].$value, // 3rem
    },
    borderRadius: {
      sm: tokens['border-radius'].sm.$value,
      md: tokens['border-radius'].md.$value,
      lg: tokens['border-radius'].lg.$value,
      xl: tokens['border-radius'].xl.$value,
      '2xl': tokens['border-radius']['2xl'].$value,
    },
  }
}
```

**Step 1.5:** Add @layer components

**Create new file:** `app/styles/tokens.css`

```css
/* Design System Component Layer */
@layer components {
  /* BUTTONS */
  .btn-primary {
    @apply bg-primary text-white rounded-lg px-4 py-2.5 hover:bg-primary-dark transition-colors;
  }

  .btn-link {
    @apply text-primary hover:text-primary-dark transition-colors;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-300 transition-colors;
  }

  /* INPUTS */
  .input-default {
    @apply w-full px-4 py-2.5 bg-background-input border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-text-muted disabled:bg-background-input disabled:text-text-muted;
  }

  /* TEXT UTILITIES */
  .text-hint {
    @apply text-sm text-text-muted;
  }

  .text-error {
    @apply text-sm font-medium text-error;
  }

  .text-heading {
    @apply text-3xl font-extrabold text-text-default tracking-tight;
  }

  .text-label {
    @apply text-sm font-semibold text-gray-700;
  }
}
```

**Step 1.6:** Import tokens.css into your main CSS

Find your main CSS file (likely `app/globals.css`) and add:

```css
/* At the top, after @tailwind directives */
@import './styles/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**✅ Checkpoint 1.2:** Test build

```bash
npm run build
```

Expected output: Build succeeds with no errors

---

### Day 5: Documentation & Team Onboarding

**Step 1.7:** Add token guide to project README

Create `docs/DESIGN_TOKENS.md` (you already have this from Step 1.3)

**Step 1.8:** Slack/Team message

> "🎨 **Design System Phase 1 complete!**
> 
> We've added a token system to standardize UI patterns. No visual changes yet — this is internal foundation.
> 
> **For developers:** If you need a color, spacing, or font size, check `docs/DESIGN_TOKENS.md` for the canonical token.
> 
> **Phase 2 starts next week:** We'll start migrating buttons and inputs to use these tokens."

**✅ Checkpoint 1.3:** Team trained

- [ ] Team has read TOKEN-REFERENCE.md
- [ ] Team understands: "Don't hardcode colors/spacing, use tokens"
- [ ] At least one person can explain the 3 button classes (.btn-primary, .btn-link, .btn-secondary)

---

## ✅ Phase 1 Complete Checklist

Before moving to Phase 2:

- [ ] Token files copied to `app/tokens/`
- [ ] `tailwind.config.js` updated with token colors/spacing/radius
- [ ] `app/styles/tokens.css` created with @layer components
- [ ] `tokens.css` imported in `app/globals.css`
- [ ] `npm run build` succeeds (0 errors)
- [ ] Visual inspection in browser — page looks identical to baseline
- [ ] Team has read `docs/DESIGN_TOKENS.md`
- [ ] No hardcoded color/spacing values visible in build

**If all ✅:** You're ready for Phase 2

**If any ❌:** Fix before proceeding (don't skip Phase 1 gaps)

---

## 🎯 Phase 2: High-Impact Migration (Week 3-4)

**Goal:** Migrate buttons, inputs, and text (27/34 instances). Prove the system works.

### Week 3: Button Migration

**Step 2.1:** Find all button files

```bash
grep -r "bg-blue-600 text-white" app/components --include="*.tsx"
```

Expected files (from pattern audit):
- `app/components/LoginForm.tsx`
- `app/components/RegisterForm.tsx`
- `app/components/ChangePasswordForm.tsx`
- `app/components/LoginPageContent.tsx`
- `app/components/RegisterPageContent.tsx`

**Step 2.2:** Update each button component

**Example 1: LoginForm.tsx**

```tsx
// BEFORE
<button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
  Sign In
</button>

// AFTER
<button className="btn-primary">
  Sign In
</button>
```

**Example 2: Link buttons in LoginPageContent.tsx**

```tsx
// BEFORE
<a href="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors">
  Forgot password?
</a>

// AFTER
<a href="/forgot-password" className="btn-link">
  Forgot password?
</a>
```

**Step 2.3:** Validate button changes

```bash
# Count remaining hardcoded blue-600 buttons (should be 0)
grep -r "bg-blue-600" app/components --include="*.tsx" | grep -v ".btn-primary" | wc -l
```

Expected output: `0`

**✅ Checkpoint 2.1:** Visual test

```bash
npm run dev
```

Navigate to `/login` and `/register`. Compare with baseline:
- Button appearance unchanged? ✅
- Button hover effect works? ✅
- Button focus ring visible? ✅

---

### Week 4: Input + Text Migration

**Step 2.4:** Update input fields

Files to update (from pattern audit):
- `app/components/LoginForm.tsx` (email input)
- `app/components/RegisterForm.tsx` (email + password)
- `app/components/ChangePasswordForm.tsx` (current + new password)
- `app/components/ForgotPasswordForm.tsx` (email)
- `app/components/ResendConfirmationForm.tsx` (email)

**Example: LoginForm.tsx**

```tsx
// BEFORE
<input
  type="email"
  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
  placeholder="Email"
/>

// AFTER
<input
  type="email"
  className="input-default"
  placeholder="Email"
/>
```

**Step 2.5:** Update text styles

Find helper text (usually right after inputs):

```tsx
// BEFORE
<p className="pt-2 text-center text-sm text-gray-500">
  Don't have an account? <a href="/register">Sign up</a>
</p>

// AFTER
<p className="text-hint">
  Don't have an account? <a href="/register">Sign up</a>
</p>
```

Find error text:

```tsx
// BEFORE
{error && <p className="text-sm font-medium text-red-800">{error}</p>}

// AFTER
{error && <p className="text-error">{error}</p>}
```

**Step 2.6:** Validate input changes

```bash
# Count remaining hardcoded input classes (should be 0)
grep -r "px-4 py-2.5 bg-gray-50 border" app/components --include="*.tsx" | wc -l
```

Expected output: `0`

**✅ Checkpoint 2.2:** TypeScript validation

```bash
npm run typecheck
```

Expected output: `0 errors`

**✅ Checkpoint 2.3:** Build validation

```bash
npm run build
```

Expected output: Build succeeds

**✅ Checkpoint 2.4:** Staging deployment test

```bash
npm run dev
```

Test all pages:
- [ ] Login page loads correctly
- [ ] Register page loads correctly
- [ ] Password change form works
- [ ] Forgot password form works
- [ ] All inputs have proper focus ring (blue)
- [ ] Error messages display correctly
- [ ] No layout shifts

---

## ✅ Phase 2 Complete Checklist

- [ ] 13 button instances replaced with `.btn-primary` / `.btn-link` / `.btn-secondary`
- [ ] 6 input instances replaced with `.input-default`
- [ ] 8 text instances replaced with `.text-hint` / `.text-error` / `.text-heading` / `.text-label`
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run build` passes (0 errors)
- [ ] Visual inspection passes (no regression)
- [ ] All forms functional (submit, validation, focus)
- [ ] Accessibility validated (tab order, focus visible, contrast)

**Total instances migrated: 27/34 (79%)**

**If all ✅:** Ready for Phase 3

**If any ❌:** Fix before committing

---

## 📊 Phase 3: Long-Tail Cleanup (Week 5-7)

**Goal:** Migrate remaining 7 patterns (error cards, spacing, layout).

### Step 3.1: Error Card Styling

Find error cards (FormError component or similar):

```tsx
// BEFORE
<div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
  {error}
</div>

// AFTER
<div className="mt-6 p-4 bg-error-background border border-red-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
  {error}
</div>
```

### Step 3.2: Consolidate spacing

Search for hardcoded margin/padding:

```bash
grep -r "mt-[0-9]" app/components --include="*.tsx"
```

Replace with token values:

```tsx
// BEFORE
<div className="mt-8 space-y-5">

// AFTER (using token scale: md=1rem, lg=1.5rem, xl=2rem)
<div className="mt-[2rem] space-y-[1.5rem]">
```

Or better: Create spacing utility classes in `app/styles/tokens.css`:

```css
@layer utilities {
  .gap-section { @apply gap-xl; }
  .gap-field { @apply gap-lg; }
  .gap-tight { @apply gap-md; }
}
```

### Step 3.3: Validate Phase 3

```bash
npm run typecheck
npm run build
npm run dev
```

---

## ✅ Phase 3 Complete Checklist

- [ ] 34/34 instances migrated
- [ ] No hardcoded colors remain (`grep -r "#[0-9a-f]{6}" app/components`)
- [ ] No hardcoded spacing remain (consistent use of token scale)
- [ ] `npm run build` passes
- [ ] Visual inspection: page identical to Phase 2
- [ ] Documentation updated with actual usage

**Total coverage: 100%**

---

## 🔒 Phase 4: Enforcement (Week 8+)

**Goal:** Prevent regression. Enforce token usage in CI/CD.

### Step 4.1: Add ESLint rule (Optional)

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "no-hardcoded-colors": "warn"
  }
}
```

Or use this regex rule:

```json
{
  "rules": {
    "no-restricted-syntax": [
      "warn",
      {
        "selector": "JSXAttribute[name.name='className'] > Literal[value=/bg-\\[#|text-\\[#/]",
        "message": "Use design tokens instead of hardcoded colors (e.g., className='bg-primary')"
      }
    ]
  }
}
```

### Step 4.2: Add to PR checklist template

Create `.github/pull_request_template.md`:

```markdown
## Checklist

- [ ] Uses design tokens (no hardcoded colors/spacing)
- [ ] Components use `.btn-*`, `.input-default`, `.text-*` classes
- [ ] No new className over 100 characters (should be token class)
- [ ] Accessibility validated (focus, contrast, keyboard)
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
```

### Step 4.3: Team training

Share this one-liner with team:

> **"When writing className: Ask 'Does this color/spacing/size have a token?' If yes, use it. If no, add it to tokens.yaml first."**

---

## 🎯 Success Metrics

Track these during migration:

| Metric | Target | Verify |
|--------|--------|--------|
| **Phase 1** | Token files integrated | `ls app/tokens/tokens.yaml && npm run build` |
| **Phase 2** | 27 instances migrated | `grep -r "btn-primary\|input-default" app/components \| wc -l` |
| **Phase 3** | 34/34 instances migrated | `grep -r "#[0-9a-f]{6}" app/components \| wc -l` (should be 0) |
| **Phase 4** | Zero regressions per sprint | Track "hardcoded value" violations in CI/CD |

---

## 🚨 Troubleshooting

### Build fails after Phase 1
```bash
# Check if tokens.css is imported
grep -n "tokens.css" app/globals.css

# Check if tailwind.config.js references tokens.json correctly
grep -n "require.*tokens.json" tailwind.config.js

# Clear cache and rebuild
rm -rf .next && npm run build
```

### Button looks different after migration
```bash
# Compare old class vs new class in TOKEN-REFERENCE.md
# Verify @layer component includes ALL properties from original

# Example: old class has focus:ring-2, new class must also have it
# Check: app/styles/tokens.css has "focus:ring-2" in .btn-primary definition
```

### Input focus ring not showing
```bash
# Verify focus:ring-2 in .input-default
# Check: focus:ring-primary/20 maps to correct token color

# Test in browser dev tools:
# 1. Click input field
# 2. Inspect: should show ring-primary with opacity
```

### TypeScript error with className
```bash
# Ensure className is string (not object)
// WRONG:
<button className={{ primary: true }}>

// RIGHT:
<button className="btn-primary">
```

---

## 📞 Questions During Implementation?

Refer to:
- **Token values:** `docs/DESIGN_TOKENS.md`
- **Button variants:** `outputs/design-system/kanban/consolidation/button-consolidation.txt`
- **Input details:** `outputs/design-system/kanban/consolidation/input-consolidation.txt`
- **Full strategy:** `outputs/design-system/kanban/migration/migration-strategy.md`

---

## 🏁 Final Checklist (Ready to Ship)

Before deploying to production:

- [ ] Phase 1: Tokens integrated ✅
- [ ] Phase 2: High-impact migration complete ✅
- [ ] Phase 3: 100% coverage ✅
- [ ] Phase 4: Enforcement rules in place ✅
- [ ] All tests passing ✅
- [ ] `npm run build` succeeds ✅
- [ ] Staging environment tested ✅
- [ ] No visual regressions ✅
- [ ] Accessibility validated (WCAG AA) ✅
- [ ] Team trained on token system ✅
- [ ] Documentation complete ✅

**Status:** Ready for production deployment 🚀

---

*Quick Start Guide for Kanban App Design System*  
*Generated: 2026-04-06 by Brad Frost Design System Architect*
