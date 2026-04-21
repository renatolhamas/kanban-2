# The Digital Atelier — Design System v2.1.0

**Master Index** — Central documentation hub for the complete design system.

---

## 🎯 Quick Navigation

### 🚀 Getting Started
- **[GETTING-STARTED.md](GETTING-STARTED.md)** — First-time setup and usage guide
- **[SETUP-SUMMARY.md](SETUP-SUMMARY.md)** — Quick reference for setup completion

### 🎨 Design Tokens (The Foundation)
- **[tokens/README.md](tokens/README.md)** — Design tokens quick reference
- **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)** — Complete token documentation
- **[tokens/tokens.yaml](tokens/tokens.yaml)** — Source of truth (W3C DTCG format)
- **[tokens/TOKEN-EXTRACTION-REPORT.md](tokens/TOKEN-EXTRACTION-REPORT.md)** — Full token inventory

### 📦 Component Library
- **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** — Component inventory & migration status
- **[reference/DESIGN.md](reference/DESIGN.md)** — Design reference documentation

### 🔄 Design System Evolution
- **[MIGRATION-STRATEGY.md](MIGRATION-STRATEGY.md)** — 4-phase token migration plan
- **[MIGRATION-PHASE-1.md](MIGRATION-PHASE-1.md)** → [PHASE-2](MIGRATION-PHASE-2.md) → [PHASE-3](MIGRATION-PHASE-3.md) → [PHASE-4](MIGRATION-PHASE-4.md)

### ✅ Quality & Standards
- **[ACCESSIBILITY-GUIDE.md](ACCESSIBILITY-GUIDE.md)** — WCAG AA compliance guide
- **[ENFORCEMENT-GUIDE.md](ENFORCEMENT-GUIDE.md)** — Design system enforcement rules

### 📋 Implementation Specifications
- **[specs/STORY-5.1-5.2-UI-SPECS.md](specs/STORY-5.1-5.2-UI-SPECS.md)** — Enhanced Webhooks UI specs (Stories 5.1 & 5.2)

### 📊 Export & Integration
- **[DTCG-EXPORT-SUMMARY.md](DTCG-EXPORT-SUMMARY.md)** — W3C DTCG export status & verification

---

## 📂 Directory Structure

```
docs/design-system/
├── README.md ← YOU ARE HERE (Master Index)
├── GETTING-STARTED.md
├── SETUP-SUMMARY.md
├── TOKENS-REFERENCE.md
├── COMPONENT-MAPPING.json
├── ACCESSIBILITY-GUIDE.md
├── ENFORCEMENT-GUIDE.md
├── DTCG-EXPORT-SUMMARY.md
│
├── tokens/ (Design Token Exports)
│   ├── README.md ← Token quick reference
│   ├── tokens.yaml ← W3C DTCG source
│   ├── tokens.json
│   ├── tokens.css
│   ├── tokens.tailwind.js
│   ├── tokens-animations-export.css ← Story 5.2 animations
│   └── TOKEN-EXTRACTION-REPORT.md
│
├── reference/ (Visual & Technical Reference)
│   ├── DESIGN.md
│   ├── design-system-v2.html
│   ├── avatars.png
│   └── screen.png
│
├── specs/ (Implementation Specifications)
│   └── STORY-5.1-5.2-UI-SPECS.md ← Webhook enhancement specs
│
└── MIGRATION-PHASE-[1-4].md (Phased Migration Plans)
```

---

## 🎯 Design System at a Glance

| Aspect | Details |
|--------|---------|
| **Version** | 2.1.0 (with Story 5.1 & 5.2 enhancements) |
| **Spec** | W3C DTCG 2025.10 |
| **Color Space** | OKLCH |
| **Foundation** | Atomic Design + Tonal Layering |
| **Token Layers** | 3-layer system (Core → Semantic → Component) |
| **Total Tokens** | 98+ (colors, spacing, typography, motion, shadows) |
| **Components** | Buttons, Inputs, Cards, Badges, Conversations |

---

## 🚀 Typical Workflows

### I'm New to This Design System
1. Start with **[GETTING-STARTED.md](GETTING-STARTED.md)**
2. Learn tokens in **[tokens/README.md](tokens/README.md)**
3. Reference full docs in **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)**

### I'm Building a Component
1. Check **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** for existing patterns
2. Use tokens from **[tokens/README.md](tokens/README.md)**
3. Follow specs in **[specs/](specs/)** if story-driven
4. Verify accessibility in **[ACCESSIBILITY-GUIDE.md](ACCESSIBILITY-GUIDE.md)**

### I'm Implementing Stories 5.1 & 5.2 (Webhook Enhancement)
1. Read **[specs/STORY-5.1-5.2-UI-SPECS.md](specs/STORY-5.1-5.2-UI-SPECS.md)**
2. Use Badge variants (already in component)
3. Import animations from **[tokens/tokens-animations-export.css](tokens/tokens-animations-export.css)**
4. Check token compliance in **[DTCG-EXPORT-SUMMARY.md](DTCG-EXPORT-SUMMARY.md)**

### I'm Migrating to the New Design System
1. Review **[MIGRATION-STRATEGY.md](MIGRATION-STRATEGY.md)** for overall plan
2. Follow phase-by-phase:
   - **[Phase 1](MIGRATION-PHASE-1.md):** Foundation tokens
   - **[Phase 2](MIGRATION-PHASE-2.md):** High-impact components
   - **[Phase 3](MIGRATION-PHASE-3.md):** Cleanup & edge cases
   - **[Phase 4](MIGRATION-PHASE-4.md):** Enforcement & lock-in

### I'm Checking Accessibility Compliance
1. Start with **[ACCESSIBILITY-GUIDE.md](ACCESSIBILITY-GUIDE.md)**
2. Run checks from checklist in `/checklists/accessibility-wcag-checklist.md`
3. Verify color contrast in token definitions

### I'm Reviewing a PR or Design
1. Check **[ENFORCEMENT-GUIDE.md](ENFORCEMENT-GUIDE.md)** for rules
2. Verify tokens used (not hardcoded values)
3. Validate against **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)**

---

## 📊 Current Status

### ✅ Completed
- [x] Design System v2.0 foundation
- [x] 75+ core design tokens
- [x] W3C DTCG compliance
- [x] 3-layer token structure
- [x] Component mapping
- [x] Accessibility guidelines
- [x] Migration strategy (4 phases)
- [x] **Story 5.1 & 5.2 enhancements** (group badge, status badges, animation tokens)
- [x] DTCG export & integration

### 🚧 In Progress
- [ ] Phase 2 component migration (Header, Sidebar, UserMenu)
- [ ] Storybook stories for new variants (5.1 & 5.2)

### 📋 Upcoming
- [ ] Phase 3 cleanup (edge cases)
- [ ] Phase 4 enforcement (ESLint rules, CI checks)
- [ ] Dark mode refinement
- [ ] Storybook integration

---

## 🔗 Key Links

### Documentation
- **Full Token List:** [tokens/TOKEN-EXTRACTION-REPORT.md](tokens/TOKEN-EXTRACTION-REPORT.md)
- **Migration Checklist:** [COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)
- **Accessibility Checklist:** Ask for `accessibility-wcag-checklist.md`

### Code
- **Design Tokens (YAML):** [tokens/tokens.yaml](tokens/tokens.yaml)
- **CSS Exports:** [tokens/tokens.css](tokens/tokens.css)
- **Animation Exports:** [tokens/tokens-animations-export.css](tokens/tokens-animations-export.css)
- **Tailwind Config:** [tokens/tokens.tailwind.js](tokens/tokens.tailwind.js)

### Related Systems
- **Architecture Docs:** `../architecture/index.md`
- **Component Library:** `../components/index.md`
- **PRD & Requirements:** `../prd/index.md`

---

## 💡 Design Principles

### 🎯 Tonal Layering
No 1px borders. Depth through **background color shifts** across 5-step tonal range.

### 🧩 Atomic Design
Structure: Atoms → Molecules → Organisms → Templates → Pages

### 📝 Semantic Naming
Names reflect **intent**, not appearance:
- ✅ `--color-primary` (intent: main action)
- ❌ `--color-blue-500` (appearance: shade)

### ♿ Accessibility First
- WCAG AA minimum (AAA where possible)
- Inclusive color contrast
- Motion respects `prefers-reduced-motion`
- Full keyboard navigation support

---

## 🤝 Contributing

### Adding a New Token
1. Define in **[tokens/tokens.yaml](tokens/tokens.yaml)** (core → semantic → component layers)
2. Document in **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)**
3. Export via `*export-dtcg` command
4. Update **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** if component-scoped

### Adding a New Component
1. Check **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** for existing patterns
2. Use tokens from **[tokens/README.md](tokens/README.md)**
3. Create spec in **[specs/](specs/)** if story-driven
4. Add to **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** with status
5. Follow **[ACCESSIBILITY-GUIDE.md](ACCESSIBILITY-GUIDE.md)**

### Updating Documentation
- Keep **README.md** (this file) as the master index
- Update specific guides when changes made
- Run `*export-dtcg` after token changes
- Sync **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** after component updates

---

## 📞 Support & Questions

### For Token Questions
→ See **[tokens/README.md](tokens/README.md)** or **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)**

### For Component Guidance
→ Check **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** and **[reference/DESIGN.md](reference/DESIGN.md)**

### For Accessibility
→ Review **[ACCESSIBILITY-GUIDE.md](ACCESSIBILITY-GUIDE.md)**

### For Migration Planning
→ Start with **[MIGRATION-STRATEGY.md](MIGRATION-STRATEGY.md)**

### For Implementation Specs
→ See **[specs/](specs/)** folder for story-specific requirements

---

## 📈 Metrics & Impact

| Metric | Value | Status |
|--------|-------|--------|
| **Design Tokens** | 98+ | ✅ Complete |
| **Component Coverage** | 4 built, 8+ in backlog | 🚧 In Progress |
| **WCAG Compliance** | AA minimum | ✅ Verified |
| **Token Reuse** | ~85% (est.) | ✅ High |
| **Migration Progress** | 20% (Phase 1 planned) | 🚧 Planning |

---

## 🎓 Learning Path

**New to Design Systems?**
1. **[GETTING-STARTED.md](GETTING-STARTED.md)** — What is a design system?
2. **[tokens/README.md](tokens/README.md)** — How to use tokens
3. **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)** — Deep dive into each token
4. **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** — See tokens in action

**Experienced with Design Systems?**
1. **[TOKENS-REFERENCE.md](TOKENS-REFERENCE.md)** — Quick token reference
2. **[COMPONENT-MAPPING.json](COMPONENT-MAPPING.json)** — Component status
3. **[ENFORCEMENT-GUIDE.md](ENFORCEMENT-GUIDE.md)** — Rules & standards
4. **[DTCG-EXPORT-SUMMARY.md](DTCG-EXPORT-SUMMARY.md)** — Export & integration

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| **2.1.0** | 2026-04-21 | Added Story 5.1 & 5.2 enhancements (animation tokens, badge variants) |
| **2.0.0** | 2026-04-16 | Initial Design System launch (W3C DTCG compliant) |

---

## ✨ Quick Start Commands

```bash
# View tokens in action
cat docs/design-system/tokens/README.md

# See full token inventory
cat docs/design-system/tokens/TOKEN-EXTRACTION-REPORT.md

# Check component status
cat docs/design-system/COMPONENT-MAPPING.json

# Review migration plan
cat docs/design-system/MIGRATION-STRATEGY.md

# Verify accessibility
cat docs/design-system/ACCESSIBILITY-GUIDE.md
```

---

**Generated by:** Uma (UX-Design-Expert)  
**Last Updated:** 2026-04-21  
**Version:** 2.1.0 (Master Index)

🎨 **The Digital Atelier — Transforming Complexity into Elegance**
