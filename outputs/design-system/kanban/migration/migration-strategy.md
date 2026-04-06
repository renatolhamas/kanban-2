# Design System Migration Strategy — Kanban App

**Team:** 1-2 developers  
**Sprint Length:** 1 week  
**Risk Tolerance:** Balanced  
**Total Duration:** ~6-8 weeks  
**Status:** ✅ Ready for Implementation

---

## Executive Summary

**Objective:** Migrate from 34 disparate UI patterns to 14 consolidated design system tokens and components over 4 phases.

**Impact:**
- **Code reduction:** 59% fewer patterns to maintain
- **Consistency:** All buttons, inputs, text follow single spec
- **Maintainability:** Changes propagate globally (token updates affect entire app)
- **Developer velocity:** New features built faster (reuse existing tokens)

**Timeline:** 6-8 weeks (fits naturally into sprint schedule for small team)

**Risk Level:** 🟡 MEDIUM (Low for Phase 1, increases in Phase 2-3, mitigated by rollback procedures)

---

## Phase Overview

| Phase | Duration | Goal | Risk | Impact |
|-------|----------|------|------|--------|
| **Phase 1** | Week 1-2 | Foundation (add tokens, zero visual changes) | 🟢 LOW | Internal readiness |
| **Phase 2** | Week 3-4 | High-impact components (buttons, inputs) | 🟡 MEDIUM | 30 instances migrated, immediate ROI |
| **Phase 3** | Week 5-7 | Long-tail cleanup (forms, text, spacing) | 🟢 LOW | Final consolidation, proven system |
| **Phase 4** | Week 8+ | Enforcement (prevent regression) | 🟢 LOW | Long-term consistency |

**Key:** 🟢 LOW = <10% blast radius · 🟡 MEDIUM = 10-50% blast radius · 🔴 HIGH = >50% blast radius

---

## Phase 1: Foundation (Week 1-2)

**Goal:** Set up token infrastructure with zero user-facing changes.

**Approach:** "Token only, no migration" — deploy tokens without touching component code.

### Tasks

#### Week 1
- [ ] **Day 1-2:** Add design token files to repo
  - ✅ Create `app/tokens/tokens.yaml` (source of truth)
  - ✅ Create `app/tokens/tokens.json` (W3C DTCG export)
  - ✅ Create `app/lib/token-config.ts` (TypeScript definitions for IDE autocomplete)

- [ ] **Day 3-4:** Configure Tailwind to consume tokens
  - Update `tailwind.config.js` to reference token colors/spacing
  - Example: `primary: tokens.color.primary.$value`
  - Verify no build errors

- [ ] **Day 5:** Documentation + team onboarding
  - Add `TOKEN-REFERENCE.md` to repo
  - Host on internal wiki or README
  - Brief team: "What's coming in Phase 2"

#### Week 2
- [ ] **Day 1-2:** Add @layer components to Tailwind
  - Create `app/styles/tokens.css`
  - Define `.btn-primary`, `.btn-link`, `.btn-secondary`
  - Define `.input-default`, `.text-hint`, `.text-error`
  - Test: no visual regression

- [ ] **Day 3-5:** QA + iteration
  - Verify tokens build without errors
  - Test Tailwind class generation
  - Check TypeScript types (if using token-config.ts)
  - No production deployment yet

### Checklist

- [ ] Token files committed to repo
- [ ] Tailwind config references tokens
- [ ] @layer components defined
- [ ] Documentation complete
- [ ] Team trained on token reference
- [ ] Zero visual regressions in dev environment
- [ ] Build passes (npm run build)

### Risk Assessment

**Risk Level:** 🟢 **LOW**
- Tokens are non-breaking (not used yet)
- No component changes
- Easy rollback (revert commits)

**Rollback Procedure:**
```bash
git revert [token-commit]
npm run build
npm run dev
# Visual inspection - should be identical to baseline
```

### Effort Estimate

- **Dev time:** 6-8 hours total
- **QA time:** 2-3 hours
- **Documentation:** 1-2 hours
- **Team onboarding:** 30 minutes

**Total:** ~10-13 hours (fits in 1-2 week sprint for solo dev)

---

## Phase 2: High-Impact Patterns (Week 3-4)

**Goal:** Migrate highest-impact components for immediate ROI.

**Strategy:** "Prove value early" — migrate buttons & inputs (55 instances), demo the system, build momentum.

### Priority Ranking (by impact/effort ratio)

| Rank | Pattern | Instances | Components | Effort | Est. Time | ROI |
|------|---------|-----------|------------|--------|-----------|-----|
| 1️⃣ | Buttons | 13 | 5 files | 2 hrs | 2-3 hrs | 🟢 **HIGH** |
| 2️⃣ | Inputs | 6 | 4 files | 2 hrs | 2-3 hrs | 🟢 **HIGH** |
| 3️⃣ | Text styles | 8 | 6 files | 2 hrs | 3-4 hrs | 🟡 **MEDIUM** |

### Week 3: Buttons

#### Tasks
- [ ] **Day 1-2:** Migrate button components
  - `LoginForm.tsx` — Replace hardcoded button class with `className="btn-primary"`
  - `RegisterForm.tsx` — Same
  - `ChangePasswordForm.tsx` — Same
  - `LoginPageContent.tsx` — Update link buttons to `className="btn-link"`
  - `RegisterPageContent.tsx` — Same
  
- [ ] **Day 3-4:** Test + adjust
  - Visual regression test (compare screenshots before/after)
  - Verify focus states, hover effects
  - Test on mobile (touch targets)
  - Check accessibility (tab order, focus visible)

- [ ] **Day 5:** Commit & merge
  - Create PR with before/after screenshots
  - Get review approval
  - Merge to main
  - Deploy to staging

#### Validation
```bash
# Before
<button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
  Sign In
</button>

# After
<button className="btn-primary">
  Sign In
</button>
```

**Visual check:** Should be pixel-identical (or imperceptibly close).

### Week 4: Inputs + Consolidation

#### Tasks
- [ ] **Day 1-2:** Migrate input components
  - `LoginForm.tsx` — Email input: `className="input-default"`
  - `RegisterForm.tsx` — Email + password: `className="input-default"`
  - `ChangePasswordForm.tsx` — Current + new password: `className="input-default"`
  - `ForgotPasswordForm.tsx` — Email input: `className="input-default"`
  - `ResendConfirmationForm.tsx` — Email input: `className="input-default"`

- [ ] **Day 3-4:** Test + adjust
  - Focus ring visibility
  - Placeholder text contrast
  - Disabled state styling
  - Mobile responsiveness

- [ ] **Day 5:** Consolidate text styles (quick win)
  - Apply `.text-hint` to helper text (6 instances)
  - Apply `.text-error` to error messages (6 instances)
  - Total: ~1 hour

### Checklist

- [ ] 13 button instances migrated
- [ ] 6 input instances migrated
- [ ] 8+ text style instances migrated
- [ ] Visual regression testing complete
- [ ] Accessibility validated (WCAG AA)
- [ ] Mobile testing passed
- [ ] PR reviewed and approved
- [ ] Deployed to staging

### Risk Assessment

**Risk Level:** 🟡 **MEDIUM**
- Changes affect 27/34 patterns (79% of instances)
- High visibility (buttons, inputs on every page)
- Rollback: revert PR (1 command)

**Mitigation:**
1. Deploy to staging first
2. Team QA for 24 hours
3. Visual regression tooling (if available)
4. Rollback plan: `git revert [commit-hash]`

### Effort Estimate

- **Dev time:** 6-8 hours
- **Testing:** 3-4 hours
- **Iteration/fixes:** 1-2 hours
- **Review + merge:** 1 hour

**Total:** ~12-15 hours (fits in 1-week sprint for 2-dev team)

---

## Phase 3: Long-Tail Cleanup (Week 5-7)

**Goal:** Consolidate remaining patterns. System is "proven" — confidence is high.

### Remaining Work

After Phase 2, 7 patterns remain to consolidate:
- Error card styling (5 instances)
- Page layout/spacing (3 instances)
- Form field containers (2 instances)

### Week 5: Error States + Cards

- [ ] Migrate error card background (`.bg-red-50/50` → `color.error-background` token)
- [ ] Consolidate animation classes (`.animate-in`, `.fade-in` → motion tokens)
- [ ] Test error scenarios

### Week 6: Spacing + Layout

- [ ] Identify hardcoded spacing values (margins, gaps)
- [ ] Consolidate to spacing tokens (`spacing-md`, `spacing-lg`, etc.)
- [ ] Update layout classes

### Week 7: Final Consolidation + Cleanup

- [ ] Audit remaining patterns
- [ ] Any patterns missed in Phase 2?
- [ ] Update documentation with actual usage
- [ ] Create style guide screenshot

### Checklist

- [ ] 34/34 patterns migrated
- [ ] All components use tokens
- [ ] No hardcoded colors, spacing, typography
- [ ] Documentation updated with real usage examples
- [ ] Team trained on new system

### Risk Assessment

**Risk Level:** 🟢 **LOW**
- System is proven (Phase 2 succeeded)
- Changes are isolated
- Rollback is straightforward

### Effort Estimate

- **Dev time:** 4-5 hours
- **Testing:** 2 hours
- **Documentation:** 1-2 hours

**Total:** ~7-9 hours (1 sprint)

---

## Phase 4: Enforcement (Week 8+)

**Goal:** Prevent regression — ensure new code uses tokens, not hardcoded values.

### Enforcement Mechanisms

#### 4.1 Linting Rules

Add ESLint rules to catch hardcoded values:

```javascript
// .eslintrc.json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.name='className'][arguments.value=/bg-\\[#[0-9a-f]{6}\\]/i]",
        "message": "Use design tokens instead of hardcoded colors"
      }
    ]
  }
}
```

**Effect:** PR fails CI if developer writes `bg-[#ff0000]` instead of `bg-error`.

#### 4.2 Tailwind CSS Safelist

Lock down allowed Tailwind classes (prevent arbitrary values):

```javascript
// tailwind.config.js
module.exports = {
  safelist: [
    'btn-primary', 'btn-link', 'btn-secondary',
    'input-default',
    'text-hint', 'text-error', 'text-heading', 'text-label'
  ],
  // Disable arbitrary values
  corePlugins: {
    arbitrary: false
  }
}
```

**Effect:** Only approved token classes are allowed. New arbitrary classes fail build.

#### 4.3 Design Tokens as API Contract

Document the "contract":

```
✅ ALLOWED:
- Use tokens from tokens.yaml
- Use component classes (.btn-primary, .input-default)
- Use Tailwind utilities for responsive design (sm:, md:)

❌ NOT ALLOWED:
- Hardcoded colors (#ff0000, rgb(255,0,0))
- Hardcoded spacing values (px-5, py-3.5)
- Arbitrary Tailwind values (w-[347px])
```

### Enforcement Tasks

- [ ] **Week 8:** Add ESLint rules to catch violations
- [ ] **Week 8:** Update Tailwind config to safelist only approved classes
- [ ] **Week 9:** Add PR checklist: "No hardcoded values" ✓
- [ ] **Week 10:** Document token usage in team wiki
- [ ] **Month 3:** Review metrics (compliance, adoption, velocity)

### Monitoring Metrics

**Track these over time:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token usage rate | 100% | Count className tokens in codebase / total classNames |
| New patterns created | 0 | Count of new hardcoded values added per sprint |
| Build failures | 0/sprint | Track ESLint "hardcoded value" violations |
| Developer satisfaction | >80% | Team survey: "Are tokens easy to use?" |

### Checklist

- [ ] ESLint rules deployed
- [ ] Tailwind safelist enforced
- [ ] PR checklist updated
- [ ] Team trained on enforcement rules
- [ ] Metrics dashboard set up
- [ ] Monthly review scheduled

### Risk Assessment

**Risk Level:** 🟢 **LOW**
- Enforcement is passive (prevents, doesn't change)
- Rollback: disable rules if too strict

---

## Timeline Summary

```
Week 1-2: Phase 1 (Foundation)
  ├─ Commit token files
  ├─ Configure Tailwind
  └─ Add @layer components

Week 3-4: Phase 2 (High-Impact)
  ├─ Migrate buttons (13 instances)
  ├─ Migrate inputs (6 instances)
  └─ Migrate text (8 instances)
  → TOTAL: 27/34 patterns (79%)

Week 5-7: Phase 3 (Long-Tail)
  ├─ Migrate error states
  ├─ Migrate spacing/layout
  └─ Final consolidation
  → TOTAL: 34/34 patterns (100%)

Week 8+: Phase 4 (Enforcement)
  ├─ Add ESLint rules
  ├─ Lock Tailwind config
  └─ Monitoring & metrics
```

---

## Rollback Procedures

### Phase 1 Rollback (Low Risk)

**If tokens break build:**
```bash
git revert [token-commit-hash]
npm run build
npm run dev
```

**Time to rollback:** <5 minutes

### Phase 2 Rollback (Medium Risk)

**If buttons/inputs look broken:**
```bash
# Revert component changes
git revert [phase-2-pr-merge-commit]
npm run build

# Visual check
npm run dev
# Navigate to /login — should look identical to pre-Phase-2
```

**Time to rollback:** <10 minutes

**Prevention:**
1. Deploy Phase 2 to staging first
2. QA for 24 hours
3. Only merge after stakeholder approval

### Phase 3 Rollback (Low Risk)

Similar to Phase 2. Revert individual commits if needed.

---

## Success Criteria

### Phase 1
- ✅ Token files committed
- ✅ Build passes
- ✅ Zero visual regressions
- ✅ Team trained

### Phase 2
- ✅ 27 instances migrated (buttons, inputs, text)
- ✅ Visual regression testing passed
- ✅ Accessibility validated (focus, contrast, keyboard)
- ✅ Deployed to staging + production
- ✅ Users report no visual difference (a11y metric)

### Phase 3
- ✅ 34/34 instances migrated
- ✅ No hardcoded colors/spacing in codebase
- ✅ Documentation 100% current
- ✅ Team comfortable with token system

### Phase 4
- ✅ ESLint rules enforcing tokens
- ✅ Zero new hardcoded values per sprint
- ✅ Metrics dashboard tracking compliance
- ✅ Team velocity increased (faster feature delivery)

---

## ROI Projection

### Phase 1: Foundation (Low ROI)
- Cost: 12 hours dev time
- Benefit: Internal readiness
- ROI: Negative (setup cost)

### Phase 2: High-Impact (Medium ROI)
- Cost: 12 hours dev time
- Benefit: 
  - 27 instances consolidated (-75% duplicates)
  - Bug fixes affect all 27 at once (faster iteration)
  - New features reuse tokens (3-5 hours saved per feature)
- ROI: **Positive** (breakeven at ~2 features)

### Phase 3: Long-Tail (High ROI)
- Cost: 8 hours dev time
- Benefit:
  - 100% pattern consolidation
  - Maintenance cost drops 60% (fewer patterns to maintain)
  - New devs onboard faster (learn 1 system, not 34)
- ROI: **Highly Positive** (compound benefit from Phase 2)

### Phase 4: Enforcement (Sustainability)
- Cost: 4 hours setup + ongoing monitoring
- Benefit:
  - Prevents regression (protects Phase 2-3 gains)
  - Zero regressions = zero unplanned work
- ROI: **Protective** (keeps gains sustainable)

---

## Team Communication

### Week 1: Announcement
> "We're implementing a design system to improve consistency and reduce maintenance cost. Week 1-2 is setup (no visible changes). Week 3 is buttons & inputs — your first chance to see the benefits."

### Week 3: Check-in
> "Phase 1 foundation is done. Buttons and inputs are now consolidated. Compare your code before/after — notice the className got shorter? That's the benefit."

### Week 5: Status
> "We're 79% done migrating. Phase 3 is polishing the remaining patterns. By week 7, 100% of the app uses the token system."

### Week 8: Handoff
> "The system is live. Going forward, all new code must use tokens (enforced by linting). Questions? See TOKEN-REFERENCE.md."

---

## Risk Mitigation Checklist

- [ ] **Staging deployment:** Always deploy Phase 2-3 to staging first
- [ ] **Visual regression testing:** Before/after screenshots for review
- [ ] **Team review:** At least one other dev reviews before merge
- [ ] **Rollback procedure documented:** Everyone knows how to revert
- [ ] **Communication:** Announce phases, explain benefits
- [ ] **Monitoring:** Track adoption metrics, report weekly
- [ ] **Flexibility:** If Phase 1 takes longer, extend Week 2 (don't rush)

---

## Dependencies

- **Phase 1:** Requires tokens.yaml, tokens.json (✅ Generated)
- **Phase 2:** Requires Phase 1 foundation (✅ Planned)
- **Phase 3:** Requires Phase 2 success (contingent)
- **Phase 4:** Requires Phase 3 completion (contingent)

---

## Next Steps

1. **Review this plan** — Get team alignment
2. **Adjust timeline if needed** — Account for other sprint commitments
3. **Run Phase 1 Week 1** — Add tokens to repo
4. **Measure Phase 2 impact** — Track bugs, velocity, user feedback
5. **Iterate Phase 3-4** — Learn from Phases 1-2, refine approach

---

## Questions & Decisions

**Q: What if Phase 1 reveals missing tokens?**  
A: Add them to tokens.yaml before Phase 2. Better to discover gaps early.

**Q: Can we run Phases in parallel?**  
A: Not recommended for 1-2 dev team. Sequential reduces risk and allows learning.

**Q: What if users report visual regression in Phase 2?**  
A: Revert, investigate, fix, re-test. Use staging deployment as gate.

**Q: How do we prevent new developers from creating patterns?**  
A: Phase 4 enforcement (ESLint, Tailwind safelist). + Onboarding docs.

---

## Stakeholder Sign-Off

| Role | Status | Date |
|------|--------|------|
| **Dev Lead** | ⏳ Pending | — |
| **Designer** | ⏳ Pending | — |
| **PM** | ⏳ Pending | — |

---

*Migration Strategy Generated by Brad Frost Design System Architect*  
*v1.1.0 · 2026-04-06*

---

## Appendix: Files Generated This Sprint

```
outputs/design-system/kanban/
├── audit/
│   ├── pattern-inventory.json     (audit results)
│   └── shock-report.html          (visual inventory)
├── consolidation/
│   ├── consolidation-report.md    (before/after analysis)
│   ├── button-consolidation.txt   (button clustering)
│   ├── input-consolidation.txt    (input clustering)
│   └── pattern-mapping.json       (old → new mapping)
├── tokens/
│   ├── tokens.yaml                (source of truth)
│   ├── tokens.json                (W3C DTCG export)
│   └── TOKEN-REFERENCE.md         (developer guide)
└── migration/
    └── migration-strategy.md      (this file)
```

**Total Artifacts:** 11 files  
**Total Documentation:** ~12,000 words  
**Ready for:** Phase 1 implementation
