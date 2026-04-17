# Row Level Security (RLS) — Políticas de Acesso

> 📅 Extraído em: 2026-04-16 17:50 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado (COMPLETO — via waterfall extraction)

## 🔐 Visão Geral

**Total de Políticas:** 32
**Modelo:** Multi-tenant com JWT + tenant_id em app_metadata
**Authentication:** JWT (via custom_access_token_hook)
**Policy Pattern:** KISS (Keep It Simple Security) — acesso via tenant_id ou user_id  
**Auth Model:** JWT com tenant_id em app_metadata + auth.uid()

## Resumo de Cobertura

| Tabela | Policies | Coverage | Padrão |
|--------|----------|----------|--------|
| `automatic_messages` | 4 (CRUD) | ✅ 100% | JWT user_metadata |
| `columns` | 4 (CRUD) | ✅ 100% | Subquery via kanbans |
| `contacts` | 4 (CRUD) | ✅ 100% | JWT user_metadata |
| `conversations` | 4 (CRUD) | ✅ 100% | JWT user_metadata |
| `kanbans` | 4 (CRUD) | ✅ 100% | JWT user_metadata |
| `messages` | 4 (CRUD) | ✅ 100% | Subquery via conversations |
| `tenants` | 3 (SUD) | ✅ 100% | JWT user_metadata |
| `users` | 4 (CRUD) | ✅ 100% | auth.uid() |
| `failed_registrations` | 0 | ⚠️ SEM POLICY | RLS habilitado sem acesso |
| **TOTAL** | **31 policies** | — | — |

---

## Padrões de RLS Utilizados

### Padrão 1 — Multi-tenant via JWT user_metadata
```sql
tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
```
Usado em: `automatic_messages`, `contacts`, `conversations`, `kanbans`, `tenants`

> ⚠️ **Advisor (Segurança — ERROR):** `user_metadata` é editável pelo usuário final. Nunca deve ser usado em contexto de segurança. Usar `app_metadata` ou custom claims imutáveis.

### Padrão 2 — Per-user via auth.uid()
```sql
auth.uid() = id
```
Usado em: `users`

### Padrão 3 — Relacionamento seguro via subquery JOIN
```sql
-- columns: herda tenant via kanbans
kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)

-- messages: herda tenant via conversations
conversation_id IN (SELECT id FROM conversations WHERE tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
```
Usado em: `columns`, `messages`

> ⚠️ **Advisor (Performance — WARN):** `auth.jwt()` e `auth.uid()` são reavaliados por linha. Substituir por `(SELECT auth.uid())` e `(SELECT auth.jwt())` para melhor performance em escala.

---

## Policies por Tabela

### `automatic_messages` — 4 policies

| Policy | Cmd | Roles | USING | WITH CHECK |
|--------|-----|-------|-------|------------|
| `automatic_messages_select_own_tenant` | SELECT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` | — |
| `automatic_messages_insert_own_tenant` | INSERT | public | — | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `automatic_messages_update_own_tenant` | UPDATE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `automatic_messages_delete_own_tenant` | DELETE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` | — |

---

### `columns` — 4 policies (via subquery kanbans)

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `columns_select_own_tenant` | SELECT | public | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = ...)` |
| `columns_insert_own_tenant` | INSERT | public | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = ...)` |
| `columns_update_own_tenant` | UPDATE | public | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = ...)` |
| `columns_delete_own_tenant` | DELETE | public | `kanban_id IN (SELECT id FROM kanbans WHERE tenant_id = ...)` |

---

### `contacts` — 4 policies

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `contacts_select_own_tenant` | SELECT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `contacts_insert_own_tenant` | INSERT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `contacts_update_own_tenant` | UPDATE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `contacts_delete_own_tenant` | DELETE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |

---

### `conversations` — 4 policies

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `conversations_select_own_tenant` | SELECT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `conversations_insert_own_tenant` | INSERT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `conversations_update_own_tenant` | UPDATE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `conversations_delete_own_tenant` | DELETE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |

---

### `kanbans` — 4 policies

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `kanbans_select_own_tenant` | SELECT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `kanbans_insert_own_tenant` | INSERT | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `kanbans_update_own_tenant` | UPDATE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |
| `kanbans_delete_own_tenant` | DELETE | public | `tenant_id = (jwt→user_metadata→tenant_id)::uuid` |

---

### `messages` — 4 policies (via subquery conversations)

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `messages_select_own_tenant` | SELECT | public | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = ...)` |
| `messages_insert_own_tenant` | INSERT | public | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = ...)` |
| `messages_update_own_tenant` | UPDATE | public | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = ...)` |
| `messages_delete_own_tenant` | DELETE | public | `conversation_id IN (SELECT id FROM conversations WHERE tenant_id = ...)` |

---

### `tenants` — 3 policies (sem INSERT)

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `tenants_select_own` | SELECT | public | `id = (jwt→user_metadata→tenant_id)::uuid` |
| `tenants_update_own` | UPDATE | public | `id = (jwt→user_metadata→tenant_id)::uuid` |
| `tenants_delete_own` | DELETE | public | `id = (jwt→user_metadata→tenant_id)::uuid` |

> Sem policy INSERT — inserção de tenants deve ser feita via service role (backend privilegiado).

---

### `users` — 4 policies (auth.uid())

| Policy | Cmd | Roles | Condição |
|--------|-----|-------|----------|
| `Users can read own record` | SELECT | authenticated | `auth.uid() = id` |
| `Users can insert own record` | INSERT | authenticated | `auth.uid() = id` |
| `Users can update own record` | UPDATE | authenticated | `auth.uid() = id` |
| `Users can delete own record` | DELETE | authenticated | `auth.uid() = id` |

---

### `failed_registrations` — RLS DISABLED (Intencional)

**Status Atual:** RLS **DISABLED** | **0 policies** | **Controlado**

**Razão:** Tabela armazena registros de tentativas FALHADAS de registro (usuários não-autenticados, registro incompleto). RLS não é aplicável porque:
- Registros são criados ANTES do usuário estar autenticado
- Não há tenant_id no momento da criação (falha ocorre antes de associar tenant)
- Acesso é controlado no backend (Service Role key apenas)

**Segurança:** ✅ Controlada
- PostgREST NÃO expõe esta tabela
- Acesso APENAS via backend (Edge Functions, API interna)
- Service Role key com auditoria de logs

**Decisão arquitetural:** Confirmada em 2026-04-16 (Migration 20260416100100_disable_rls_failed_registrations)

---

## Alertas de Segurança (Advisors)

| Severity | Tipo | Impacto |
|----------|------|---------|
| 🔴 ERROR | `rls_references_user_metadata` | Todas as tabelas (exceto `users`) usam `user_metadata` editável pelo usuário — risco de bypass de tenant isolation |
| 🔴 ERROR | `security_definer_view` | View `test_user_access` usa SECURITY DEFINER — bypassa RLS do usuário que consulta |
| 🟡 WARN | `auth_leaked_password_protection` | Proteção contra senhas vazadas (HaveIBeenPwned) está desabilitada |
| ℹ️ INFO | `rls_enabled_no_policy` | `failed_registrations` tem RLS sem policy |

### Remediação recomendada para `rls_references_user_metadata`

Substituir `user_metadata` por `app_metadata` (imutável pelo usuário):
```sql
-- Antes (inseguro):
tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid

-- Depois (seguro):
tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
```
