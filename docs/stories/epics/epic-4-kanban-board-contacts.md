---
epicId: "4"
epicTitle: "Kanban Board & Contacts Management"
status: "Draft"
timeline: "2 semanas (Semanas 9-10)"
createdAt: "2026-04-14"
---

# Epic 4: Kanban Board & Contacts Management

## Epic Goal

Implementar a visualização interativa do kanban com drag-and-drop e criar o sistema de gerenciamento de contatos, habilitando os usuários a organizarem conversas em colunas customizáveis e manterem um registro centralizado de contatos.

## Epic Description

### Existing System Context

- **Funcionalidade atual:** Evo GO webhooks conectados e validados (Epic 3), auth e RLS configuradas (Epic 1), design system pronto (Epic 2)
- **Technology stack:** React 19, Supabase (PostgreSQL + RLS), Tailwind CSS, Shadcn/ui, dnd-kit v8.0.0
- **Integration points:** 
  - Home page exibe kanban (visualmente renderiza dados)
  - Contacts page integra com RLS (supabase.table('contacts'))
  - Settings permite CRUD de kanbans
  - Epic 5 consumirá contact_id para auto-register via webhooks

### Enhancement Details

**O que está sendo adicionado:**

1. **Real Tenant Isolation** — Fix the multi-tenant isolation by migrating RLS policies from `user_metadata` (user-editable) to `app_metadata` (immutable)
2. **Kanban Visualization** — Home page exibe kanban com colunas (Novo, Em Andamento, Resolvido, etc.)
3. **Drag-and-Drop** — Usuários movem conversas entre colunas usando dnd-kit
4. **Kanban CRUD** — Settings permite criar/editar/deletar kanbans customizados
5. **Contacts Management** — Página de contatos com CRUD de telefones (E.164 format)
6. **Contact Validation** — Validação de formato de telefone antes de salvar

**Como se integra:**

- Kanban board renderiza conversas filtradas por kanban_id (FK em conversations table)
- Drag-and-drop atualiza conversation.kanban_column_id via Supabase
- Contacts CRUD via Supabase (table: contacts, RLS via service_id = current_tenant)
- Settings refatore existente para incluir subsection de Kanbans

**Success Criteria:**

- [ ] Kanban visível na Home com todas as conversas do tenant
- [ ] Drag-and-drop funcional (dnd-kit) sem erros
- [ ] CRUD de kanbans salva em DB e persiste
- [ ] Contacts page lista, cria, edita e deleta contatos
- [ ] Validação E.164 bloqueia telefones inválidos
- [ ] RLS impede acesso cross-tenant
- [ ] Sem regressions em Epic 3 (webhooks ainda funcionam)

---

## Codebase Intelligence

| Métrica | Valor |
|--------|-------|
| **Projeto** | Evo GO + Kanban System (full-stack, multi-tenant) |
| **Stack** | Node.js + React 19 + Supabase + Tailwind |
| **Padrões Existentes** | RLS via service_id, FK relationships, Shadcn components |
| **Dependency Depth** | 3 (auth → kanban → contacts → conversations) |

---

## Stories with Dynamic Executor Assignment

### Story 4.2: Home Page Kanban Board

**Description:** Exibir kanban board na home page com colunas do tenant e conversas renderizadas por coluna. Cada coluna mostra conversas associadas, prontas para drag-and-drop na história 4.2.

**Work Type:** Frontend component + data binding (React, Supabase query)

**Executor Assignment:**
- **Executor:** `@ux-design-expert` (component design + layout)
- **Quality Gate:** `@dev` (code patterns, React best practices)
- **Quality Gate Tools:** `[component_patterns, react_hooks_validation, accessibility_wcag_aa]`

**Acceptance Criteria:**

```gherkin
Given: Tenant é logado e possui kanbans em DB
When: Usuário navega para Home
Then: Kanban visível com colunas e conversas renderizadas
And: Cada conversa exibe phone number, last message, timestamp
And: Colunas ordenadas conforme kanban.column_order (se definido)
And: Acessibilidade WCAG AA (focus states, keyboard nav)
```

**Tasks:**
- [ ] Query Supabase (kanbans + conversations, RLS filtering)
- [ ] Criar componente KanbanBoard.tsx com colunas
- [ ] Render conversation cards em cada coluna
- [ ] Estilizar com Tailwind (spacing, colors, typography do design system)
- [ ] Adicionar Storybook story (KanbanBoard.stories.tsx)
- [ ] Testes (Vitest): render, RLS isolation, empty states

**Focus Areas:**
- RLS: Garantir que apenas conversas do tenant são visíveis
- Performance: Query eficiente (índices em kanban_id, service_id)
- Accessibility: WCAG AA, screen reader support

---

### Story 4.3: Drag-and-Drop with dnd-kit

**Description:** Integrar dnd-kit v8.0.0 para permitir drag-and-drop de conversas entre colunas. Atualizar conversation.kanban_column_id no Supabase ao soltar.

**Work Type:** Interaction logic + state management + API call (React hooks, dnd-kit, Supabase update)

**Executor Assignment:**
- **Executor:** `@dev` (drag-and-drop logic, state management, API integration)
- **Quality Gate:** `@architect` (interaction patterns, performance, error handling)
- **Quality Gate Tools:** `[drag_drop_pattern_validation, state_management_review, api_contract_check]`

**Acceptance Criteria:**

```gherkin
Given: Kanban board renderizado com conversas
When: Usuário drag conversa de coluna A para coluna B
Then: Drag visual feedback exibido
And: Ao soltar (drop), conversation.kanban_column_id atualizado em DB
And: UI reflete mudança imediatamente (optimistic update)
And: Erro ao salvar reverte UI para estado anterior
```

**Tasks:**
- [ ] Integrar dnd-kit (DndContext, Droppable, Draggable wrappers)
- [ ] Implementar onDragEnd handler (atualiza conversation em Supabase)
- [ ] Optimistic update (UI muda antes da resposta do DB)
- [ ] Error handling (rollback se update falhar)
- [ ] Testes: drag operations, optimistic updates, error scenarios
- [ ] Performance: dnd-kit não bloqueia main thread (use transforms, não reflow)

**Focus Areas:**
- Interaction: Drag feedback, drop zones claras
- Performance: Evitar re-renders desnecessários (memoization)
- Error resilience: Rollback automático, user feedback

---

### Story 4.4: Kanban CRUD in Settings

**Description:** Adicionar subsection "Kanbans" em Settings onde usuário pode criar, editar, deletar e reordenar kanbans customizados (usando setas ↑↓).

**Work Type:** Form UI + CRUD operations + list management

**Executor Assignment:**
- **Executor:** `@ux-design-expert` (form design, list UI, interaction patterns)
- **Quality Gate:** `@dev` (form validation, CRUD patterns, error handling)
- **Quality Gate Tools:** `[form_validation_check, crud_pattern_review, input_sanitization]`

**Acceptance Criteria:**

```gherkin
Given: Usuário está em Settings → Kanbans subsection
When: Clica "Create Kanban"
Then: Modal ou form abre com campos (name, default columns)
And: Ao salvar, novo kanban aparece na lista
And: Usuário pode editar nome e colunas
And: Usuário pode deletar kanban (soft delete, conversas reassigned para "Main")
And: Setas ↑↓ reordenam kanbans (atualiza kanban.order_index)
```

**Tasks:**
- [ ] Adicionar Settings subsection para Kanbans
- [ ] Criar KanbanForm.tsx (name, columns input)
- [ ] Implementar CRUD (create, read, update, delete)
- [ ] Validar nome não-vazio, max 50 chars
- [ ] Reorder logic (↑↓ setas atualizam order_index)
- [ ] Soft delete (kanban.deleted_at) + reassign conversations
- [ ] Testes: form submission, validation, CRUD operations, reordering

**Focus Areas:**
- Form UX: Clear labels, error messages, success feedback
- Data integrity: Soft delete com reassignment segura
- Performance: List reorders sem full re-render

---

### Story 4.5: Contacts Page CRUD

**Description:** Criar página /contacts com lista de contatos do tenant e interface CRUD (criar, editar, deletar contatos).

**Work Type:** Page component + table UI + CRUD forms

**Executor Assignment:**
- **Executor:** `@ux-design-expert` (page layout, table design, form UX)
- **Quality Gate:** `@dev` (CRUD patterns, data validation, error states)
- **Quality Gate Tools:** `[crud_pattern_check, table_accessibility, form_validation]`

**Acceptance Criteria:**

```gherkin
Given: Usuário navega para /contacts
When: Página carrega
Then: Tabela exibe todos os contatos do tenant (phone, name, created_at)
And: Botão "Add Contact" abre modal
And: Modal permite entrar phone + name
And: Ao salvar, contato aparece em tempo real
And: Usuário pode clicar contato para editar
And: Usuário pode deletar contato (soft delete)
```

**Tasks:**
- [ ] Criar página /contacts (layout, table com dados)
- [ ] Integrar DataTable (Shadcn) ou custom table com sorting/pagination
- [ ] Modal para Create/Edit contact
- [ ] Validação E.164 (próxima story, aqui apenas input)
- [ ] Delete (soft delete com reassign de conversations)
- [ ] Testes: render table, CRUD operations, error states
- [ ] Acessibilidade: table headers, keyboard nav

**Focus Areas:**
- Table UX: Sorting, pagination, clear actions
- RLS: Apenas contatos do tenant visíveis
- Error handling: Network failures, validation errors

---

### Story 4.6: Contact Validation (E.164 Format)

**Description:** Implementar validação de formato E.164 para números de telefone. Rejeitar números inválidos ao criar/editar contato com mensagem de erro clara.

**Work Type:** Validation logic + error messaging

**Executor Assignment:**
- **Executor:** `@dev` (validation function, error handling, messaging)
- **Quality Gate:** `@qa` (edge cases, error coverage, user feedback clarity)
- **Quality Gate Tools:** `[validation_test_coverage, error_message_clarity, edge_case_validation]`

**Acceptance Criteria:**

```gherkin
Given: Usuário tenta criar contato com número inválido
When: Clica "Save"
Then: Erro "Invalid phone number format" exibido
And: Campo fica com border vermelho (error state)
And: Mensagem explica: "Use format: +55 11 9 8765-4321"
And: Válido: +55119876543210 (sem hífens/espaços)
And: Inválido: 119876543210 (sem +55), (11)98765-4321 (com símbolos)
```

**Tasks:**
- [ ] Importar libphone-js (NPM: libphonenumber-js ou similar)
- [ ] Criar função validateE164(phone, countryCode) 
- [ ] Aplicar validação no form submit (Story 4.4)
- [ ] Exibir erro com sugestão de formato
- [ ] Testes: valid/invalid numbers, country codes, edge cases
- [ ] Docs: E.164 format explanation em página

**Focus Areas:**
- Validation accuracy: Suportar múltiplos países (Brasil, US, etc.)
- UX: Mensagens claras, hints de formato
- Robustness: Edge cases (números muito longos, símbolos inesperados)

---

## Compatibility Requirements

- [ ] Existing Evo GO webhooks (Epic 3) continuam funcionando — não afetamos webhook handler
- [ ] RLS policies existentes (Epic 1) protegem dados — queries filtram por service_id
- [ ] Design system (Epic 2) aplicado — componentes usam Shadcn + Tailwind
- [ ] Auth flow (Epic 1) intacto — nenhuma mudança em login/register
- [ ] Dados de usuário em settings (Epic 2) preservados — apenas adicionamos subsection Kanbans

---

## Risk Mitigation

**Primary Risk:** Breaking existing kanban structure ou conversas orphaned ao deletar kanban

**Mitigation:**
- Soft delete kanbans (deleted_at timestamp)
- Ao deletar, reassign conversas para kanban "Main" (hardcoded default)
- RLS bloqueia cross-tenant acesso (mesmo se há erro lógico)
- Rollback: Git revert (schema intacto, dados preservados com soft delete)

**Quality Assurance Strategy:**

| Risk Level | Quality Gate | Tools |
|-----------|--------------|-------|
| LOW (UI only) | Pre-Commit: CodeRabbit (patterns, a11y) | @ux-design-expert (@dev review) |
| MEDIUM (CRUD) | Pre-Commit + Pre-PR: CodeRabbit (validation, error handling) | @dev (@architect review) |
| MEDIUM (E.164) | Pre-Commit: Validation edge cases | @dev (@qa spot-check) |

- **CodeRabbit**: Auto-fix CRITICAL/HIGH em dev phase (max 2 iterations)
- **Tests**: Unit tests para CRUD, validation, RLS filtering
- **Regression Check**: Manual test de Epic 3 (webhooks) após merge

---

## Definition of Done

- [ ] Todas as 5 stories completadas com AC atendidos
- [ ] Funcionalidade de Epic 3 (webhooks) verificada — nenhuma regressão
- [ ] RLS policies testadas — dados isolados por tenant
- [ ] Design system aplicado — componentes usam Shadcn + Tailwind
- [ ] Testes passando (unit, Vitest)
- [ ] Lint passando (`npm run lint`)
- [ ] TypeScript typecheck passando (`npm run typecheck`)
- [ ] Storybook atualizado (KanbanBoard stories, Form components)
- [ ] Documentação atualizada (README se necessário, DESIGN-TOKENS.md se novos tokens)
- [ ] PR aprovado e mergeado

---

## Handoff to Story Manager

> **Para: @sm (River)**

Estrutura Epic 4 pronta. Próximo passo: Quebrar cada história em AC detalhados e criar files no `docs/stories/`.

**Considerações-chave:**

- **Dependency order:** Story 4.1 → 4.2 (depende do kanban ser renderizado) → 4.3-4.5 paralelo
- **Design system:** Todos os componentes devem usar Shadcn + Tailwind (Epic 2)
- **RLS:** Cada story deve testar isolamento por tenant
- **Integration:** Epic 4 prepara dados para Epic 5 (messages flowing end-to-end)

**Executor Predictions (use para criar stories):**
- **@ux-design-expert**: 4.1, 4.3, 4.4 (UI/UX primary)
- **@dev**: 4.2, 4.5 (interaction + validation)

---

## Metadata

```yaml
epicId: 4
title: "Kanban Board & Contacts Management"
status: "Draft"
createdAt: "2026-04-14"
timeline: "2 semanas"
stories: 5
complexity: "LOW"
risk: "LOW"
nextEpic: "Epic 5 — Evolution Phase 2 (DB Integration)"
```

---

**Validação Checklist:**

- [x] Epic pode ser completado em 1-3 stories? **SIM** (5 stories, mas bem-scoped)
- [x] Requer documentação arquitetural? **NÃO** (segue padrões existentes)
- [x] Segue padrões existentes? **SIM** (RLS, Shadcn, Tailwind)
- [x] Complexidade de integração gerenciável? **SIM** (queries simples, CRUD padrão)
- [x] Risco para sistema existente baixo? **SIM** (soft deletes, RLS protege)
- [x] Rollback é viável? **SIM** (Git revert, schema intacto)

✅ **Epic 4 validado e pronto para Story Manager**
