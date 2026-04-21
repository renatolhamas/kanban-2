# Tech Debt Backlog

Itens de débito técnico identificados durante desenvolvimento e QA.

---

## MEDIUM Priority

### TD-001 — Query redundante pós-RPC em handleMessagesUpsert

| Campo | Valor |
|-------|-------|
| **ID** | TD-001 |
| **Tipo** | tech-debt |
| **Prioridade** | MEDIUM |
| **Story Origem** | 5.1 |
| **Arquivo** | `app/api/webhooks/evo-go/route.ts:299-312` |
| **Identificado por** | Quinn (QA) — 2026-04-21 |
| **Status** | Open |

**Problema:**
Após chamar `supabase.rpc('upsert_contact', {...})`, o código faz uma query adicional `from('contacts').select('id').eq('id', contactId).single()` para buscar o contato. A RPC já retorna o UUID diretamente como `contactId` — o fetch é desnecessário.

**Fix sugerido:**
Remover o fetch adicional e usar `contactId` diretamente para as operações seguintes (kanban lookup, conversation upsert).

**Impacto:**
- 1 query Supabase eliminada por webhook recebido
- Redução de latência em alta volumetria

---

### TD-004 — Automação de Design Token Compliance & CI/CD (Script Interno)

| Campo | Valor |
|-------|-------|
| **ID** | TD-004 |
| **Tipo** | tech-debt |
| **Prioridade** | MEDIUM |
| **Story Origem** | 5.2 |
| **Arquivo** | `src/components/`, `docs/design-system/ENFORCEMENT-GUIDE.md` |
| **Identificado por** | User (via link de auditoria) — 2026-04-21 |
| **Status** | Open |

**Problema:**
Necessidade de automatizar a verificação de conformidade de design tokens (`npm run check:tokens`) via GitHub Actions para evitar regressões e garantir que cores hardcoded não voltem a ser inseridas. O foco deve ser o uso do script de compliance interno do projeto.

**Fix sugerido:**
1. Criar novo workflow GitHub Action que execute `npm run check:tokens` em cada Pull Request.
2. Auditar componentes gerados na Story 5.2 para garantir uso estrito de tokens via script local.
3. Garantir que o script gere alertas claros no pipeline de CI.

**Impacto:**
- Garantia de integridade do Design System em longo prazo sem dependência de ferramentas externas de terceiros para esta verificação específica.
- Bloqueio preventivo de PRs com cores hardcoded.

---

## LOW Priority

### TD-002 — Import fora do topo do arquivo em route.ts

| Campo | Valor |
|-------|-------|
| **ID** | TD-002 |
| **Tipo** | tech-debt |
| **Prioridade** | LOW |
| **Story Origem** | 5.1 |
| **Arquivo** | `app/api/webhooks/evo-go/route.ts:256` |
| **Identificado por** | Quinn (QA) — 2026-04-21 |
| **Status** | Open |

**Problema:**
`import { extractContactInfo } from '@/lib/api/webhook-utils'` está posicionado na linha 256, no meio do arquivo (após funções). ES modules convencionalmente agrupam todos os imports no topo do arquivo.

**Fix sugerido:**
Mover o import para o topo do arquivo junto dos outros imports existentes.

**Impacto:**
- Melhora legibilidade e conformidade com padrão ES modules
- Sem impacto funcional

---

### TD-003 — Tipagem fraca para messageId em handleMessagesUpsert

| Campo | Valor |
|-------|-------|
| **ID** | TD-003 |
| **Tipo** | tech-debt |
| **Prioridade** | LOW |
| **Story Origem** | 5.1 |
| **Arquivo** | `app/api/webhooks/evo-go/route.ts:270` |
| **Identificado por** | Quinn (QA) — 2026-04-21 |
| **Status** | Open |

**Problema:**
`const messageId = (data as any)?.key?.id` usa cast para `any`. O campo `key.id` poderia ser extraído através de tipagem dedicada ou via `EvoGoWebhookPayload` interface já existente.

**Fix sugerido:**
Tipar `data` com a interface existente ou criar `EvoGoMessageData` interface para o campo `data` do payload, eliminando o cast `as any`.

**Impacto:**
- Melhora segurança de tipo em tempo de compilação
- Alinha com padrão TypeScript estrito do projeto

---

## Histórico de Adições

| Data | ID | Adicionado por | Story |
|------|-----|---------------|-------|
| 2026-04-21 | TD-001 | Pax (PO) | 5.1 |
| 2026-04-21 | TD-002 | Pax (PO) | 5.1 |
| 2026-04-21 | TD-003 | Pax (PO) | 5.1 |
| 2026-04-21 | TD-004 | Pax (PO) | 5.2 |
