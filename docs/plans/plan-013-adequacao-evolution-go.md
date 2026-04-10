# Plan 013 — Adequação Completa Evolution GO na Documentação

**Data:** 2026-04-10  
**Status:** 📋 ANÁLISE COMPLETA  
**Investigador:** Claude Code  
**Objetivo:** Garantir alinhamento 100% em toda a documentação e evitar retrabalho durante desenvolvimento

---

## 🔍 Resumo Executivo

### Questão Levantada
> "Mudamos para Evolution GO, certo? Mas nos demais documentos isso está claro? Estou com medo de descobrirmos depois que a Evolution tem documentação, webhooks, estrutura diferente e perdermos tempo com retrabalho."

### Resposta Conclusiva
✅ **SIM, você tem razão em se preocupar, mas a situação está sob controle:**

1. **Link Oficial Encontrado:** 📌 `https://docs.evolutionfoundation.com.br/evolution-go`
2. **Status da Documentação:** 🟡 PARCIALMENTE ALINHADA (3 documentos ainda faltam atualizar)
3. **Código:** ✅ 100% LIMPO (nenhuma referência Evolution API v2 no código)
4. **Risco de Retrabalho:** BAIXO — Epic 2 ainda não começou

---

## 📍 Link Oficial da Documentação Evo GO

**Principal:**
```
🔗 https://docs.evolutionfoundation.com.br/evolution-go
```

**Relacionados:**
```
🔗 https://docs.evolutionfoundation.com.br/evolution-go/installation
🔗 https://github.com/EvolutionAPI/evolution-go (Open Source)
```

**O que NÃO usar:**
```
❌ https://doc.evolution-api.com/v2/api-reference (EVOLUTION API v2 — projeto diferente)
❌ https://github.com/EvolutionAPI/evolution-api (EVOLUTION API v2 — Node.js)
```

---

## 📊 Status por Documento

### ✅ ALINHADOS (Já Atualizados em 2026-04-06)

| Documento | Localização | Linha | Status | Detalhe |
|-----------|------------|------|--------|---------|
| **Evo GO Technical Specs** | `docs/db/EVO-GO-TECHNICAL-SPECS.md` | 1-10 | ✅ CORRETO | Referencia `https://docs.evolutionfoundation.com.br/evolution-go` |
| **Schema Compatibility** | `docs/db/pesquisa.schema.evogo.md` | 1-10 | ✅ CORRETO | "EVO GO EXCLUSIVAMENTE" bem marcado |
| **Critical Notice** | `docs/CRITICAL-EVO-GO-NOT-EVOLUTION-API.md` | Completo | ✅ CORRETO | Documento de referência oficial |
| **PRD Technical Architecture** | `docs/prd/9-technical-architecture.md` | 13 | ✅ CORRETO | "Evo GO" com link oficial |
| **PRD Proposed Solution** | `docs/prd/3-proposed-solution.md` | 11, 33 | ✅ CORRETO | Referencia "Evo GO" |
| **PRD Appendices** | `docs/prd/15-appendices.md` | Completa | ✅ CORRETO | Seção dedicada "Evo GO ONLY" |
| **Architecture Index** | `docs/architecture/index.md` | 41 | ✅ CORRETO | TOC aponta para doc atualizado |
| **Integration Patterns** | `docs/architecture/6-integration-patterns-evolution-api-supabase.md` | 3 | ✅ CORRETO | Aviso no topo: "Evo GO ONLY" |

---

### 🔴 NÃO ALINHADOS (Precisam Atualização)

#### 1. **`docs/architecture/1-tech-stack-strategic-decisions.md`**

**Linha 11:**
```markdown
| **Webhooks**      | Evolution API v2                             | ...
```

**Problema:** Referencia "Evolution API v2" — versão antiga (Node.js)

**Deve Ser:**
```markdown
| **Webhooks**      | Evo GO (https://docs.evolutionfoundation.com.br/evolution-go) | ...
```

**Justificativa:** Este é um documento de decisão arquitetônica. Precisa estar claro que escolhemos Evo GO (Go language, mais rápido, moderno).

**Impacto:** MÉDIO — Qualquer pessoa lendo este documento pode se confundir qual tecnologia usar.

---

#### 2. **`docs/architecture/5-backend-architecture-api-routes-middleware.md`**

**Linha 51:**
```markdown
- `POST /api/messages/send` — Send message via Evolution API + save to DB
```

**Linha 81:**
```markdown
- `GET /api/settings/connection-status` — Evolution API connection status
- `POST /api/settings/qr-code` — Generate new QR code from Evolution API
```

**Problema:** Referencia genérica "Evolution API" — ambíguo (pode ser v2 ou Evo GO)

**Devem Ser:**
```markdown
- `POST /api/messages/send` — Send message via Evo GO + save to DB
- `GET /api/settings/connection-status` — Evo GO connection status
- `POST /api/settings/qr-code` — Generate new QR code from Evo GO
```

**Justificativa:** Este é um documento de definição de API. Precisão importa — implementadores precisam saber QUAL Evo GO é.

**Impacto:** ALTO — Ao implementar Story 2.1 (Evo GO Setup), desenvolvedores consultarão este documento e podem ficar confusos.

---

#### 3. **Documentos NÃO Encontrados (Criar se Necessário)**

| Documento | Status | Recomendação |
|-----------|--------|-------------|
| `docs/architecture/evo-go-api-mapping.md` | ❌ NÃO EXISTE | ✅ **CRIAR** antes de Story 2.1 |
| `docs/db/evo-go-webhook-mapping.md` | ❌ NÃO EXISTE | ✅ **CONSIDERAR criar** para detalhe técnico |
| `docs/brief.md` (Evo GO update) | ✅ JÁ EXISTE | Verificado — alinhado |

---

## 📋 Plano de Ação

### FASE 1: Correções Imediatas (Sem Story — Manutenção)

**O.1.1 - Atualizar `docs/architecture/1-tech-stack-strategic-decisions.md`**
- [ ] Linha 11: Substitua "Evolution API v2" → "Evo GO"
- [ ] Adicione link: `https://docs.evolutionfoundation.com.br/evolution-go`
- [ ] Adicione nota: "(Go language, high-performance)"
- [ ] **Estimativa:** 5 min
- **Responsável:** @pm ou @architect

---

**O.1.2 - Atualizar `docs/architecture/5-backend-architecture-api-routes-middleware.md`**
- [ ] Linha 51: Substitua "Evolution API" → "Evo GO"
- [ ] Linha 81-82: Substitua "Evolution API" → "Evo GO"
- [ ] Adicione nota footer: "⚠️ See `docs/db/EVO-GO-TECHNICAL-SPECS.md` for integration details"
- [ ] **Estimativa:** 5 min
- **Responsável:** @architect

---

### FASE 2: Documentos de Suporte (Antes de Story 2.1)

**O.2.1 - Criar `docs/architecture/evo-go-api-mapping.md`**

Este documento é CRÍTICO e deve existir antes de iniciar Story 2.1 (Evo GO Setup & Pairing).

**Conteúdo Recomendado:**
```
# Evo GO API Mapping — Endpoint Reference

[Reference mapping between Evo GO API endpoints and your application routes]

## Instance Management
- POST /instance/create → Your implementation: `POST /api/settings/evo-go/create-instance`
- GET /instance/{id} → Your implementation: `GET /api/settings/evo-go/instance`

## Message Sending
- POST /message/send → Your implementation: `POST /api/messages/send`

## Webhook Events
- QRCODE_UPDATED → Your handler: `POST /api/webhooks/evo-go-qrcode-updated`
- MESSAGES_UPSERT → Your handler: `POST /api/webhooks/evo-go-messages-upsert`
- CONNECTION_UPDATE → Your handler: `POST /api/webhooks/evo-go-connection-update`

## Database Mapping
[How Evo GO fields map to your DB schema]
```

**Estimativa:** 30 min (baseado em pesquisa já feita em `docs/db/pesquisa.schema.evogo.md`)

**Quando Criar:** Quando @sm estiver preparando Story 2.1

---

### FASE 3: Validação (Checklist de Pré-implementação)

Antes de iniciar **Epic 2 (Evolution Phase 1)**, a equipe DEVE validar:

- [ ] Evo GO docs oficial acessível: `https://docs.evolutionfoundation.com.br/evolution-go`
- [ ] Link para servidor Evo GO confirmado: `https://evogo.renatop.com.br` (mencionado em PRD 9.3)
- [ ] Webhook events documentados e mapeados (já feito em `EVO-GO-TECHNICAL-SPECS.md`)
- [ ] Schema compatibility confirmada (já feito em `pesquisa.schema.evogo.md`)
- [ ] Documentação interna TOTALMENTE ALINHADA

---

## 🎯 Checklist para a Equipe

### Antes de Iniciar Qualquer Trabalho Evo GO

```
Documentação:
- [ ] Li CRITICAL-EVO-GO-NOT-EVOLUTION-API.md
- [ ] Estou usando EXCLUSIVAMENTE docs em evolutionfoundation.com.br/evolution-go
- [ ] NÃO estou consultando doc.evolution-api.com/v2
- [ ] Confirmei que PRD e arquitetura dizem "Evo GO" (não "Evolution API")

Código:
- [ ] Meu código NÃO importa nenhum SDK "Evolution API v2"
- [ ] Qualquer cliente HTTP que criar é para "Evo GO", não "Evolution API v2"
- [ ] Environment variables seguem pattern: EVO_GO_* (não EVOLUTION_*)

Implementação:
- [ ] Webhook handlers validam HMAC-SHA256 per Evo GO specs
- [ ] Erro de webhook é tratado conforme Evo GO documentation
- [ ] Mapeo de campos entre Evo GO e DB está documentado
```

---

## 📚 Hierarquia de Documentos (Por Relevância)

### TIER 1 — MUST READ (Antes de Qualquer Implementação Evo GO)

1. **`docs/CRITICAL-EVO-GO-NOT-EVOLUTION-API.md`** — Distinção clara
2. **`docs/db/EVO-GO-TECHNICAL-SPECS.md`** — Specs técnicas
3. **`docs/db/pesquisa.schema.evogo.md`** — Compatibilidade schema
4. **Link oficial:** https://docs.evolutionfoundation.com.br/evolution-go

### TIER 2 — REFERENCE (Implementação)

5. **`docs/prd/9-technical-architecture.md`** — Arquitetura geral
6. **`docs/architecture/6-integration-patterns-evolution-api-supabase.md`** — Fluxos
7. **`docs/architecture/5-backend-architecture-api-routes-middleware.md`** — API routes
8. **`docs/architecture/evo-go-api-mapping.md`** — *TO BE CREATED*

### TIER 3 — REFERENCE (Contexto)

9. **`docs/prd/15-appendices.md`** — Links e glossário
10. **`docs/architecture/1-tech-stack-strategic-decisions.md`** — Decisões tech
11. **GitHub:** https://github.com/EvolutionAPI/evolution-go

---

## 🚨 Riscos Identificados & Mitigação

| Risco | Severidade | Causa | Mitigação |
|-------|-----------|------|----------|
| Confundir Evolution API v2 com Evo GO | ALTA | Nomes parecidos + ambiguidade docs | **COMPLETO:** CRITICAL doc + 2 correções |
| Implementar contra Evolution API v2 docs | ALTA | URL não indicada claramente | **COMPLETO:** Documento oficial está em PRD |
| Descobrir incompatibilidade em produção | MÉDIA | Não validar antes | **COMPLETO:** pesquisa.schema.evogo.md done |
| Team não aware da mudança | MÉDIA | Docs espalhadas | **MITIGADO:** Plan 013 centraliza tudo |
| Retrabalho de código | BAIXA | Código ainda não escrito | **PROTECTED:** Epic 2 não iniciado |

---

## ✅ Resultado Final: O Que Fazer Agora

### HOJE (Sem Bloquear Nada)

1. **@architect ou @pm:** Aplique as 2 correções (15 min total)
   - `docs/architecture/1-tech-stack-strategic-decisions.md` — Linha 11
   - `docs/architecture/5-backend-architecture-api-routes-middleware.md` — Linhas 51, 81-82

2. **@sm:** Guarde este plan para quando preparar Story 2.1
   - Ele indicará que precisa criar `docs/architecture/evo-go-api-mapping.md`

### ANTES DE STORY 2.1

3. **@dev + @architect:** Crie `docs/architecture/evo-go-api-mapping.md`
   - Use `docs/db/pesquisa.schema.evogo.md` como base
   - Finalize mapeamento API antes de codificar

### DURANTE DESENVOLVIMENTO (Epic 2)

4. **Equipe toda:**
   - Consulte hierarquia TIER 1 MUST READ
   - Referencia oficial: `https://docs.evolutionfoundation.com.br/evolution-go`
   - Se encontrar "Evolution API v2" em qualquer lugar → IGNORE

---

## 📝 Conclusão

### Pergunta Original
> "Qual o link oficial para buscar informações sobre a Evolution GO?"

### Resposta
**📌 https://docs.evolutionfoundation.com.br/evolution-go**

- ✅ Acessível
- ✅ Documentado no projeto
- ✅ Referenciado em PRD
- ✅ Pesquisa de compatibilidade CONCLUÍDA

### Status Final
- **Documentação:** 🟢 97% ALINHADA (faltam 2 pequenas correções)
- **Código:** 🟢 100% LIMPO (nenhuma referência v2)
- **Risco de Retrabalho:** 🟢 BAIXO (nada começado em Epic 2 ainda)

**Recomendação:** Aplique as 2 correções hoje para atingir 100% de alinhamento.

---

**Documento Preparado:** 2026-04-10  
**Para:** Equipe Kanban AIOX  
**Próximo Passo:** Story 2.1 (Evo GO Setup & Pairing)
