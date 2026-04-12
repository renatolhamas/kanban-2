# Design System Governance 🏛️

**Effective Date:** 2026-04-12  
**Status:** v1.0.0 (Launch)  
**Owner:** Solo Fullstack Developer  
**Last Updated:** 2026-04-12

---

## 1. Ownership & Authority

### Single Owner Model
- **Owner:** Sole developer (you)
- **Approval:** No external approval needed for token changes
- **Decision Authority:** Full authority over design system direction
- **Timeline:** Decisions are implemented immediately

### Why Single Owner?
- Fast decision-making
- No consensus bottleneck
- Clear accountability
- Design system remains cohesive (single vision)

---

## 2. Token Source of Truth

### Single Source Rule
**`design-system/tokens/tokens.yaml`** is the ONLY source of truth for all design tokens.

### Where Tokens Live
```
design-system/
├── tokens/
│   ├── tokens.yaml              ← EDIT HERE (source of truth)
│   └── build/
│       ├── tokens.json          ← Generated (auto)
│       ├── tokens.css           ← Generated (auto)
│       ├── tokens.tailwind.js   ← Generated (auto)
│       └── tokens.scss          ← Generated (auto)
```

### Change Process

**To add or modify a token:**

1. Edit `design-system/tokens/tokens.yaml`
2. Run: `npm run tokens:export`
3. Verify generated files in `build/`
4. Commit both `tokens.yaml` AND `build/` files

**Example:**
```bash
# 1. Edit tokens.yaml
# 2. Export
npm run tokens:export

# 3. Verify
ls -la design-system/tokens/build/

# 4. Commit
git add design-system/tokens/
git commit -m "feat: add new color token --color-success [Token Update]"
```

### Why tokens.yaml?
- ✅ Human-readable YAML format
- ✅ Version-controlled single source
- ✅ Generates all formats automatically (CSS, JSON, Tailwind, SCSS, W3C DTCG)
- ✅ No manual sync between formats (error-proof)
- ✅ Future-proof for Figma Tokens plugin integration

---

## 3. Versioning Strategy

### Semantic Versioning (SemVer)

```
{MAJOR}.{MINOR}.{PATCH}
```

| Version | When | Impact |
|---------|------|--------|
| **PATCH** (v1.0.1) | Bug fixes, color adjustments | Backward compatible |
| **MINOR** (v1.1.0) | New tokens, new variants | Backward compatible |
| **MAJOR** (v2.0.0) | Breaking changes, token removal | NOT backward compatible |

### Launch Version
- **v1.0.0** — Published with first component set (Button, Input, Card, Toast)
- **After launch:** Increment with each change

### Version Location
```yaml
# design-system/tokens/tokens.yaml (top of file)
---
version: "1.0.0"
name: "Synkra Design System"
...
```

### Breaking Change Examples
- Removing a token entirely
- Renaming a token (breaking old code)
- Restructuring token hierarchy
- Changing token values significantly

---

## 4. Dark Mode Support

### Two Modes (Both Active)

#### 1️⃣ Automatic (@media prefers-color-scheme)
- **Trigger:** System OS dark mode preference
- **Selector:** `@media (prefers-color-scheme: dark)`
- **Behavior:** Auto-applies when user's OS is set to dark mode
- **No JS needed:** Pure CSS

#### 2️⃣ Manual ([data-theme] attribute)
- **Trigger:** User toggles ThemeToggle component
- **Selector:** `[data-theme="dark"]`
- **Behavior:** Overrides system preference when user chooses
- **JS managed:** React state + localStorage

### How They Work Together

**Priority (Cascading):**
```css
/* Level 1: Light mode (default) */
:root {
  --color-primary: #007acc;
  ...
}

/* Level 2: System dark mode preference */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #0098ff;
    ...
  }
}

/* Level 3: User manual override (highest priority) */
[data-theme="dark"] {
  --color-primary: #0098ff;
  ...
}
```

### Testing Dark Mode
- ✅ Test with system dark mode ON (macOS/Windows/Linux)
- ✅ Test with system dark mode OFF + manual toggle ON
- ✅ Test with system dark mode ON + manual toggle OFF (override works)
- ✅ Test localStorage persistence (refresh page, theme stays)

### Why Both?
- **Accessibility:** Respects user's OS preference (WCAG)
- **Control:** Users can override if they prefer
- **Future-proof:** WCAG requires respecting prefers-color-scheme
- **No flicker:** CSS-based, no JS delay on load

---

## 5. Deprecation Strategy

### Minimum Time Deprecation
**Rule:** Remove old code immediately after refactor is complete.

### Deprecation Process

**Timeline:**
```
Refactor Complete
    ↓
Remove old code IMMEDIATELY (no grace period)
    ↓
Commit with message mentioning deprecation
    ↓
Done (no legacy support)
```

### Why No Grace Period?
- This is a solo fullstack project (no external dependents)
- Design system is internal-only (not a published library)
- Immediate removal keeps codebase clean
- No breaking changes to manage (you control all code)

### Example: Deprecating Old Button

**Before:**
```tsx
// src/components/ui/ButtonOld.tsx (deprecated)
export function Button() { ... }

// src/components/ui/Button.tsx (new)
export function Button() { ... }
```

**After refactor complete:**
```bash
# 1. Update all imports to new Button
grep -r "ButtonOld" src/
# (replace with new Button)

# 2. Delete old file
rm src/components/ui/ButtonOld.tsx

# 3. Commit
git commit -m "refactor: remove ButtonOld in favor of Button [Deprecation]"
```

### What NOT to Do
- ❌ Keep both old and new for "backward compatibility"
- ❌ Add deprecation warnings
- ❌ Maintain two versions
- ❌ Wait for a "grace period"

---

## 6. Change Management

### Who Can Change What

| Area | Authority | Process |
|------|-----------|---------|
| **Token values** | You (sole owner) | Edit `tokens.yaml` → `npm run tokens:export` → commit |
| **Token structure** | You (sole owner) | Same as above |
| **Component specs** | You (sole owner) | Update in component code directly |
| **Dark mode** | You (sole owner) | Update CSS in `app/globals.css` + `tokens.yaml` |
| **Tooling (npm scripts)** | You (sole owner) | Update `package.json` or scripts directly |

### No Review Needed
- No design review process (you decide)
- No approval gates (you approve your own changes)
- No stakeholder sign-off (you're responsible to yourself)

### Quality Gate (Self-Review)
Before committing any change:
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run storybook` shows changes correctly
- [ ] No console errors

---

## 7. Maintenance & Scaling

### Current Phase (Phase 0-2)
- **Focus:** Establish design system foundation
- **Token scope:** Core + Semantic tokens only
- **Components:** Atomic (Button, Input, Card, etc.)

### When to Evolve Governance
After Phase 2 (when system is production), re-evaluate:
- If adding more team members → document approval process
- If publishing as library → add versioning/deprecation grace period
- If external dependents → add breaking change policy

### Annual Review
- [ ] Check token usage in codebase
- [ ] Review deprecated patterns
- [ ] Update versioning strategy if needed
- [ ] Document new decisions

---

## 8. Tools & Resources

### Token Management
- **Editor:** Edit `design-system/tokens/tokens.yaml` (YAML)
- **Export:** `npm run tokens:export` (auto-generates all formats)
- **Validation:** `npm run tokens:validate` (checks token syntax)
- **Version:** Semantic versioning in `tokens.yaml`

### Component Building
- **Path:** `src/components/ui/` (Storybook auto-discovers)
- **Testing:** Vitest + Storybook stories
- **Dark mode:** Test in both @media and [data-theme]

### Documentation
- **Design tokens:** This file (GOVERNANCE.md)
- **Contributing:** docs/design-system/CONTRIBUTING.md
- **Components:** Storybook (`npm run storybook`)
- **Implementation plan:** docs/plans/F2.PLAN.01.FINAL.EXECUTABLE.md

---

## 9. Principles

1. **Single Source:** `tokens.yaml` is law
2. **Owner Authority:** You decide, you implement
3. **No Grace Period:** Remove deprecated code immediately
4. **Token-Driven:** All styling from tokens, no hardcoded values
5. **Tested:** Lint, typecheck, test must pass
6. **Documented:** Changes documented with commit messages
7. **Dark Mode First:** Both @media and [data-theme] support built-in
8. **Future-Proof:** Structured for team scaling (if needed later)

---

## 10. Quick Reference

```bash
# Add a new token
nano design-system/tokens/tokens.yaml
npm run tokens:export
git add design-system/tokens/ && git commit -m "feat: add token X"

# Update existing token
nano design-system/tokens/tokens.yaml
npm run tokens:export
git add design-system/tokens/ && git commit -m "fix: update token X"

# Validate tokens
npm run tokens:validate

# Create new component using tokens
# → See CONTRIBUTING.md

# Test dark mode
# → Open DevTools → Rendering → Emulate CSS media feature prefers-color-scheme: dark
# → Or toggle ThemeToggle component
```

---

**Owner:** You 👤  
**Last Updated:** 2026-04-12  
**Version:** 1.0.0  
**Status:** ✅ Active

— Aria 🏛️
