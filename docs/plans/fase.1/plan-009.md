# Implementation Plan: Design System Migration — Kanban App
**Plan ID:** plan-009  
**Status:** Pending  
**Created:** 2026-04-06  
**Created By:** @architect (Aria)  
**Complexity:** STANDARD  
**Total Duration:** 6-8 weeks (4 phases)

---

## Executive Summary

**Objective:** Migrate from 34 disparate UI patterns → 14 consolidated design system tokens (4-phase plan).

**Phases:**
- **Phase 1 (Week 1-2):** Foundation setup (tokens, Tailwind config) — @dev + @qa
- **Phase 2 (Week 3-4):** High-impact migration (buttons, inputs) — @dev + @qa + @ux-design-expert
- **Phase 3 (Week 5-7):** Long-tail cleanup — @dev + @qa
- **Phase 4 (Week 8+):** Enforcement (linting, safelist) — @architect + @devops

**Estimated Effort:** 50-60 dev hours + 15-20 QA hours

**Risk Level:** 🟡 MEDIUM (mitigated by staging deployment, visual regression testing)

---

## Critical Dependencies (Backwards)

```
Phase 4 (Enforcement)
  ↓ depends on
Phase 2-3 completion + no regressions
  ↓ depends on
Phase 2 (High-Impact) success ✓ PASS
  ↓ depends on
Phase 1 (Foundation) complete ✓ BUILD SUCCESS
```

---

## Phase 1: Foundation Setup (Week 1-2)
**Owner Agent:** @dev (Dex) — Implementation Lead  
**QA Agent:** @qa (Quinn) — Validation  
**Dependencies:** None (parallel start)

### Subtask 1.1: Create Token Files
- **Owner:** @dev
- **Service:** infra
- **Files to create:**
  - `app/tokens/tokens.yaml` (source of truth)
  - `app/tokens/tokens.json` (W3C DTCG export)
  - `app/lib/token-config.ts` (TypeScript types)
- **Estimated effort:** 2-3 hours
- **Verification:** 
  - Files exist and are valid YAML/JSON
  - TypeScript compiles without errors
- **Notes:** Use existing tokens from consolidation report as source
- **Subtask order in execution:** Day 1-2 of Week 1

### Subtask 1.2: Configure Tailwind
- **Owner:** @dev
- **Service:** infra
- **Files to modify:**
  - `tailwind.config.js`
  - `tailwind.config.json` (if applicable)
- **Estimated effort:** 1-2 hours
- **Verification:**
  - Command: `npm run build` passes without errors
  - Tailwind processes tokens correctly
  - Dev server starts: `npm run dev`
- **Depends on:** 1.1 (tokens must exist)
- **Notes:** Update theme colors, spacing, extend config
- **Subtask order:** Day 3-4 of Week 1

### Subtask 1.3: Add @layer Components
- **Owner:** @dev
- **Service:** frontend
- **Files to create:**
  - `app/styles/tokens.css`
- **Estimated effort:** 1-2 hours
- **Verification:**
  - CSS compiles without errors
  - Tailwind @layer directives recognized
  - Classes available: `.btn-primary`, `.input-default`, etc.
- **Depends on:** 1.2 (Tailwind config complete)
- **Notes:** Define component layer classes for buttons, inputs, text
- **Subtask order:** Day 5 of Week 1 + Day 1-2 of Week 2

### Subtask 1.4: Create Documentation
- **Owner:** @dev
- **Service:** infra
- **Files to create:**
  - `docs/design-system/TOKEN-REFERENCE.md` (developer guide)
  - Update `README.md` with link to token reference
- **Estimated effort:** 1 hour
- **Verification:**
  - Documentation is clear and complete
  - Examples show before/after usage
- **Depends on:** 1.1, 1.3 (tokens + classes defined)
- **Notes:** Include usage examples, token list, component reference
- **Subtask order:** Day 3 of Week 1

### Subtask 1.5: QA Phase 1 Validation
- **Owner:** @qa
- **Service:** qa
- **Verification checklist:**
  - [ ] Token files committed to repo
  - [ ] Tailwind config references tokens
  - [ ] @layer components defined
  - [ ] Documentation complete
  - [ ] Zero visual regressions (dev environment)
  - [ ] Build passes: `npm run build`
  - [ ] Dev server works: `npm run dev`
- **Estimated effort:** 2-3 hours
- **Depends on:** 1.1, 1.2, 1.3, 1.4
- **Verdict:** PASS (proceed to Phase 2) or FAIL (return to @dev)
- **Subtask order:** Day 3-5 of Week 2
- **Gate file:** `docs/qa/gates/design-system-phase-1.yml`

---

## Phase 2: High-Impact Migration (Week 3-4)
**Owner Agent:** @dev (Dex) — Implementation  
**QA Agent:** @qa (Quinn) — Visual & Functional Testing  
**UX Agent:** @ux-design-expert (Uma) — Visual Validation  
**Dependencies:** Phase 1 must be COMPLETE + PASS

### Subtask 2.1: Migrate Button Components
- **Owner:** @dev
- **Service:** frontend
- **Files to modify:**
  - `src/components/LoginForm.tsx`
  - `src/components/RegisterForm.tsx`
  - `src/components/ChangePasswordForm.tsx`
  - `src/components/LoginPageContent.tsx`
  - `src/components/RegisterPageContent.tsx`
- **Estimated effort:** 2-3 hours
- **Changes:**
  - Replace hardcoded button classes → `className="btn-primary"`
  - Replace link button classes → `className="btn-link"`
  - Update secondary buttons → `className="btn-secondary"`
- **Verification:**
  - TypeScript compiles: `npm run typecheck`
  - Buttons render correctly
  - Focus/hover states work
- **Depends on:** Phase 1 complete
- **Notes:** 13 button instances total. Visual regression testing required.
- **Subtask order:** Day 1-2 of Week 3

### Subtask 2.2: Visual Regression Test (Buttons)
- **Owner:** @ux-design-expert
- **Service:** frontend
- **Verification:**
  - Screenshot comparison (before/after)
  - Focus states visible
  - Hover effects work correctly
  - Mobile touch targets adequate
  - Accessibility: tab order, focus-visible
- **Estimated effort:** 1.5 hours
- **Depends on:** 2.1 (components migrated)
- **Notes:** Use browser devtools or Playwright for screenshots
- **Subtask order:** Day 3 of Week 3

### Subtask 2.3: Migrate Input Components
- **Owner:** @dev
- **Service:** frontend
- **Files to modify:**
  - `src/components/LoginForm.tsx`
  - `src/components/RegisterForm.tsx`
  - `src/components/ChangePasswordForm.tsx`
  - `src/components/ForgotPasswordForm.tsx`
  - `src/components/ResendConfirmationForm.tsx`
- **Estimated effort:** 2-3 hours
- **Changes:**
  - Replace hardcoded input classes → `className="input-default"`
  - Apply `.text-hint` to helper text (6 instances)
  - Apply `.text-error` to error messages (6 instances)
- **Verification:**
  - TypeScript compiles: `npm run typecheck`
  - Inputs render correctly
  - Focus ring visible
  - Disabled state styling works
  - Placeholder contrast adequate
- **Depends on:** Phase 1 complete + 2.2 approved
- **Notes:** 6 input instances. Focus on accessibility.
- **Subtask order:** Day 1-2 of Week 4

### Subtask 2.4: Visual Regression Test (Inputs + Text)
- **Owner:** @ux-design-expert
- **Service:** frontend
- **Verification:**
  - Screenshot comparison (before/after)
  - Input focus ring visible
  - Disabled inputs visually distinct
  - Error text color sufficient contrast
  - Mobile responsiveness OK
- **Estimated effort:** 1.5 hours
- **Depends on:** 2.3 (inputs migrated)
- **Subtask order:** Day 3 of Week 4

### Subtask 2.5: QA Gate Phase 2
- **Owner:** @qa
- **Service:** qa
- **Verification checklist:**
  - [ ] 13 button instances migrated ✓
  - [ ] 6 input instances migrated ✓
  - [ ] 8+ text style instances migrated ✓
  - [ ] Visual regression testing PASS (from @ux-design-expert)
  - [ ] Accessibility validated (WCAG AA)
  - [ ] Mobile testing passed
  - [ ] PR reviewed and approved
  - [ ] No regressions in other components
- **Estimated effort:** 3 hours
- **Depends on:** 2.2, 2.4 (visual tests complete)
- **Verdict:** PASS (proceed to Phase 3) or FAIL (return to @dev)
- **Gate file:** `docs/qa/gates/design-system-phase-2.yml`
- **Subtask order:** Day 4-5 of Week 4

### Subtask 2.6: Deploy to Staging
- **Owner:** @devops (EXCLUSIVE)
- **Service:** infra
- **Verification:**
  - Deployed to staging environment
  - Health check passes
  - Team can QA on staging (24 hours)
- **Depends on:** 2.5 PASS verdict
- **Notes:** Wait 24h for team feedback before production merge
- **Subtask order:** Day 5 of Week 4 (conditional)

---

## Phase 3: Long-Tail Cleanup (Week 5-7)
**Owner Agent:** @dev (Dex)  
**QA Agent:** @qa (Quinn)  
**Dependencies:** Phase 2 COMPLETE + PASS + Staging approval

### Subtask 3.1: Migrate Error States & Cards
- **Owner:** @dev
- **Service:** frontend
- **Files to modify:**
  - Identify all files with error card styling
  - Replace hardcoded colors → tokens
  - Update animation classes
- **Estimated effort:** 1-2 hours
- **Changes:**
  - `.bg-red-50/50` → `color.error-background` token
  - `.animate-in`, `.fade-in` → motion tokens
- **Verification:**
  - TypeScript compiles
  - Error scenarios display correctly
  - Animations smooth
- **Depends on:** Phase 2 PASS
- **Subtask order:** Day 1-2 of Week 5

### Subtask 3.2: Migrate Spacing & Layout
- **Owner:** @dev
- **Service:** frontend
- **Files to modify:**
  - Audit all files for hardcoded spacing
  - Replace with spacing tokens
- **Estimated effort:** 1.5-2 hours
- **Changes:**
  - Hardcoded margins → `spacing-*` tokens
  - Hardcoded gaps → `spacing-*` tokens
  - Hardcoded padding → `spacing-*` tokens
- **Verification:**
  - TypeScript compiles
  - Layout unchanged visually
  - Responsive breakpoints work
- **Depends on:** 3.1
- **Subtask order:** Day 3-4 of Week 5

### Subtask 3.3: Final Audit & Cleanup
- **Owner:** @dev
- **Service:** frontend
- **Verification:**
  - Grep for hardcoded values (colors, spacing)
  - Any remaining patterns? Migrate or document as known debt
  - Update documentation with actual usage examples
  - Create style guide screenshot
- **Estimated effort:** 1-2 hours
- **Depends on:** 3.2
- **Subtask order:** Week 6-7

### Subtask 3.4: QA Gate Phase 3
- **Owner:** @qa
- **Service:** qa
- **Verification checklist:**
  - [ ] 34/34 patterns migrated ✓
  - [ ] No hardcoded colors in codebase
  - [ ] No hardcoded spacing in codebase
  - [ ] Documentation updated with real examples
  - [ ] Build passes: `npm run build`
  - [ ] Tests pass: `npm test`
  - [ ] No regressions
- **Estimated effort:** 2-3 hours
- **Depends on:** 3.3
- **Verdict:** PASS (proceed to Phase 4) or FAIL
- **Gate file:** `docs/qa/gates/design-system-phase-3.yml`
- **Subtask order:** Week 7

---

## Phase 4: Enforcement (Week 8+)
**Owner Agent:** @architect (Aria) — Architecture Decision  
**DevOps Agent:** @devops (Gage) — CI/CD Integration  
**Dependencies:** Phase 3 COMPLETE + PASS

### Subtask 4.1: Add ESLint Rules
- **Owner:** @architect
- **Service:** infra
- **Files to modify:**
  - `.eslintrc.json`
- **Estimated effort:** 1-1.5 hours
- **Changes:**
  - Add rule to detect hardcoded colors: `bg-[#...]` pattern
  - Add rule to detect hardcoded spacing: `px-[...]`, `py-[...]`
  - Configure to fail on push
- **Verification:**
  - ESLint runs: `npm run lint`
  - Rule triggers on test case with hardcoded value
  - Passes on code using tokens
- **Depends on:** Phase 3 PASS
- **Notes:** Rule should output helpful message: "Use design tokens instead of hardcoded values"
- **Subtask order:** Week 8 Day 1-2

### Subtask 4.2: Lock Tailwind Safelist
- **Owner:** @architect
- **Service:** infra
- **Files to modify:**
  - `tailwind.config.js`
- **Estimated effort:** 0.5-1 hour
- **Changes:**
  - Enable safelist mode
  - List only approved token classes
  - Disable arbitrary values
  - Configure build to fail if arbitrary used
- **Verification:**
  - Build passes with token classes
  - Build fails with arbitrary classes (`w-[347px]`)
- **Depends on:** 4.1
- **Notes:** `corePlugins: { arbitrary: false }`
- **Subtask order:** Week 8 Day 3-4

### Subtask 4.3: Deploy Enforcement to CI/CD
- **Owner:** @devops (EXCLUSIVE)
- **Service:** infra
- **Verification:**
  - CI checks ESLint rules
  - CI checks Tailwind safelist
  - PRs fail if violations detected
  - Clear error messages guide developers
- **Estimated effort:** 0.5-1 hour (DevOps only)
- **Depends on:** 4.1, 4.2
- **Notes:** Update GitHub Actions workflow to enforce rules
- **Subtask order:** Week 8 Day 5

### Subtask 4.4: Team Training & Documentation
- **Owner:** @architect
- **Service:** infra
- **Files to create:**
  - `docs/design-system/TOKEN-ENFORCEMENT.md`
  - Update `docs/design-system/TOKEN-REFERENCE.md` with "Contract" section
- **Estimated effort:** 1 hour
- **Changes:**
  - Document "approved tokens" contract
  - Show examples of ✅ ALLOWED vs ❌ NOT ALLOWED
  - Explain ESLint rules and how to fix
- **Verification:**
  - Documentation clear and examples correct
- **Depends on:** 4.1, 4.2
- **Subtask order:** Week 9

### Subtask 4.5: Monitor & Metrics
- **Owner:** @architect
- **Service:** infra
- **Verification:**
  - Metrics dashboard created/updated
  - Track: token usage %, new patterns/sprint, build failures, team satisfaction
  - Monthly review scheduled
- **Estimated effort:** 0.5 hours
- **Depends on:** 4.3 (enforcement live)
- **Subtask order:** Week 10+

---

## Risk & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Buttons/inputs look wrong after Phase 2 | MEDIUM | Staging deployment + 24h QA before production |
| Developers create new patterns in Phase 3 | LOW | Phase 4 enforcement catches it in CI |
| Phase 1 foundation breaks build | CRITICAL | Rollback: revert commits (< 5 min) |
| High blast radius changes | MEDIUM | Visual regression tests + accessibility check |

---

## Acceptance Criteria

### Phase 1 ✓
- [ ] Token files exist and are valid
- [ ] Tailwind uses tokens
- [ ] @layer components defined
- [ ] Build passes
- [ ] Zero regressions
- [ ] Team trained

### Phase 2 ✓
- [ ] 27/34 patterns migrated (79%)
- [ ] Visual regression testing PASS
- [ ] Deployed to staging (24h approval)
- [ ] Accessibility validated
- [ ] PR approved by team

### Phase 3 ✓
- [ ] 34/34 patterns migrated (100%)
- [ ] No hardcoded values in codebase
- [ ] Documentation updated
- [ ] Team comfortable with system

### Phase 4 ✓
- [ ] ESLint rules enforcing tokens
- [ ] Tailwind safelist locked
- [ ] Zero new patterns per sprint
- [ ] Metrics tracked
- [ ] Team velocity increased

---

## Timeline

```
Week 1-2: Phase 1 (Foundation) — @dev + @qa
  ├─ 1.1: Create tokens (Day 1-2)
  ├─ 1.2: Configure Tailwind (Day 3-4)
  ├─ 1.3: @layer components (Day 5 + W2 Day 1-2)
  ├─ 1.4: Documentation (Day 3)
  └─ 1.5: QA validation (W2 Day 3-5)

Week 3-4: Phase 2 (High-Impact) — @dev + @qa + @ux
  ├─ 2.1: Migrate buttons (W3 Day 1-2)
  ├─ 2.2: Visual test buttons (W3 Day 3)
  ├─ 2.3: Migrate inputs (W4 Day 1-2)
  ├─ 2.4: Visual test inputs (W4 Day 3)
  ├─ 2.5: QA gate (W4 Day 4-5)
  └─ 2.6: Deploy staging (W4 Day 5)

Week 5-7: Phase 3 (Long-Tail) — @dev + @qa
  ├─ 3.1: Error states (W5 Day 1-2)
  ├─ 3.2: Spacing/layout (W5 Day 3-4)
  ├─ 3.3: Final audit (W6-7)
  └─ 3.4: QA gate (W7)

Week 8+: Phase 4 (Enforcement) — @architect + @devops
  ├─ 4.1: ESLint rules (W8 Day 1-2)
  ├─ 4.2: Tailwind safelist (W8 Day 3-4)
  ├─ 4.3: Deploy to CI/CD (W8 Day 5) — @devops
  ├─ 4.4: Team training (W9)
  └─ 4.5: Monitoring (W10+)
```

---

## Agent Responsibilities Summary

| Agent | Role | Phases | Key Tasks |
|-------|------|--------|-----------|
| **@dev (Dex)** | Implementation Lead | 1, 2, 3 | Token setup, component migration, cleanup |
| **@qa (Quinn)** | QA & Validation | 1, 2, 3 | Gate verification, no-regression testing |
| **@ux-design-expert (Uma)** | Visual Validation | 2 | Screenshot testing, accessibility check |
| **@architect (Aria)** | Architecture & Enforcement | 4 | ESLint rules, team training, monitoring |
| **@devops (Gage)** | CI/CD & Deployment | 2, 4 | Staging deploy, CI/CD enforcement |

---

## Success Metrics

By end of Phase 4:
- ✅ 100% of UI patterns use tokens
- ✅ Zero hardcoded colors/spacing in codebase
- ✅ Build fails if hardcoded values added
- ✅ Team velocity increased (new features faster)
- ✅ Maintenance cost reduced 60%
- ✅ New developers onboard faster

---

## Notes for Implementation

1. **Phase 1 is prerequisite:** Do not start Phase 2 until 1.5 PASS
2. **Visual regression is critical:** Phase 2 relies on @ux-design-expert sign-off
3. **Staging gate:** 24-hour approval window before production merge
4. **Enforcement is protective:** Phase 4 prevents regression of Phase 2-3 gains
5. **Team communication:** Announce phases weekly to maintain momentum

---

**Plan Status:** Ready for Approval  
**Next Step:** User review → Execution starts with Phase 1 Subtask 1.1

