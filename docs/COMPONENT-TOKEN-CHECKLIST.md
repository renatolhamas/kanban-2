# Component Token Compliance Checklist

**Purpose:** Reusable validation checklist for all new UI components  
**Last Updated:** 2026-04-11  
**Created by:** Story 2.8 — Token Audit & Documentation  
**Applies to:** All components in `components/common/`

---

## 📋 Pre-Implementation Checklist

**Before writing component code, verify:**

- [ ] Design exists in Storybook (or planned)
- [ ] Token design documented in DESIGN-TOKENS.md
- [ ] Component size variants defined (sm, md, lg, etc.)
- [ ] Color variants planned (primary, secondary, danger, etc.)

---

## ✅ Spacing Compliance Checklist

**Verify ALL padding, margin, and gap values use the 8px scale:**

### Padding (p, px, py, pt, pr, pb, pl)

- [ ] **Primary padding** uses `p-2` (8px), `p-4` (16px), or `p-6` (24px)
- [ ] **Horizontal padding** (`px-*`) matches spacing scale:
  - `px-2` (8px) for tight components
  - `px-3` (12px) for input fields
  - `px-4` (16px) for standard components
  - `px-6` (24px) for loose components
- [ ] **Vertical padding** (`py-*`) matches spacing scale:
  - `py-2` (8px) for buttons, inputs
  - `py-3` (12px) for form elements
  - `py-4` (16px) for cards, sections
- [ ] **Top/Bottom specific** (`pt-*`, `pb-*`) only when asymmetry needed
- [ ] **Left/Right specific** (`pl-*`, `pr-*`) only when asymmetry needed

### Margin (m, mx, my, mt, mr, mb, ml)

- [ ] **Vertical margins** (`my-*`, `mb-*`, `mt-*`) use:
  - `my-2` (8px) between inline elements
  - `my-4` (16px) between form fields
  - `my-6` (24px) between major sections
- [ ] **Horizontal margins** (`mx-*`, `ml-*`, `mr-*`) only for asymmetric layouts
- [ ] **Negative margins** (`-m-*`) documented and justified (rare)

### Gap (gap, gap-x, gap-y)

- [ ] **Flex/Grid gap** uses standard scale:
  - `gap-2` (8px) for tight layouts
  - `gap-4` (16px) for standard layouts
  - `gap-6` (24px) for loose layouts
- [ ] **Row-specific gap** (`gap-y-*`) justified
- [ ] **Column-specific gap** (`gap-x-*`) justified

### ❌ DO NOT USE

These values are **NOT in the 8px scale** — avoid them:

```
py-1 (4px)     ❌ Too small, use py-2 instead
py-1.5 (6px)   ❌ Non-standard, use py-2 instead
py-5 (20px)    ❌ Not defined, use py-4 or py-6
mb-1.5 (6px)   ❌ Non-standard, use mb-2 instead
px-2.5 (10px)  ❌ Non-standard, use px-3 instead
p-10 (40px)    ❌ Not defined, use p-8 or p-12 instead
```

---

## 🎨 Color Compliance Checklist

**All colors MUST come from token system:**

### Text Colors

- [ ] **Primary text** uses `text-on-surface` (#191c1e)
- [ ] **Secondary text** uses `text-slate-600` or `text-slate-700`
- [ ] **Disabled text** uses `text-slate-400`
- [ ] **Links** use `text-token-secondary` (#1e40af)
- [ ] **Error text** uses `text-token-danger` (#ef4444)

### Background Colors

- [ ] **Component background** uses:
  - `bg-surface-lowest` (white) for cards, modals, dropdowns
  - `bg-surface` (cool gray 50) for page backgrounds
  - `bg-token-primary` (#10b981) for CTAs only
- [ ] **Hover states** darken or change opacity (no new colors)
- [ ] **Focus states** use ring tokens (`ring-primary`, `ring-offset-*`)
- [ ] **Disabled states** use `opacity-50` + gray backgrounds

### Button Colors (Variant-Specific)

| Variant | Background | Hover | Active | Disabled |
|---------|-----------|-------|--------|----------|
| primary | `bg-token-primary` (#10b981) | darker 10% | `scale-95` | `bg-gray-400` |
| secondary | `bg-token-secondary` (#1e40af) | darker 10% | `scale-95` | `bg-gray-400` |
| danger | `bg-token-danger` (#ef4444) | darker 10% | `scale-95` | `bg-gray-400` |
| ghost | `bg-transparent` | `bg-surface-low` | `scale-95` | `opacity-50` |

### ❌ DO NOT USE

- Arbitrary colors like `bg-red-500`, `bg-blue-700`
- Hex codes directly in components (use CSS variables)
- Non-contrasting color combinations (must pass WCAG AA: 4.5:1 text, 3:1 graphics)

---

## 📝 Typography Compliance Checklist

**All text MUST use defined font sizes and line heights:**

### Font Sizes

- [ ] **Display text** (hero headings) uses `text-3xl` (32px) or `text-4xl` (40px)
- [ ] **Page headings** use `text-2xl` (24px)
- [ ] **Section headings** use `text-xl` (20px)
- [ ] **Body text** uses `text-base` (16px) as default
- [ ] **Emphasized text** uses `text-lg` (18px)
- [ ] **Labels** use `text-sm` (14px)
- [ ] **Helper/caption text** uses `text-xs` (12px)
- [ ] **Minimum mobile text** is `text-lg` (18px) for accessibility

### Line Heights

- [ ] **Headings** use `leading-tight` (1.2)
- [ ] **Body text** uses `leading-normal` (1.5) as default
- [ ] **Accessible text** uses `leading-relaxed` (1.75)

### Font Weight

- [ ] **Headings** use `font-semibold` (600) or `font-bold` (700)
- [ ] **Body text** uses default (400)
- [ ] **Labels/emphasis** use `font-medium` (500)
- [ ] **Links** use `font-semibold` (600)

### ❌ DO NOT USE

- `text-sm` (14px) for body text on mobile
- Mixed `font-family` — always use Manrope
- Inline `style` for font sizes (use Tailwind classes)

---

## 🌙 Shadow Compliance Checklist

**Use elevation tokens only:**

- [ ] **Cards** use `shadow-token-base` (standard elevation)
- [ ] **Modals/Overlays** use `shadow-token-lg` or `shadow-token-xl`
- [ ] **Buttons on hover** use `shadow-token-sm` (subtle lift)
- [ ] **Floating elements** use `shadow-token-md` or higher
- [ ] **No arbitrary shadows** — all shadows must be token-based

### Shadow Elevation Reference

| Elevation | Token | Use |
|-----------|-------|-----|
| Level 1 | `shadow-token-sm` | Subtle hints, small elevation |
| Level 2 | `shadow-token-base` | Standard cards, default modals |
| Level 3 | `shadow-token-md` | Raised elements, floating menus |
| Level 4 | `shadow-token-lg` | Floating dialogs, high elevation |
| Level 5 | `shadow-token-xl` | Maximum elevation, hero overlays |

---

## ✨ Animation Compliance Checklist

**Use standard animations and durations:**

### Animation Usage

- [ ] **Opacity transitions** use `animate-fade` (200ms)
- [ ] **Scale/zoom effects** use `animate-scale` (200ms)
- [ ] **Position changes** use `animate-slide` (200ms)
- [ ] **All transitions** use `transition-colors` or `transition-all`
- [ ] **Transition duration** uses `duration-150` (fast) or `duration-200` (normal)

### ❌ DO NOT USE

- Custom animation durations (use `--animation-duration-fast` or `--animation-duration-normal`)
- Easing functions other than defined (ease-in-out, ease-out, cubic-bezier only)
- Animations longer than 300ms without design justification

---

## 🔍 Contrast & Accessibility Checklist

**WCAG AA compliance is mandatory:**

### Color Contrast

- [ ] **Text on background** has 4.5:1 minimum contrast ratio
- [ ] **Graphics/icons** have 3:1 minimum contrast ratio
- [ ] **Focus indicators** are clearly visible (3px outline minimum)
- [ ] **Color alone is not used** to convey meaning (icons, patterns also present)

### Accessibility Features

- [ ] **Buttons** have `aria-label` if text is not visible
- [ ] **Forms** have associated `<label>` elements
- [ ] **Required fields** marked with `aria-required="true"` or `required` attribute
- [ ] **Error states** announced with `role="alert"` or `aria-live="polite"`
- [ ] **Focus order** is logical (tab navigation works)
- [ ] **Keyboard navigation** is fully supported

### Dark Mode (if applicable)

- [ ] Component tested with `prefers-color-scheme: dark`
- [ ] Colors remain accessible in dark mode
- [ ] Contrast ratios maintained (or explicitly handled with CSS variables)

---

## 📱 Responsive Design Checklist

- [ ] **Mobile-first approach** — base styles for mobile, add `sm:`, `md:`, `lg:` breakpoints
- [ ] **Spacing scales** appropriately for mobile/tablet/desktop
- [ ] **Font sizes** are readable on all screen sizes
- [ ] **Touch targets** are minimum 44x44px on mobile
- [ ] **No horizontal scroll** on mobile (unless intentional)

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] Component renders without errors
- [ ] Props are passed correctly
- [ ] Variants display as expected
- [ ] Responsive behavior works

### Visual Tests (Storybook)

- [ ] All variants shown in Storybook story
- [ ] Light mode appearance verified
- [ ] Dark mode appearance verified (if applicable)
- [ ] Hover/active/disabled states shown

### Browser Testing

- [ ] Chrome/Chromium latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📋 Implementation Checklist Template

**Copy and paste into your component story/PR description:**

```markdown
## Component Token Compliance

### Spacing
- [ ] All padding uses 8px scale (p-2, p-4, p-6, p-8, etc.)
- [ ] All margins use 8px scale (m-2, m-4, m-6, etc.)
- [ ] All gaps use 8px scale (gap-2, gap-4, gap-6, etc.)

### Colors
- [ ] Text color from `text-on-surface` or semantic tokens
- [ ] Background color from surface tokens or `bg-token-*`
- [ ] All colors pass WCAG AA contrast check
- [ ] No arbitrary hex codes in component

### Typography
- [ ] Font sizes from `text-xs` to `text-4xl` tokens
- [ ] Line heights use `leading-tight`, `leading-normal`, or `leading-relaxed`
- [ ] Minimum body text is `text-base` (16px), mobile `text-lg` (18px)
- [ ] Font weight appropriate for element type

### Shadows
- [ ] Shadows only from `shadow-token-sm` through `shadow-token-xl`
- [ ] Elevation appropriate for component type
- [ ] No arbitrary shadows

### Animation
- [ ] Animations use `animate-fade`, `animate-scale`, or `animate-slide`
- [ ] Durations use `duration-150` or `duration-200`
- [ ] No custom animation values

### Accessibility
- [ ] Contrast ratio ≥4.5:1 for text, ≥3:1 for graphics
- [ ] Focus indicators clearly visible
- [ ] ARIA labels/attributes where needed
- [ ] Keyboard navigation works

### Testing
- [ ] Storybook story created
- [ ] All variants shown
- [ ] Dark mode verified (if applicable)
- [ ] Visual/unit tests added
```

---

## 🎯 Quick Reference: Token Values

### Spacing (8px Grid)

```
0 → 0px
1 → 4px
2 → 8px
3 → 12px
4 → 16px (standard)
5 → 20px
6 → 24px (card spacing)
8 → 32px (section)
12 → 48px
16 → 64px
```

### Font Sizes

```
xs → 12px (captions)
sm → 14px (labels)
base → 16px (body — default)
lg → 18px (emphasized, accessibility min)
xl → 20px (section heading)
2xl → 24px (page heading)
3xl → 32px (major heading)
4xl → 40px (hero)
```

### Colors

```
Primary → #10b981 (Emerald 500)
Secondary → #1e40af (Blue 800)
Danger → #ef4444 (Red 500)
Success → #22c55e (Green 500)
Warning → #f59e0b (Amber 500)
Text → #191c1e (Gray 900)
```

### Shadows

```
sm → 0px 2px 8px (subtle)
base → 0px 4px 16px (standard)
md → 0px 8px 24px (raised)
lg → 0px 12px 32px (floating)
xl → 0px 20px 48px (maximum)
```

---

## 📞 Support & Questions

**Questions about token usage?**
- See: [DESIGN-TOKENS.md](./DESIGN-TOKENS.md)
- Story: 2.8 — Token Audit & Documentation

**Need to add new token?**
- Update: `app/globals.css`
- Update: `tailwind.config.ts`
- Update: `docs/design-tokens.json`
- Create story: 2.X (Token Enhancement)

**Found a non-compliant component?**
- Create GitHub issue with checklist
- Reference: Story 2.8 audit findings
- Plan remediation in next sprint

---

**Last Validated:** 2026-04-11  
**Next Review:** After Story 2.9 (Storybook & A11y Polish)
