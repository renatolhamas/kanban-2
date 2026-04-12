# Story 2.12 — Correções Consolidadas
## Pages Refactor — Application Pages with Design System

**Data:** 2026-04-11  
**Responsável:** Pax (Product Owner)  
**Status:** Pronto para aplicação no arquivo story  
**Decisão:** OPÇÃO B — Expandir Story 2.12 para incluir todas as 5 páginas auth

---

## 📋 RESUMO EXECUTIVO

### Achados
- ✅ Story 2.5 refatorou 2/5 páginas (login, register) — com issues restantes
- ❌ 3/5 páginas NÃO foram refatoradas (change-password, forgot-password, resend-confirmation)
- 📊 Conformidade atual: Login 7/10, Register 6/10, Others 1/10

### Decisão
**EXPANDIR STORY 2.12** para garantir **100% Design System compliance** em todas as 5 páginas auth

### Impacto
- Esforço: De 6-8h para 12-15h total (+4h Phase 3)
- Escopo: Mantém Home + Profile, expande Auth pages
- Qualidade: Garantia de consistência visual e técnica completa

---

## 🔧 CORREÇÕES NECESSÁRIAS (5 Issues)

### ISSUE #1: Clarificar Escopo Auth Pages ✅ (RESOLVIDO)

**Ação:** Trocar presunção por fato verificado  
**Status:** ✅ Auditoria completa realizada → AUDIT-2026-04-11_auth-pages-detailed-analysis.md

**Achado:** Story 2.5 menciona APENAS `/login` e `/register` como refatoradas. As outras 3 páginas estão fora de scope de Story 2.5 → Decisão: incluir em Story 2.12

---

### ISSUE #2: Reescrever Phase 3 com Conformidade 100% ✅ (PRONTO)

**Arquivo:** `STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` (completo)

**Conteúdo:**
- ✅ Discovery findings (Story 2.5 scope vs realidade)
- ✅ Phase 3.A: Login refactor (1h) + 2 fixes
- ✅ Phase 3.B: Register refactor (1.5h) + 5 fixes
- ✅ Phase 3.C: Change-Password refactor (1.5h) + 10 fixes
- ✅ Phase 3.D: Forgot-Password refactor (1.5h) + 10 fixes + Toast fix
- ✅ Phase 3.E: Resend-Confirmation refactor (1.5h) + 10 fixes + Toast fix
- ✅ Phase 3.F: Cross-page validation (1h)
- ✅ Updated AC (100% Design System compliance)
- ✅ Updated effort estimate (8h total)
- ✅ Success criteria (all-or-nothing)

**Copy-paste:** Integrar conteúdo de STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md diretamente na Story 2.12

---

### ISSUE #3: CodeRabbit Config Mismatch ✅ (OPÇÃO C - REMOVER)

**Decisão:** REMOVER CodeRabbit da story (hardware limitation)

**Ação necessária:** 

1. **Não adicionar** nada ao `core-config.yaml`
2. **Remover** seção `🤖 CodeRabbit Integration` da Story 2.12 completamente
3. **Usar** revisão manual de padrões Design System

**Impacto:** 
- ❌ Sem self-healing automático
- ✅ QA manual garante padrões (Phase 3.F validação cruzada)
- ✅ Sem overhead de hardware

**Nota:** @dev deve validar manualmente contra checklist de Design System

---

### ISSUE #4: Story Format Padrão ✅ (ADICIONAR)

**Ação:** Adicionar seção "Story" com formato padrão

**Localização:** Após frontmatter, antes de "Decision Log"

**Texto a inserir:**

```markdown
## 📖 Story

**As a** Designer/Frontend Team,  
**I want** all application pages to use consistent Design System components,  
**so that** the UI is visually consistent, accessible, and maintainable across light/dark modes

---
```

---

### ISSUE #5: Browser Testing Coverage ✅ (ADICIONAR)

**Ação:** Adicionar lista de browsers para Phase 4 testing

**Localização:** Task 4.1 da Phase 4 (linha ~423 na story atual)

**Texto a inserir (replace Task 4.1):**

```markdown
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

## 📝 COMO APLICAR AS CORREÇÕES

### Passo 1: Ler os documentos de referência
1. Ler: `docs/qa/AUDIT-2026-04-11_auth-pages-detailed-analysis.md` (contexto)
2. Ler: `docs/qa/STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` (especificação)

### Passo 2: Aplicar mudanças no arquivo
Abrir: `docs/stories/2.12.story.md`

#### Mudança 1: Adicionar Story (após frontmatter)
```
Inserir nova seção "## 📖 Story" (vide ISSUE #4)
```

#### Mudança 2: Reescrever Phase 3 completa
```
Localizar: ## 🔧 Technical Approach
Subseção: ### Phase 3: Verify Auth Pages
Substituir: Inteiro com conteúdo de STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md
```

#### Mudança 3: Atualizar Tasks/Subtasks
```
Localizar: ## Tasks / Subtasks
Subseção: ### Phase 3
Substituir: Tasks 3.1-3.7 com tasks detalhadas de PHASE-3-REFACTORED.md
```

#### Mudança 4: Atualizar AC
```
Localizar: ## 🎯 Acceptance Criteria
Subseção: Acceptance Criteria (ainda existem? Copiar ou manter?)
Verificar: Se seção "Auth Pages Refactor (Core)" existe
Adicionar: AC completas de PHASE-3-REFACTORED.md se não existir
```

#### Mudança 5: Adicionar Browser Coverage
```
Localizar: ## Tasks / Subtasks
Subseção: ### Phase 4: Final Validation & Quality
Task: 4.1 Visual validation
Substituir: com browser list detalhada (ISSUE #5)
```

#### Mudança 6: Atualizar Effort Estimate
```
Localizar: Dev Notes ou nova seção "Effort Estimate"
Verificar: Se Phase 3 estava original estimado em 1-2h
Atualizar: Para 8h (login 1h + register 1.5h + change 1.5h + forgot 1.5h + resend 1.5h + validation 1h)
Atualizar: Total story de 4-6h original para 12-15h
```

#### Mudança 7: Remover CodeRabbit Integration
```
Se CodeRabbit Integration seção existe no story:
  - DELETAR inteira (hardware limitation, não será usado)
  
Não adicionar nada ao core-config.yaml
```

#### Mudança 8: Atualizar Status
```
Localizar: Frontmatter, campo "status:"
Mudar: de "Draft" para "Ready" (após PO validation)
Nota: Deixar como "Draft" até PO validar todas as mudanças
```

### Passo 3: Validação
- [ ] Arquivo compila sem erros YAML
- [ ] Todas as seções presentes
- [ ] Links para audit documents corretos
- [ ] Markdown formatação correta

### Passo 4: Commit
```bash
git add docs/stories/2.12.story.md
git add docs/qa/AUDIT-2026-04-11_auth-pages-detailed-analysis.md
git add docs/qa/STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md
git add docs/qa/STORY-2.12-FINAL-CORRECTIONS-CONSOLIDATED.md

git commit -m "docs: refactor Story 2.12 auth pages scope per detailed audit (OPTION B)

- Expand Phase 3 to include 5 auth pages (not just verify)
- Add 100% Design System compliance checklist
- Update effort estimate: 6-8h → 12-15h
- Include detailed audit findings page-by-page

Closes: PO validation Issue #2 (Phase 3 scope clarification)"
```

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] **Issue #1:** ✅ Escopo clarificado via audit (AUDIT-2026-04-11_...)
- [ ] **Issue #2:** ✅ Phase 3 reescrito (STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md)
- [ ] **Issue #3:** ✅ CodeRabbit removido (hardware limitation)
- [ ] **Issue #4:** ✅ Story format padrão added
- [ ] **Issue #5:** ✅ Browser coverage specified
- [ ] **Story:** ✅ Atualizado com todas as mudanças
- [ ] **Documentos:** ✅ Salvos em docs/qa/ para referência
- [ ] **Status:** ✅ Ready para @dev iniciar desenvolvimento
- [ ] **Commit:** ✅ Changes com mensagem clara

---

## 📊 ANTES vs DEPOIS

### ANTES (Original)
```
Status: Draft (confuso)
Phase 3: Vago — "Verificar auth pages"
Escopo: Ambíguo (qual é in-scope?)
AC: Imprecisas ("verificadas se usam Design System")
Effort: 4-6h (Phase 3: 1-2h)
Dark Mode: Não mencionado
Browser Coverage: Não especificado
```

### DEPOIS (Refatorado)
```
Status: Draft → Ready (após aplicar mudanças)
Phase 3: Especificado página por página, item por item
Escopo: Explícito (5 páginas, 100% compliant)
AC: Precisas com success criteria all-or-nothing
Effort: 12-15h (Phase 3: 8h)
Dark Mode: 100% requerido em todas as páginas
Browser Coverage: 8 combinações (Chrome, Firefox, Safari, Mobile)
```

---

## 🎯 PRÓXIMOS PASSOS

1. **PO:** Revisar este documento e PHASE-3-REFACTORED.md
2. **PO:** Editar `docs/stories/2.12.story.md` com as 5 correções
3. **PO:** Validar mudanças (YAML, links, markdown)
4. **PO:** Commit com mensagem clara
5. **PO:** Atualizar status de story: Draft → Ready (após edições)
6. **DEV:** Recebe story ready, inicia Phase 1 (Home refactor)

---

**Documentos de Referência:**
- 📄 `docs/qa/AUDIT-2026-04-11_auth-pages-detailed-analysis.md` — Análise detalhada
- 📄 `docs/qa/STORY-2.12-ISSUE-2-PHASE-3-REFACTORED.md` — Especificação Phase 3
- 📄 `docs/qa/QA-FIX_REQUEST-2026-04-11_story-2.12.md` — Issues 1, 3, 4, 5

---

**Status Final:** ✅ Pronto para aplicação  
**Responsável:** Pax (Product Owner)  
**Data:** 2026-04-11

— Pax, garantindo qualidade com precisão cirúrgica 🎯
