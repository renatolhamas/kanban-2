# Extensões, Migrações e Advisors

> 📅 **Extraído em:** 2026-04-14  
> **Fonte:** Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real  
> **Status:** ✅ Atualizado

---

## Extensões PostgreSQL Instaladas

| Extensão | Versão | Propósito |
|----------|--------|-----------|
| `uuid-ossp` | 1.1 | Geração de UUIDs (`uuid_generate_v4()`) |
| `pgcrypto` | 1.3 | Funções criptográficas |
| `pg_graphql` | 1.5.11 | Suporte a GraphQL via Supabase |
| `pg_stat_statements` | 1.11 | Estatísticas de planejamento e execução de SQL |
| `supabase_vault` | 0.3.1 | Supabase Vault (secrets management) |
| `plpgsql` | 1.0 | Linguagem procedural PL/pgSQL (padrão) |

---

## Edge Functions

Nenhuma Edge Function deployada no projeto.

---

## Histórico de Migrações

| Versão | Nome | Data |
|--------|------|------|
| 20260402025734 | `create_core_schema_v3` | 2026-04-02 |
| 20260402030054 | `add_rls_policies` | 2026-04-02 |
| 20260403024916 | `fix_users_rls_policy_to_auth_uid` | 2026-04-03 |
| 20260404191826 | `create_failed_registrations` | 2026-04-04 |
| 20260407022056 | `fix_rls_tenant_id_claim_with_cast` | 2026-04-07 |
| 20260408021733 | `add_kanbans_is_main_unique_constraint` | 2026-04-08 |
| 20260413014555 | `update_tenants_connection_status_and_add_unique_constraint` | 2026-04-13 |
| 20260413144601 | `add_qr_code_to_tenants` | 2026-04-13 |
| 20260413171746 | `add_evolution_instance_token` | 2026-04-13 |

**Total:** 9 migrações aplicadas

---

## Advisors de Segurança

### 🔴 ERROR — `rls_references_user_metadata`

**Tabelas afetadas:** `automatic_messages`, `columns`, `contacts`, `conversations`, `kanbans`, `messages`, `tenants` (28 policies)

**Problema:** As policies RLS usam `auth.jwt() -> 'user_metadata' ->> 'tenant_id'`. O campo `user_metadata` é **editável pelo usuário final** via `supabase.auth.updateUser()`, o que permite que um usuário mal-intencionado altere seu próprio `tenant_id` e acesse dados de outro tenant.

**Remediação:**
```sql
-- Substituir em todas as policies:
-- ANTES (inseguro):
tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid

-- DEPOIS (seguro — app_metadata não é editável pelo usuário):
tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
```
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0015_rls_references_user_metadata

---

### 🔴 ERROR — `security_definer_view`

**Objeto:** `public.test_user_access`

**Problema:** A view `test_user_access` é definida com `SECURITY DEFINER`, o que faz com que ela execute com as permissões do criador da view, ignorando o RLS e as permissões do usuário que a consulta.

**Remediação:** Recriar a view sem `SECURITY DEFINER` ou removê-la se for apenas para testes.  
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

---

### 🟡 WARN — `auth_leaked_password_protection`

**Problema:** Proteção contra senhas comprometidas (verificação via HaveIBeenPwned.org) está desabilitada.

**Remediação:** Habilitar em Authentication → Settings → Password Security no dashboard do Supabase.  
Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

### ℹ️ INFO — `rls_enabled_no_policy`

**Tabela:** `public.failed_registrations`

**Situação:** RLS habilitado mas sem nenhuma policy. A tabela é inacessível para usuários autenticados. Operações só via service role.

---

## Advisors de Performance

### 🟡 WARN — `auth_rls_initplan` (múltiplas tabelas)

**Tabelas afetadas:** `tenants`, `users`, `kanbans`, `columns`, `contacts`, `conversations`, `messages`, `automatic_messages`

**Problema:** `auth.jwt()` e `auth.uid()` são reavaliados para **cada linha** da query ao invés de serem calculados uma única vez.

**Remediação:** Substituir nas policies:
```sql
-- ANTES (reavalia por linha):
auth.uid() = id
auth.jwt() -> 'user_metadata' ->> 'tenant_id'

-- DEPOIS (calcula uma vez):
(SELECT auth.uid()) = id
(SELECT auth.jwt()) -> 'user_metadata' ->> 'tenant_id'
```
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

---

### ℹ️ INFO — `unindexed_foreign_keys`

| Tabela | FK sem índice | Impacto |
|--------|--------------|---------|
| `automatic_messages` | `scheduled_kanban_id` (col 6) | DELETE em kanbans faz full scan |
| `conversations` | `column_id` (col 5) | DELETE em columns faz full scan |
| `conversations` | `contact_id` (col 3) | DELETE em contacts faz full scan |

**Remediação:**
```sql
CREATE INDEX IF NOT EXISTS idx_automatic_messages_scheduled_kanban
  ON public.automatic_messages (scheduled_kanban_id);

CREATE INDEX IF NOT EXISTS idx_conversations_column_id
  ON public.conversations (column_id);

CREATE INDEX IF NOT EXISTS idx_conversations_contact_id
  ON public.conversations (contact_id);
```

---

### ℹ️ INFO — `unused_index` (índices não utilizados)

| Índice | Tabela | Recomendação |
|--------|--------|-------------|
| `failed_registrations_email_idx` | failed_registrations | Monitorar, remover se nunca usado |
| `failed_registrations_created_at_idx` | failed_registrations | Monitorar, remover se nunca usado |
| `failed_registrations_resolved_at_idx` | failed_registrations | Monitorar, remover se nunca usado |
| `idx_tenants_subscription` | tenants | Monitorar, remover se nunca usado |
| `idx_kanbans_main_tenant` | kanbans | Redundante com o UNIQUE PARTIAL — considerar remover |
| `idx_contacts_phone_tenant` | contacts | Redundante com UNIQUE `contacts_phone_tenant_id_key` — remover |
| `idx_conversations_last_message` | conversations | Monitorar — útil para ordenação por recência |
