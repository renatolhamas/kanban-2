# Database Extensions — Extensões e Advisors

> 📅 Extraído em: 2026-04-16 17:50 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado (COMPLETO — via waterfall extraction)

## 📋 Extensões Habilitadas

**Total:** 6 extensões  
**Schema:** extensions (padrão Supabase)

| # | Extensão | Versão | Descrição |
|---|----------|--------|-----------|
| 1 | `uuid-ossp` | 1.1 | Gera UUIDs (uuid_generate_v4, uuid_generate_v1) |
| 2 | `pgcrypto` | 1.3 | Funções criptográficas (encrypt, decrypt, digest) |
| 3 | `plpgsql` | 1.0 | Linguagem procedural PL/pgSQL (padrão) |
| 4 | `pg_graphql` | 1.5.11 | GraphQL API sobre PostgreSQL (Supabase) |
| 5 | `pg_stat_statements` | 1.11 | Monitoramento de queries (estatísticas) |
| 6 | `supabase_vault` | 0.3.1 | Armazenamento seguro de secrets (Supabase) |

---

## Extensões Detalhadas

### 1. `uuid-ossp` — UUID Generation

**Propósito:** Gera identificadores únicos universais  
**Funções principais:**
- `uuid_generate_v4()` — Random UUID (usado em PKs)
- `uuid_generate_v1()` — Time-based UUID

**Uso no Schema:**

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

**Impacto:** ✅ Crítico — sem isto, PKs de tabelas falham

---

### 2. `pgcrypto` — Cryptographic Functions

**Propósito:** Criptografia, hashing, senhas  
**Funções principais:**
- `crypt(password, salt)` — Hashing UNIX-style
- `pgp_sym_encrypt()` / `pgp_sym_decrypt()` — Criptografia simétrica
- `digest()` — MD5, SHA1, SHA256

**Uso Potencial:**

```sql
-- Hashing de senhas (não usado atualmente, use bcrypt no backend)
INSERT INTO users (email, password_hash)
VALUES ('user@example.com', crypt('password', gen_salt('bf')));

-- Validação:
SELECT email FROM users
WHERE password_hash = crypt('password', password_hash);
```

**Status:** Instalada mas não usada ativamente (senhas hasheadas no backend)

---

### 3. `plpgsql` — PL/pgSQL Language

**Propósito:** Linguagem procedural para funções e triggers  
**Usado em:**
- `custom_access_token_hook()` — JWT enrichment
- `rls_auto_enable()` — RLS auto-enable

**Impacto:** ✅ Crítico — necessário para executar funções

---

### 4. `pg_graphql` — GraphQL API

**Propósito:** Expor schema PostgreSQL como GraphQL (Supabase feature)  
**Endpoint:** `https://project.supabase.co/graphql/v1`  
**Autenticação:** JWT Bearer token

**Exemplo Query:**

```graphql
query {
  kanbansCollection(filter: {tenantId: {eq: "uuid-here"}}) {
    edges {
      node {
        id
        name
        columnsCollection {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
```

**Status:** Instalada, requer autenticação via JWT

---

### 5. `pg_stat_statements` — Query Statistics

**Propósito:** Rastrear execução de queries para performance analysis  
**Dados Coletados:**
- Query text (normalizado)
- Tempo total, min, max
- Número de calls
- Linhas retornadas/modificadas

**Acesso:**

```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Uso:** Performance tuning, identificar bottlenecks

---

### 6. `supabase_vault` — Secrets Management

**Propósito:** Armazenar secrets/chaves de forma segura  
**Funções:**
- `vault.create_secret()` — Criar secret
- `vault.read_secret()` — Ler secret
- `vault.update_secret()` — Atualizar

**Exemplo:**

```sql
-- Armazenar API key
SELECT vault.create_secret(
  'evo_go_api_key',
  'sk-1234567890...',
  'Evo GO API Key'
);

-- Usar em função
SELECT content ->> 'secret'
FROM vault.decrypted_secrets
WHERE name = 'evo_go_api_key';
```

**Status:** Instalada, pode ser usada para Evo GO credentials

---

## Migrações do Sistema

| Migration | Descrição |
|-----------|-----------|
| `20260402025734` | `create_core_schema_v3` — Criação de tabelas e extensões base |
| `20260402030054` | `add_rls_policies` — RLS policies iniciais |
| `20260403024916` | `fix_users_rls_policy_to_auth_uid` — Correção de RLS para users |
| `20260404191826` | `create_failed_registrations` — Tabela de registros falhados |
| `20260407022056` | `fix_rls_tenant_id_claim_with_cast` — Type casting em RLS |
| `20260408021733` | `add_kanbans_is_main_unique_constraint` — Unique constraint |
| `20260413014555` | `update_tenants_connection_status_and_add_unique_constraint` — Evo GO integration |
| `20260413144601` | `add_qr_code_to_tenants` — QR code fields |
| `20260413171746` | `add_evolution_instance_token` — Instance token |
| `20260416085155` | `create_custom_access_token_hook` — JWT hook |
| `20260416092722` | `fix_custom_access_token_hook` — Hook fix |
| `20260416093514` | `fix_rls_use_app_metadata` — RLS → app_metadata |
| `20260416192121` | `drop_test_user_access_view` — Cleanup |
| `20260416192125` | `disable_rls_failed_registrations` — RLS disabled |
| `20260416192127` | `fix_users_rls_auth_uid_initplan_drop` — RLS fix |
| `20260416192130` | `fix_users_rls_auth_uid_initplan_create` — RLS fix |

---

## 🔴 Security Advisors

### 1. RLS Disabled in Public (ERROR)

**Problema:** `public.failed_registrations` tem RLS habilitado mas **sem nenhuma política**

**Impacto:** ⚠️ CRÍTICO  
- Tabela é inacessível via RLS para usuários autenticados
- Acesso controlado apenas via backend (Service Role key)

**Status:** ✅ INTENCIONAL  
**Razão:** Tabela para registros falhados (antes de autenticação completa)  
**Remediação:** Nenhuma — design intencional, confirme em `rls.md`

**Referência:** [Supabase Docs — RLS](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)

---

### 2. Leaked Password Protection Disabled (WARN)

**Problema:** Supabase Auth não verifica passwords contra HaveIBeenPwned.org

**Impacto:** 🟡 MÉDIO  
- Usuários podem usar senhas comprometidas
- Não há proteção automática

**Recomendação:**
1. Ir para [Supabase Dashboard](https://app.supabase.com)
2. Authentication → Password Security
3. Enable "Leaked Password Protection"

**Referência:** [Supabase Docs — Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

---

## 🟡 Performance Advisors

### 1. Unindexed Foreign Keys (INFO)

**Problema:** 3 FKs sem índice cobrindo

| Tabela | FK | Coluna |
|--------|----|----|
| `automatic_messages` | `scheduled_kanban_id_fkey` | scheduled_kanban_id |
| `conversations` | `column_id_fkey` | column_id |
| `conversations` | `contact_id_fkey` | contact_id |

**Impacto:** ℹ️ Baixo (não está em uso crítico ainda)

**Remediação:**

```sql
-- automatic_messages
CREATE INDEX idx_automatic_messages_scheduled_kanban_id
  ON public.automatic_messages (scheduled_kanban_id);

-- conversations (column_id)
CREATE INDEX idx_conversations_column_id
  ON public.conversations (column_id);

-- conversations (contact_id)
CREATE INDEX idx_conversations_contact_id
  ON public.conversations (contact_id);
```

**Referência:** [Supabase Docs — Unindexed Foreign Keys](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

---

### 2. Unused Indexes (INFO)

**Problema:** 7 índices não utilizados (pg_stat_statements mostra 0 calls)

| Tabela | Índice | Status |
|--------|--------|--------|
| `failed_registrations` | `failed_registrations_email_idx` | Não usado |
| `failed_registrations` | `failed_registrations_created_at_idx` | Não usado |
| `failed_registrations` | `failed_registrations_resolved_at_idx` | Não usado |
| `tenants` | `idx_tenants_subscription` | Não usado |
| `kanbans` | `idx_kanbans_main_tenant` | Não usado |
| `contacts` | `idx_contacts_phone_tenant` | Não usado |
| `conversations` | `idx_conversations_last_message` | Não usado |

**Recomendação:** Monitorar durante 2-4 semanas. Se continuar não-usado, considerar remover:

```sql
-- Exemplo: remover idx_tenants_subscription
DROP INDEX IF EXISTS idx_tenants_subscription;
```

**Referência:** [Supabase Docs — Unused Indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)

---

## Edge Functions

**Total:** 0

Nenhuma Edge Function está deployada no momento. Edge Functions são serverless functions Deno rodadas globalmente no Supabase.

**Para adicionar no futuro:**
```bash
supabase functions deploy função-name
```

---

## Recomendações

✅ **Manter:**
- uuid-ossp, pgcrypto, plpgsql (necessários)
- pg_stat_statements (monitoramento)
- supabase_vault (secrets futuros)

🔔 **Considerar:**
- Enable leaked password protection (Auth)
- Adicionar índices para FKs não-indexadas (performance)
- Monitorar unused indexes (remover após validação)

⚠️ **Observar:**
- RLS em `failed_registrations` é intencional (ver `rls.md`)
