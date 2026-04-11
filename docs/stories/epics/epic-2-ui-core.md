---
epic_id: EPIC-2
epic_name: UI CORE & DESIGN SYSTEM
status: Draft
created_date: 2026-04-09
created_by: River (SM)
priority: P0
target_completion: 2-3 weeks (Weeks 4-6)
source_prd: docs/prd/14-implementation-roadmap-7-epics-sequenced.md
design_spec: docs/DESIGN-PRINCIPLES.md
---

# EPIC-2: UI CORE & DESIGN SYSTEM

## Epic Goal

Transform the application from a "standard template" look into a premium, editorial, and high-contrast **"Architectural Ledger"** experience. Establish a live component library using Shadcn/ui, Manrope typography, and a "No-Line" surface hierarchy, starting with a refactor of the Authentication layer as a real-world feasibility test.

## Epic Description

**Creative North Star:**
- **Architectural Ledger:** Editorial, authoritative, and breathable.
- **No-Line Rule:** Space defined by background shifts and tonal transitions, not 1px borders.
- **Surface Hierarchy:** 4 distinct tonal layers (Base, Low, Lowest, High) for structural depth.
- **Manrope Typography:** Geometric clarity with high-impact editorial weights.

**Stories (Sequenced from Roadmap):**

- **Story 2.1: The Backbone (Setup & Tokens)** — Setup Shadcn/ui, Tailwind config with Emerald/Navy palette, and Manrope fonts.
- **Story 2.2: The Lab (Storybook Setup)** — Technical setup of Storybook to document the Design System components.
- **Story 2.3: The Inspector (Vitest UI Integration)** — Configure Vitest for component testing (Tailwind/React context).
- **Story 2.4: Atomic Forms & Feedback** — Create core atoms (Button, Input, Toast) with Storybook stories.
- **Story 2.5: Real World Test (Auth Refactor)** — Refactor `/login` and `/register` using the new Design System.
- **Story 2.6: UI Expansion (Layout & Data)** — Card, Modal, Tabs, Avatar, Spinner as required by dashboard.
- **Story 2.7: Documentation & Polishing** — Finalize Design Token documentation and spacing scales.
- **Story 2.8: Visual Validation** — Final accessibility audit and Dark Mode implementation.
- **Story 2.9: Application Layout & Navigation** — Implement Header, Sidebar, and User Menu with consistent visual language.

## Success Criteria

- [ ] All design tokens from `docs/DESIGN-TOKENS.md` (Emerald, Navy, Surface Hierarchy) implemented in Tailwind.
- [ ] Shadcn/ui initialized and standard components following the 8px radius rule.
- [ ] Storybook operational and documenting atomic components.
- [ ] Auth pages (Register/Login) refactored with zero mandatory 1px borders.
- [ ] Navigation components (Sidebar/Header) following the Glassmorphism rules.
- [ ] Acessibility checklist passes WCAG AA standards.

---

## Technical Constraints & Design Rules

Consulte o **[DESIGN-TOKENS.md](file:///c:/git/kanban.2/docs/DESIGN-TOKENS.md)** para valores técnicos exatos.

### 1. The Palette (Executive Emerald)
- Baseada em Emerald, Navy e Surface Hierarchy.

### 2. The Surface Hierarchy (NO BORDERS)
- 4 camadas tonais conforme definido nos Princípios de Design.

### 3. Typography (Manrope)
- Sistema Manrope com pesos editoriais.

### 4. Spacing Scale
- Editorial spacing conforme escala de 8px.

---

## Quality Assurance Strategy

### Specialized Expertise
- @ux-design-expert: Visual fidelity and "Architectural Ledger" compliance.
- @qa: Accessibility (WCAG AA) and component testing.
- @dev: Implementation and Shadcn integration.

### CodeRabbit Validation
- **tokens-review:** Verify color codes and spacing scales match Design Spec.
- **accessibility-scan:** Automated checks for color contrast and ARIA labels.

---

**Epic Status:** Ready for Story Development  
**Next Action:** @sm creates Story 2.1 (The Backbone)  
**Blocks:** EPIC-3 (Evolution Phase 1)
