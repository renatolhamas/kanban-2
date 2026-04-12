# 15. Implementation Roadmap — 7 Epics (Sequenced)

## Sequência de Implementação

```
Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 → Epic 6 → Epic 7 → Epic 8
(Linear, sem dependencies cruzadas)
```

---

## Epic 1: FOUNDATION & AUTH

**Objetivo:** Schema, Auth, Email Confirmation, Onboarding, RLS

**Stories:**

- Story 1.1: Database Schema Creation (tenants, users, contacts, conversations, messages, columns)
- Story 1.2: Supabase Auth (register, login, profile)
- Story 1.3: Email Confirmation Flow (Resend integration, confirmation link generation, token validation)
- Story 1.4: RLS Policies Validation (Testing & Verification)
- Story 1.5: Onboarding (tenant auto-create via application-layer, default kanban "Main" com colunas padrão criadas em Node.js)

**Outputs:** Auth working with email confirmation, schema ready, users onboarded com kanban automático

---

## Epic 2: UI CORE & DESIGN SYSTEM

**Objetivo:** Criar uma biblioteca viva onde o Auth é o primeiro a ser transformado, validando o sistema na prática.

**Stories:**

- Story 2.1: The Backbone (Setup & Tokens) — Instalar Shadcn/ui e configurar `tailwind.config.ts` com cores e fontes. É o "DNA" do projeto.
- Story 2.2: The Lab (Storybook Setup) — Instalar Storybook e conectar ao Tailwind (setup técnico, sem documentação de tokens ainda).
- Story 2.3: The Inspector (Vitest Integration) — Configurar o Vitest para testar componentes. Garantir que o ambiente suporte as classes do Tailwind e as interações do React.
- Story 2.4: Atomic Forms & Feedback (O Coração) — Criar Button, Input, Toast com Storybook stories. São críticos para UX.
- Story 2.5: Real World Test (Auth Refactor) — Aplicar componentes de Form no Auth atual. Valida se Shadcn+Tailwind funcionam antes de criar 10+ componentes.
- Story 2.6: UI Expansion (Layout & Data) — Card, Modal, Tabs, Avatar, Spinner conforme necessidade do dashboard.
- Story 2.7: Token System Foundation — Expandir `app/globals.css` e `tailwind.config.ts` com 30+ tokens (spacing, typography, shadows, colors, animation); criar W3C DTCG export e scripts de exportação. (8-12h)
- Story 2.8: Token Audit & Documentation — Auditar componentes Stories 2.1-2.6 para consistência; criar DESIGN-TOKENS.md com documentação completa e referência visual de espaçamento. (16-24h)
- Story 2.9: Storybook & Accessibility Polish — Criar DesignTokens.stories.tsx com color swatches, tipografia e spacing scales; validação WCAG AA; polish final de documentação. (12-16h)
- Story 2.10: Visual Validation — Checklist final: acessibilidade e Dark Mode.
- Story 2.11: Application Layout & Navigation — Refatorar Header, Sidebar e User menu aplicando componentes validados do Design System. Menu funcional + refatorado.
- Story 2.12: Pages Refactor — Refatorar demais páginas (Home, Settings, Contacts, Chat) aplicando componentes validados e novo Application Layout.

**Outputs:** Design tokens definidos, UI Library (15+ componentes) documentada e testada, fluxo de Auth totalmente refatorado como POC, Application Layout & Navigation refatorado com componentes validados, todas as páginas refatoradas com novo estilo.

**Critical Path (Semanas 4-6):** Stories 2.1-2.5 — Bloqueador para Epic 3+
**Adaptive (Semanas 6+ paralelo com Epics 3-4):** Stories 2.6-2.11 — Conforme necessidade real

---

## Epic 3: EVOLUTION PHASE 1 (Setup & Pairing)

**Objetivo:** Evo GO integration, webhook validation, manual testing

**Stories:**

- Story 3.1: Evo GO pairing (QR code)
- Story 3.2: Webhook endpoint (/api/webhooks/messages)
- Story 3.3: Webhook validation (HMAC-SHA256)
- Story 3.4: Manual testing (curl, console logs)

**Outputs:** Evolution connected, webhooks validated, ready for DB

---

## Epic 4: KANBAN BOARD & CONTACTS

**Objetivo:** Kanban visualization, drag-and-drop, contacts management

**Stories:**

- Story 4.1: Home page (Kanban board)
- Story 4.2: Drag-and-drop (dnd-kit v8.0.0)
- Story 4.3: Kanban CRUD em Settings
- Story 4.4: Contacts page CRUD
- Story 4.5: Contact validation (E.164 format)

**Outputs:** Kanban visível, contacts gerenciáveis

---

## Epic 5: EVOLUTION PHASE 2 (DB Integration)

**Objetivo:** End-to-end message flow, webhook → DB → UI

**Stories:**

- Story 5.1: Webhook handler → auto-register contacts (application-layer)
- Story 5.2: Webhook handler → auto-create conversations (application-layer)
- Story 5.3: Webhook → save messages to DB
- Story 5.4: Send message UI → Evo GO
- Story 5.5: Message delivery validation

**Outputs:** Messages flowing end-to-end

---

## Epic 6: CHAT & REAL-TIME

**Objetivo:** Real-time messaging, WebSocket subscriptions, chat interface

**Stories:**

- Story 6.1: Chat modal UI
- Story 6.2: Message history pagination
- Story 6.3: Real-time subscriptions (WebSocket)
- Story 6.4: Kanban/column selector in chat
- Story 6.5: Archive conversation
- Story 6.6: Loading + error states

**Outputs:** Chat funcional, instantaneous updates

---

## Epic 7: SETTINGS

**Objetivo:** User configuration, kanbans, automatic messages, Evolution status

**Stories:**

- Story 7.1: Profile subsection (name, password)
- Story 7.2: Connection subsection (Evolution status)
- Story 7.3: Kanbans subsection (CRUD, reorder com setas ↑↓)
- Story 7.4: Automatic Messages subsection (CRUD)

**Outputs:** Full settings interface

---

## Epic 8: AUTOMAÇÃO

**Objetivo:** Automatic Messages system, manual triggers, testing, polish

**Stories:**

- Story 8.1: Automatic Messages template system
- Story 8.2: Manual trigger (botão em Chat)
- Story 8.3: Message testing
- Story 8.4: Polish + edge cases

**Outputs:** Manual follow-up ready, agendamento em pós-MVP

---

## Timeline Estimativa

| Epic            | Duration        | Period            | Notes |
| --------------- | --------------- | ----------------- | ----- |
| Epic 1          | 2-3 semanas     | Semanas 1-3       | Foundation & Auth |
| **Epic 2 (Critical)** | **2 semanas**   | **Semanas 4-6**   | **Stories 2.1-2.5** — Valida Shadcn/Tailwind antes de proseguir |
| **Epic 2 (Adaptive)** | **3-4 semanas**   | **Semanas 6+ paralelo** | **Stories 2.6-2.12** — Conforme necessidade real de Epics 3-4 |
| Epic 3          | 1-2 semanas     | Semanas 7-8       | Evolution Setup |
| Epic 4          | 2 semanas       | Semanas 9-10      | Kanban Board |
| Epic 5          | 2 semanas       | Semanas 11-12     | Evolution Phase 2 |
| Epic 6          | 2 semanas       | Semanas 13-14     | Chat & Real-time |
| Epic 7          | 1-2 semanas     | Semanas 15-16     | Settings |
| Epic 8          | 1 semana        | Semanas 17        | Automação |
| **QA & Polish** | **1-2 semanas** | **Semanas 18-19** | Final validation |

**Total: 10-15 semanas** (MVP ready for beta)

---

---

## 🚀 Phase 2 Roadmap (Post-MVP)

### EPIC 9: ATTENDANTS (Phase 2 — Planned)

**Objetivo:** Multi-user support with role-based access control and RLS granularity

**Stories (TBD):**
- Story 9.1: Multi-user (Attendants) — Invite attendants, RLS per role
- Story 9.2: Permissions system — Owner grants read/write/admin access
- Story 9.3: Attendance tracking — Dashboard showing who handled which conversation
- Story 9.4: Performance metrics — Stats per attendant (messages handled, response time)

**Timeline:** Post-MVP (Phase 2, ~4-6 weeks after MVP stable)

**Status:** Planned, awaiting MVP completion and market feedback

---

## Próximos Passos

1. **@pm \*create-epic** — Estruturar cada epic em EPIC-{ID}.md
2. **@sm \*draft** — Quebrar stories em AC detalhados
3. **@architect \*design-review** — Validar arquitetura
4. **@dev \*sprint-planning** — Iniciar Sprint 0

---
