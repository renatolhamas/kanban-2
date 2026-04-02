# 14. Implementation Roadmap — 7 Epics (Sequenced)

## Sequência de Implementação
```
Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 → Epic 6 → Epic 7
(Linear, sem dependencies cruzadas)
```

---

## Epic 1: FOUNDATION & AUTH

**Objetivo:** Schema, Auth, Onboarding, RLS, Evolution API pairing setup

**Stories:**
- Story 1.1: Create schema (tenants, users, contacts, conversations, messages, columns)
- Story 1.2: Supabase Auth (register, login, profile)
- Story 1.3: Onboarding (tenant auto-create, default kanban "Main" com colunas padrão)
- Story 1.4: RLS policies validation
- Story 1.5: Evolution API pairing (QR code generation)
- Story 1.6: Webhook endpoint setup (/api/webhooks/messages)

**Outputs:** Auth working, webhook validated, schema ready

---

## Epic 2: EVOLUTION PHASE 1 (Setup & Pairing)

**Objetivo:** Evolution API integration, webhook validation, manual testing

**Stories:**
- Story 2.1: Evolution API pairing (QR code)
- Story 2.2: Webhook endpoint (/api/webhooks/messages)
- Story 2.3: Webhook validation (HMAC-SHA256)
- Story 2.4: Manual testing (curl, console logs)

**Outputs:** Evolution connected, webhooks validated, ready for DB

---

## Epic 3: KANBAN BOARD & CONTACTS

**Objetivo:** Kanban visualization, drag-and-drop, contacts management

**Stories:**
- Story 3.1: Home page (Kanban board)
- Story 3.2: Drag-and-drop (dnd-kit v8.0.0)
- Story 3.3: Kanban CRUD em Settings
- Story 3.4: Contacts page CRUD
- Story 3.5: Contact validation (E.164 format)

**Outputs:** Kanban visível, contacts gerenciáveis

---

## Epic 4: EVOLUTION PHASE 2 (DB Integration)

**Objetivo:** End-to-end message flow, webhook → DB → UI

**Stories:**
- Story 4.1: Webhook → auto-register contacts
- Story 4.2: Webhook → auto-create conversations
- Story 4.3: Webhook → save messages to DB
- Story 4.4: Send message UI → Evolution API
- Story 4.5: Message delivery validation

**Outputs:** Messages flowing end-to-end

---

## Epic 5: CHAT & REAL-TIME

**Objetivo:** Real-time messaging, WebSocket subscriptions, chat interface

**Stories:**
- Story 5.1: Chat modal UI
- Story 5.2: Message history pagination
- Story 5.3: Real-time subscriptions (WebSocket)
- Story 5.4: Kanban/column selector in chat
- Story 5.5: Archive conversation
- Story 5.6: Loading + error states

**Outputs:** Chat funcional, instantaneous updates

---

## Epic 6: SETTINGS

**Objetivo:** User configuration, kanbans, automatic messages, Evolution status

**Stories:**
- Story 6.1: Profile subsection (name, password)
- Story 6.2: Connection subsection (Evolution status)
- Story 6.3: Kanbans subsection (CRUD, reorder com setas ↑↓)
- Story 6.4: Automatic Messages subsection (CRUD)

**Outputs:** Full settings interface

---

## Epic 7: AUTOMAÇÃO

**Objetivo:** Automatic Messages system, manual triggers, testing, polish

**Stories:**
- Story 7.1: Automatic Messages template system
- Story 7.2: Manual trigger (botão em Chat)
- Story 7.3: Message testing
- Story 7.4: Polish + edge cases

**Outputs:** Manual follow-up ready, agendamento em pós-MVP

---

## Timeline Estimativa

| Epic | Duration | Period |
|------|----------|--------|
| Epic 1 | 2-3 semanas | Semanas 1-3 |
| Epic 2 | 1-2 semanas | Semanas 4-5 |
| Epic 3 | 2 semanas | Semanas 6-7 |
| Epic 4 | 2 semanas | Semanas 8-9 |
| Epic 5 | 2 semanas | Semanas 10-11 |
| Epic 6 | 1-2 semanas | Semanas 12-13 |
| Epic 7 | 1 semana | Semanas 14 |
| **QA & Polish** | **1-2 semanas** | **Semanas 15-16** |

**Total: 8-12 semanas** (MVP ready for beta)

---

## Próximos Passos

1. **@pm *create-epic** — Estruturar cada epic em EPIC-{ID}.md
2. **@sm *draft** — Quebrar stories em AC detalhados
3. **@architect *design-review** — Validar arquitetura
4. **@dev *sprint-planning** — Iniciar Sprint 0

---
