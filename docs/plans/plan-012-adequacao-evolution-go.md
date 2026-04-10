# Plan-012: Adequação Técnica e Terminológica — Evo GO (Master)

**Status:** 🛠️ DRAFT (Consolidado com Plan-013)  
**Data:** 2026-04-10  
**Responsável:** Aria (Architect)  

---

## 1. Objetivo

Este plano consolidado visa a **Adequação Completa** de toda a documentação do projeto, eliminando o risco de retrabalho técnico ao confundir a *Evolution API v2* (Node.js) com a *Evo GO* (Golang).

## 2. Diagnóstico Consolidado

| Fonte | Diagnóstico |
| :--- | :--- |
| **Grep Audit** | **182 referências** residuais de "Evolution API" em diversos documentos (Risco de ambiguidade). |
| **Plan-013 Check** | Identificou 2 documentos de arquitetura com erros críticos de versão e a necessidade de um mapa de API. |
| **Official Specs** | Confirmado uso de **Evo GO** (Go language) via `whatsmeow`. |

### 🛑 Diferenças Críticas a Validar
- **Webhooks:** Nomes de eventos em CAIXA ALTA (`MESSAGES_UPSERT`) vs v2 (`messages.upsert`).
- **Endpoints:** Pairing via `/instance/create` vs v2 `/qr-code`.
- **Assinatura:** Validação via `X-Signature` (HMAC-SHA256).

---

## 3. Ações Propostas (Hierarquizadas)

### Fase 1: Limpeza Global e Saneamento (Terminologia)
Substituição automatizada de "Evolution API" e "Evolution API v2" por "Evo GO" nos arquivos mapeados pelo audit (README, PRDs, Stories, etc).

### Fase 2: Ajuste Manual de Arquitetura (Foco Plan-013)
Correções cirúrgicas nos documentos onde a precisão técnica é vital:
- **`docs/architecture/1-tech-stack-strategic-decisions.md`**: Corrigir linha 11 (Adicionar link oficial e nota de alta performance).
- **`docs/architecture/5-backend-architecture-api-routes-middleware.md`**: Atualizar endpoints para refletir Evo GO.

### Fase 3: Criação de Artefatos de Suporte
- **[NOVO] `docs/architecture/evo-go-api-mapping.md`**: Criar mapeamento entre os endpoints da Evo GO e as rotas internas da aplicação antes do início da Story 2.1.
- **Servidor de Referência:** Documentar `https://evogo.renatop.com.br` como o endpoint oficial.

### Fase 4: Refino de Stories (Ready for Dev)
Revisar o **`epic-1-onboarding.md`** e as stories **1.5** e **1.6** para garantir que os payloads e critérios de aceitação reflitam a Evo GO.

---

## 4. Hierarquia de Documentação (TIERs)

Para evitar que a equipe se perca na "sujeira" terminológica enquanto a limpeza ocorre:

1. **TIER 1 (Leitura Obrigatória):**
   - `docs/CRITICAL-EVO-GO-NOT-EVOLUTION-API.md`
   - `docs/db/EVO-GO-TECHNICAL-SPECS.md`
   - Official Link: `https://docs.evolutionfoundation.com.br/evolution-go`

2. **TIER 2 (Implementação):**
   - `docs/prd/9-technical-architecture.md`
   - `docs/architecture/evo-go-api-mapping.md` (Em breve)

---

## 5. Próximos Passos

1. [ ] Executar substituições globais (Aria).
2. [ ] Criar o `evo-go-api-mapping.md` (Arch task).
3. [ ] Atualizar status da Epic 1 para "Approved with Evo GO Alignment".

---
**Aprovado por:** Aria (Architect) 🏛️ Consolidação concluída.
