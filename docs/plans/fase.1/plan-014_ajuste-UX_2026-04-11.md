# PLAN-014 — Ajuste UX Design System Story 2.12
**Pages Refactor — Application Pages with Design System**

**Data:** 2026-04-11  
**Especialista:** Uma (UX/UI Designer)  
**Status:** Consolidação & Validação  
**Próxima Ação:** Aplicar correções ao arquivo 2.12.story.md

---

## 📌 RESUMO EXECUTIVO

Você tentou implementar Story 2.12 e recebeu **5 questionamentos críticos** que estão **PARCIALMENTE** definidos em documentos do projeto. Este plano:

1. ✅ **Valida** cada questionamento contra docs existentes
2. ✅ **Identifica** a fonte (PRD, Design System, stories anteriores)
3. ✅ **Apresenta opções** para questões ainda não definidas
4. ✅ **Recomenda a melhor abordagem** para projetos similares
5. ✅ **Fornece passo a passo** exato para ajustar o 2.12.story.md

---

## 🎯 OS 5 QUESTIONAMENTOS RECEBIDOS

### **QUESTIONAMENTO #1: Escopo de Auth Pages — Foram refatoradas em Story 2.5?**

#### Status: ✅ **JÁ ESTÁ DEFINIDO** (com nuance)

**Onde encontrar:**
- 📄 **Story 2.5** (Real World Test - Auth Refactor)
- 📄 **AUDIT-2026-04-11_auth-pages-detailed-analysis.md** (Auditoria detalhada)
- 📄 **2.12.story.md linha 231-237** (Explica Phase 3)

**O que diz:**

Story 2.5 menciona APENAS 2 páginas refatoradas:
- ✅ `app/(auth)/login/page.tsx`
- ✅ `app/(auth)/register/page.tsx`

**NÃO menciona** (estão fora de escopo de 2.5):
- ❌ `app/(auth)/change-password/page.tsx`
- ❌ `app/(auth)/forgot-password/page.tsx`
- ❌ `app/(auth)/resend-confirmation/page.tsx`

**Por que a confusão?**
O story 2.12 original dizia "Verify Auth Pages" de forma vaga, criando ambiguidade sobre se eram 2 ou 5 páginas.

**Resposta às pessoas que perguntaram:**
> "Por que vocês não verificaram o Story 2.5 ou o documento de auditoria `AUDIT-2026-04-11_auth-pages-detailed-analysis.md`? Lá está explícito: Story 2.5 refatorou apenas 2 páginas; as outras 3 estão fora de escopo de 2.5."

**Decisão já tomada:** ✅ **OPÇÃO B** (vide STORY-2.12-FINAL-CORRECTIONS-CONSOLIDATED.md)
- **Expandir Story 2.12** para incluir as 5 páginas auth (não apenas verify)
- Esforço: 6-8h original → 12-15h (Phase 3: 8h)

---

### **QUESTIONAMENTO #2: AC Measurability — Como medir sucesso?**

#### Status: ✅ **PARCIALMENTE DEFINIDO** (precisa expandir)

**Onde encontrar:**
- 📄 **2.12.story.md linhas 50-75** (Acceptance Criteria)
- 📄 **QA-FIX_REQUEST-2026-04-11_story-2.12.md** (Issue #2)
- 📄 **STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md** (Especificação completa)

**O que está definido:**
AC atual diz "paginas verificadas se usam Design System" — VAGO.

**O que falta:**
Critérios ESPECÍFICOS para medir conformidade. A auditoria mostra:

```
Login: 7/10 conforme
Register: 6/10 conforme
Change-Password: 1/10 (NÃO CONFORME)
Forgot-Password: 1/10 (NÃO CONFORME)
Resend-Confirmation: 1/10 (NÃO CONFORME)
```

**Solução:** Usar AC detalhado do documento PHASE-3-REFACTORED.md:

```markdown
- [ ] **Auth Pages Verification Complete**: Each page verified for:
  - Correct component imports (Button, Input from Design System)
  - No deprecated components (PasswordInput, FormError removed)
  - Dark mode rendering correct
  - WCAG AA accessibility (AXE: 0 CRITICAL/HIGH)
  - Keyboard navigation functional
  - All colors from design tokens (NOT hardcoded)
  - Font: Manrope applied
  - Border radius: rounded-lg consistent
  - Shadows: shadow-ambient (not hardcoded)
  - 100% Design System compliance: ALL CHECKS PASS
```

**Resposta às pessoas que perguntaram:**
> "A especificação detalhada estava em `STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` que a PO preparou. Ali está cada página, cada desconformidade, cada fix necessário. Por que não consultaram esse documento?"

---

### **QUESTIONAMENTO #3: CodeRabbit — Usar ou não?**

#### Status: ✅ **JÁ ESTÁ DEFINIDO** (foi decidido)

**Onde encontrar:**
- 📄 **QA-FIX_REQUEST-2026-04-11_story-2.12.md** (Issue #3)
- 📄 **core-config.yaml** (configuração do AIOX)
- 📄 **Constraint técnico: Hardware limitation**

**O que foi decidido:**

**OPÇÃO C (RECOMENDADA) — REMOVER CodeRabbit**

```
Por quê:
- Hardware constraints do projeto
- QA manual é suficiente (Phase 3.F validação cruzada)
- Sem overhead desnecessário
```

**Ações:**
1. ❌ **REMOVER** seção `🤖 CodeRabbit Integration` da Story 2.12
2. ❌ **NÃO ADICIONAR** nada a `core-config.yaml`
3. ✅ **USAR** revisão manual contra Design System checklist

**Resposta às pessoas que perguntaram:**
> "CodeRabbit não é viável neste projeto por constraints de hardware. Foi deliberadamente removido de 2.12. Consulte `QA-FIX_REQUEST-2026-04-11_story-2.12.md` Issue #3."

---

### **QUESTIONAMENTO #4: Formato do Story — Precisa ter "As a... I want... so that...?"**

#### Status: ✅ **JÁ ESTÁ DEFINIDO** (mas falta implementar)

**Onde encontrar:**
- 📄 **QA-FIX_REQUEST-2026-04-11_story-2.12.md** (Issue #4)
- 📄 **Constitution AIOX** (.aiox-core/constitution.md)
- 📄 **story-lifecycle.md** (Story validation checklist, item #1)

**O que está definido:**

**PADRÃO AIOX/SCRUM:** Todas as stories DEVEM ter formato:

```markdown
## 📖 Story

**As a** [role],
**I want** [action],
**so that** [benefit]
```

**Story 2.12 está faltando essa seção** após o title e antes do Decision Log.

**Resposta às pessoas que perguntaram:**
> "O padrão está na Constitution do AIOX e na story-lifecycle.md. Story 2.12 está faltando a seção '📖 Story' no início. Procure por 'Story Format' em qualquer story validada (ex: 2.11)."

**Texto correto a adicionar:**

```markdown
## 📖 Story

**As a** Designer/Frontend Team,
**I want** all application pages to use consistent Design System components,
**so that** the UI is visually consistent, accessible, and maintainable across light/dark modes

---
```

---

### **QUESTIONAMENTO #5: Browser Testing — Quais browsers testar?**

#### Status: ✅ **JÁ ESTÁ DEFINIDO** (mas vago no story)

**Onde encontrar:**
- 📄 **QA-FIX_REQUEST-2026-04-11_story-2.12.md** (Issue #5)
- 📄 **1-tech-stack-strategic-decisions.md** (browser support matrix)
- 📄 **8-coding-standards-conventions.md** (QA testing standards)

**O que estava vago:**
Story 2.12 linha 423 diz: "Visual validation: Render em light/dark mode" — sem especificar browsers.

**O que foi definido (da auditoria):**

```
✅ Chrome v100+ (light mode)
✅ Chrome v100+ (dark mode)
✅ Firefox v120+ (light mode)
✅ Firefox v120+ (dark mode)
✅ Safari 15+ (light mode)
✅ Safari 15+ (dark mode)
✅ Mobile (iPhone 12, 375px viewport) light mode
✅ Mobile (iPhone 12, 375px viewport) dark mode
```

**Resposta às pessoas que perguntaram:**
> "O padrão de browsers está em `1-tech-stack-strategic-decisions.md`. Story 2.12 linha 423 não era específico, mas a auditoria QA adicionou a lista completa. Use a lista de 8 combinações (Chrome, Firefox, Safari + mobile)."

---

## 🔄 CONSOLIDAÇÃO: DEFINIDO vs NÃO-DEFINIDO

| # | Questionamento | Status | Onde Encontrar | Quem Deve Consultar |
|---|---|---|---|---|
| 1 | Auth Pages scope (2 vs 5) | ✅ DEFINIDO | Story 2.5 + AUDIT-2026... | story-lifecycle.md |
| 2 | AC Measurability | ✅ DEFINIDO | PHASE-3-REFACTORED.md | qa-fix-request |
| 3 | CodeRabbit config | ✅ DEFINIDO | core-config.yaml | Constitution |
| 4 | Story format ("As a...") | ✅ DEFINIDO | story-lifecycle.md | Constitution |
| 5 | Browser testing list | ✅ DEFINIDO | 1-tech-stack-decisions | coding-standards |

**Conclusão:** Todos os 5 estão **documentados**. A confusão é porque:
- Estão espalhados em 5 documentos diferentes
- Alguns foram definidos DEPOIS da story original
- A story 2.12 não foi atualizada para refletir as decisões

---

## 📝 PASSO A PASSO — COMO AJUSTAR 2.12.story.md

### Passo 1: Backup (Proteção)

```bash
cp docs/stories/2.12.story.md docs/stories/2.12.story.md.backup
```

### Passo 2: Adicionar Seção "Story" (ISSUE #4)

**Localização:** Logo após frontmatter (linha 16), antes de Decision Log (linha 28)

**Encontrar:**
```markdown
---

# Story 2.12 — Pages Refactor
## 📓 Decision Log
```

**Substituir por:**
```markdown
---

# Story 2.12 — Pages Refactor — Application Pages with Design System

## 📖 Story

**As a** Designer/Frontend Team,  
**I want** all application pages to use consistent Design System components,  
**so that** the UI is visually consistent, accessible, and maintainable across light/dark modes

---

## 📓 Decision Log
```

---

### Passo 3: Atualizar Decision Log (ISSUE #1)

**Localização:** Na tabela Decision Log, adicionar linha para Auth Pages

**Encontrar:**
```markdown
| **Home/Landing** | Isolated Marketing Page | Root `/` serves as...
```

**Adicionar DEPOIS dessa linha:**
```markdown
| **Auth Pages Scope** | Expand to 5 pages (Story 2.5 covered 2/5) | Story 2.5 refactored login/register; 3 pages remain. Story 2.12 handles all 5 for 100% Design System compliance. |
| **Auth Pages Verification** | Full Refactor (not just verify) | Phase 3 refactors all 5 pages per audit findings (AUDIT-2026-04-11...) |
```

---

### Passo 4: Expandir Phase 3 (ISSUE #2)

**Localização:** Linhas 231-260 (Technical Approach, Phase 3)

**Substituir INTEIRO com:**

Copie o conteúdo COMPLETO de `docs/qa/STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` e insira aqui (é a especificação completa com todas as 5 páginas).

**Se preferir resumido:** Use o template abaixo:

```markdown
### Phase 3: Refactor Auth Pages (from Story 2.5) — 8h

**Discovery Finding:** Story 2.5 (Real World Test - Auth Refactor) covered ONLY 2/5 auth pages:
- ✅ Story 2.5: `/login`, `/register` (refactored)
- ❌ Story 2.5 OUT OF SCOPE: `/change-password`, `/forgot-password`, `/resend-confirmation`

**Decision:** Story 2.12 expands Phase 3 to refactor ALL 5 pages for 100% Design System compliance

**Audit Status (per AUDIT-2026-04-11_auth-pages-detailed-analysis.md):**
- Login: 7/10 (minor fixes: dark mode, token consistency)
- Register: 6/10 (remove PasswordInput, add dark mode)
- Change-Password: 1/10 (complete refactor: hardcoded colors, no components)
- Forgot-Password: 1/10 (same as Change-Password)
- Resend-Confirmation: 1/10 (same as Change-Password)

**Phase 3.A: Refactor `/login` (1h)**
- [x] Verified from Story 2.5
- [ ] Add `dark:` prefixes to all colors
- [ ] Verify semantic tokens (not hardcoded colors)
- [ ] Fix focus ring consistency

**Phase 3.B: Refactor `/register` (1.5h)**
- [x] Verified from Story 2.5
- [ ] Remove `PasswordInput` import → use `Input` component
- [ ] Add `dark:` prefixes
- [ ] Add password strength indicator (or document as out-of-scope)

**Phase 3.C: Refactor `/change-password` (1.5h)**
- [ ] Replace hardcoded colors with design tokens
- [ ] Replace custom error div with Input `error` prop + Toast
- [ ] Add Button and Input components (instead of custom)
- [ ] Fix border-radius from `rounded-2xl/3xl` → `rounded-lg`
- [ ] Add `font-manrope`
- [ ] Remove borders (violates no-border rule)
- [ ] Add full `dark:` support

**Phase 3.D: Refactor `/forgot-password` (1.5h)**
- [ ] (Same fixes as 3.C)
- [ ] Fix Toast import: `useToast()` hook (not component)

**Phase 3.E: Refactor `/resend-confirmation` (1.5h)**
- [ ] (Same fixes as 3.C & 3.D)

**Phase 3.F: Cross-page Validation (1h)**
- [ ] All 5 pages render light/dark mode in Storybook
- [ ] AXE scan: 0 CRITICAL, 0 HIGH on all
- [ ] Keyboard nav: Tab through all inputs, focus visible
- [ ] Contrast: >= 4.5:1 light AND dark mode
- [ ] Components: Only Button, Input, Card (no custom)
- [ ] Tokens: NO hardcoded colors/shadows/radii

**Success Criteria:** ALL 5 PAGES pass ALL checks (all-or-nothing)
```

---

### Passo 5: Remover CodeRabbit (ISSUE #3)

**Localização:** Procure por seção `## 🤖 CodeRabbit Integration`

**Ação:** ❌ **DELETAR INTEIRA** essa seção

**Não adicione nada a `core-config.yaml`**

---

### Passo 6: Adicionar Browser Coverage (ISSUE #5)

**Localização:** Tasks / Subtasks, Phase 4, Task 4.1 (linha ~423)

**Encontrar:**
```markdown
### Phase 4: Final Validation & Quality (1-2h)

- [ ] 4.1 Visual validation: Render `app/page.tsx`...
```

**Substituir:**
```markdown
### Phase 4: Final Validation & Quality (1-2h)

- [ ] 4.1 Visual validation: Browser compatibility
  - [ ] Chrome v100+ (light mode)
  - [ ] Chrome v100+ (dark mode)
  - [ ] Firefox v120+ (light mode)
  - [ ] Firefox v120+ (dark mode)
  - [ ] Safari 15+ (light mode)
  - [ ] Safari 15+ (dark mode)
  - [ ] Mobile (iPhone 12, 375px viewport) light mode
  - [ ] Mobile (iPhone 12, 375px viewport) dark mode
```

---

### Passo 7: Atualizar Effort Estimate

**Adicione nova seção após Dev Notes:**

```markdown
## ⏱️ Effort Estimate

| Phase | Original | Updated | Delta |
|-------|----------|---------|-------|
| Phase 1 (Home) | 1-2h | 1-2h | — |
| Phase 2 (Profile) | 2-3h | 2-3h | — |
| Phase 3 (Auth) | 1-2h | **8h** | +6-7h |
| Phase 4 (Validation) | 1-2h | 1-2h | — |
| **TOTAL** | **4-6h** | **12-15h** | **+8-9h** |

**Rationale:** Story 2.5 covered only 2/5 auth pages. Discovery audit (AUDIT-2026-04-11) revealed 3 additional pages with significant Design System non-compliance (0-20% conformity). Phase 3 expanded to refactor all 5 pages.
```

---

### Passo 8: Atualizar Change Log

**Adicione ao topo do Change Log:**

```markdown
| 2026-04-11 | 1.3 | **EXPANDED SCOPE PER AUDIT**: Phase 3 expanded from "verify 2 pages" to "refactor 5 pages" based on AUDIT-2026-04-11 findings. Effort: 4-6h → 12-15h. All 5 auth pages must achieve 100% Design System compliance. | Uma (UX) |
```

---

### Passo 9: Atualizar Status

**Frontmatter, campo `status:`**

**MANTER COMO:** `Draft` (até Pax validar todas mudanças)

Depois de aplicar tudo, Pax atualizará para `Ready`

---

### Passo 10: Validação

Depois de aplicar todas mudanças, execute:

```bash
# Verificar que YAML é válido
node -e "require('yaml').parse(require('fs').readFileSync('docs/stories/2.12.story.md', 'utf-8'))"

# Verificar que markdown compila
npx markdown-lint docs/stories/2.12.story.md 2>&1 | head -20
```

---

## 🎯 PERGUNTA FINAL — Você Respondida

> **"As definições sobre design, para serem 'reutilizadas/reutilizáveis', precisam estar nos documentos do design system (e não dentro de um story)?"**

### ✅ **RESPOSTA: SIM, COM EXCEÇÕES ESTRATÉGICAS**

Aqui está a matriz de decisão:

| Tipo de Definição | Deve estar em | NÃO deve estar em | Razão | Exemplo |
|---|---|---|---|---|
| **Design Tokens** | Design System docs | Stories | Reutilizáveis em múltiplos componentes | `color-primary: #10b981` → `tokens.yaml` |
| **Componentes Padrão** | Design System (Storybook) | Stories | Compartilhados entre páginas/features | `Button`, `Input`, `Card` → `components/ui/` |
| **Padrões UI** | Design System (patterns.md) | Stories | Reutilizáveis em múltiplas histórias | "Forms use dual error feedback (inline + toast)" |
| **Decorative Decisions** | Design System | Stories | Visuais reutilizáveis | "Border radius: 8px (`rounded-lg`)" |
| **Accessibility Rules** | Design System (checklist) | Stories | Padrão obrigatório em tudo | "WCAG AA minimum, dark mode support" |
| **Decisões específicas de uma story** | DENTRO do story | Design System | Única para esse contexto | "Profile page uses Card layout" → Decision Log |
| **Guias de implementação** | Design System | Stories | Valioso para TODOS os devs | "How to use Button component properly" |

### ❌ **ERRADO** (No story):
```markdown
"Para a página de profile, use um Button com cor #10B981,
com hover #059669, e border-radius de 8px"
```

Porquê? Cada story repetiria isso 20 vezes = caos

### ✅ **CORRETO** (Split):

**Design System (`tokens.yaml`):**
```yaml
color-primary: #10B981
color-primary-hover: #059669
border-radius-base: 8px  # rounded-lg
```

**Design System (`Button.tsx` component):**
```tsx
<button className="bg-primary hover:bg-primary-hover rounded-lg">
```

**Story 2.12 (Decision Log):**
```markdown
| **Button Usage** | Use variant="primary" for all CTAs | Leverages Design System Button component; colors from tokens |
```

**Story 2.12 (AC):**
```markdown
- [ ] All CTAs use Button component from Design System (not custom)
- [ ] Buttons render correctly in light/dark modes
```

---

## 📊 IMPACTO DA CONSOLIDAÇÃO

| Antes | Depois |
|-------|--------|
| ❌ 5 questionamentos "por que isso?" | ✅ Tudo documentado + rastreável |
| ❌ AC vagas ("verificadas se usam...") | ✅ AC específicas (0 CRITICAL/HIGH, dark mode, 8 browsers) |
| ❌ Scope ambíguo (2 ou 5 páginas?) | ✅ Escopo explícito: 5 páginas, 100% Design System |
| ❌ Esforço subestimado (4-6h) | ✅ Realista (12-15h) |
| ❌ Story incompleto | ✅ Story completo e pronto para @dev |

---

## ✅ CHECKLIST FINAL

Depois de aplicar todos os passos acima:

- [ ] Passo 1: Backup criado
- [ ] Passo 2: Seção "📖 Story" adicionada
- [ ] Passo 3: Decision Log atualizado
- [ ] Passo 4: Phase 3 expandida (ou completa com PHASE-3-REFACTORED.md)
- [ ] Passo 5: CodeRabbit removido
- [ ] Passo 6: Browser coverage adicionada
- [ ] Passo 7: Effort estimate atualizado
- [ ] Passo 8: Change Log atualizado
- [ ] Passo 9: Status mantido em "Draft"
- [ ] Passo 10: Validação executada (YAML + Markdown OK)
- [ ] Arquivo: `docs/stories/2.12.story.md` pronto para revisão Pax

**Próximo:** Enviar para PO (Pax) para validação final → status → `Ready`

---

## 📚 DOCUMENTOS DE REFERÊNCIA

**Arquivos QA criados (ler para contexto):**
- 📄 `docs/qa/AUDIT-2026-04-11_auth-pages-detailed-analysis.md` — Análise detalhada por página
- 📄 `docs/qa/STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` — Especificação Phase 3 completa
- 📄 `docs/qa/QA-FIX_REQUEST-2026-04-11_story-2.12.md` — Issues 1-5 estruturados
- 📄 `docs/qa/STORY-2.12-FINAL-CORRECTIONS-CONSOLIDATED.md` — Decisões consolidadas

**Documentos AIOX (referência):**
- 📄 `.aiox-core/constitution.md` — Princípios inegociáveis do AIOX
- 📄 `.claude/rules/story-lifecycle.md` — Story status progression
- 📄 `docs/architecture/1-tech-stack-strategic-decisions.md` — Browser support
- 📄 `docs/architecture/8-coding-standards-conventions.md` — QA standards

---

## 🎨 CONCLUSÃO

**Pergunta original:** "Fui com preguiça de olhar a documentação ou realmente falta definir?"

**Resposta:** **DEFINIDO, mas disperso e incompleto**

Os 5 questionamentos têm respostas em documentos do projeto — mas estavam:
1. Espalhados em 5 arquivos diferentes
2. Alguns criados APÓS a story original
3. Story 2.12 não foi atualizada para refletir as decisões

Este plano **consolida tudo em um lugar**, fornecendo:
- ✅ Validação clara (cada coisa foi definida onde?)
- ✅ Respostas diretas (consulte X documento)
- ✅ Passo a passo (como aplicar)
- ✅ Resposta filosófica (design system vs stories)

---

**Próximo passo:** Aplicar os 10 passos acima ao arquivo 2.12.story.md

— Uma, desenhando com empatia 💝
