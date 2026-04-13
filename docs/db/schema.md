# Database Schema — Kanban 2

**Última atualização:** 2026-04-07  
**Ambiente:** Supabase PostgreSQL  
**RLS:** Habilitado em todas as tabelas

---

## Visão Geral

Sistema multi-tenant para gerenciamento de kanbans e conversas via WhatsApp.

**Relacionamentos principais:**
- `tenants` → raiz de isolamento (multi-tenant)
- `users` e `contacts` → atores no sistema
- `kanbans` e `columns` → estrutura visual
- `conversations` e `messages` → histórico de chat

---

## Tabelas

### 1. `tenants`

Isolamento multi-tenant. Cada tenant é uma organização isolada.

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `name` | text | ❌ | — | — |
| `subscription_status` | text | ❌ | `'active'` | CHECK: `active`, `paused`, `cancelled` |
| `evolution_instance_id` | text | ✅ | — | UNIQUE |
| `connection_status` | text | ❌ | `'disconnected'` | CHECK: `connected`, `connecting`, `disconnected`, `error` |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**Referenciado por:** `users`, `contacts`, `kanbans`, `conversations`, `automatic_messages`  
**RLS:** ✅ Habilitado  
**Dados:** 3 registros

---

### 2. `users`

Usuários da plataforma (administradores, agentes).

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `tenant_id` | uuid | ❌ | — | FK → `tenants.id` |
| `email` | text | ❌ | — | — |
| `role` | text | ❌ | `'user'` | CHECK: `admin`, `user`, `owner` |
| `name` | text | ✅ | — | — |
| `password_hash` | text | ✅ | — | — |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**RLS:** ✅ Habilitado  
**Dados:** 3 registros

---

### 3. `kanbans`

Quadros kanban (um por tenant, ou múltiplos). Cada tenant pode ter **no máximo UM kanban com `is_main=TRUE`**.

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `tenant_id` | uuid | ❌ | — | FK → `tenants.id` |
| `name` | text | ❌ | — | — |
| `is_main` | boolean | ❌ | `false` | **UNIQUE per tenant** (constraint: `(tenant_id, is_main) WHERE is_main=TRUE`) |
| `order_position` | integer | ❌ | `0` | — |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**Referenciado por:** `columns`, `conversations`, `automatic_messages`  
**RLS:** ✅ Habilitado  
**Dados:** 0 registros  
**Constraint Importante:** `kanbans_unique_is_main_per_tenant` — Garante que cada tenant tenha no máximo 1 kanban com `is_main=TRUE`. Implementada via partial unique index (migration: `20260407155800_add_kanbans_is_main_unique_constraint.sql`)

---

### 4. `columns`

Colunas dentro de um kanban (To Do, In Progress, Done, etc.).

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `kanban_id` | uuid | ❌ | — | FK → `kanbans.id` |
| `name` | text | ❌ | — | — |
| `order_position` | integer | ❌ | `0` | — |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**Referenciado por:** `conversations`  
**RLS:** ✅ Habilitado  
**Dados:** 0 registros

---

### 5. `contacts`

Contatos (clientes, leads) de um tenant.

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `tenant_id` | uuid | ❌ | — | FK → `tenants.id` |
| `name` | text | ❌ | — | — |
| `phone` | text | ❌ | — | — |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**Referenciado por:** `conversations`  
**RLS:** ✅ Habilitado  
**Dados:** 0 registros

---

### 6. `conversations`

Conversas entre contatos e agentes (via WhatsApp).

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `tenant_id` | uuid | ❌ | — | FK → `tenants.id` |
| `contact_id` | uuid | ❌ | — | FK → `contacts.id` |
| `kanban_id` | uuid | ✅ | — | FK → `kanbans.id` |
| `column_id` | uuid | ✅ | — | FK → `columns.id` |
| `wa_phone` | text | ❌ | — | — |
| `status` | text | ❌ | `'active'` | CHECK: `active`, `closed`, `archived` |
| `last_message_at` | timestamptz | ✅ | — | — |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**Referenciado por:** `messages`  
**RLS:** ✅ Habilitado  
**Dados:** 0 registros

---

### 7. `messages`

Mensagens dentro de uma conversa.

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `conversation_id` | uuid | ❌ | — | FK → `conversations.id` |
| `sender_type` | text | ❌ | — | CHECK: `contact`, `agent`, `system` |
| `content` | text | ❌ | — | — |
| `media_url` | text | ✅ | — | — |
| `media_type` | text | ✅ | — | — |
| `created_at` | timestamptz | ❌ | `now()` | — |

**RLS:** ✅ Habilitado  
**Dados:** 0 registros

---

### 8. `automatic_messages`

Mensagens agendadas/automáticas por tenant.

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `uuid_generate_v4()` | PK |
| `tenant_id` | uuid | ❌ | — | FK → `tenants.id` |
| `name` | text | ❌ | — | — |
| `message` | text | ❌ | — | — |
| `scheduled_interval_minutes` | integer | ✅ | — | — |
| `scheduled_kanban_id` | uuid | ✅ | — | FK → `kanbans.id` |
| `created_at` | timestamptz | ❌ | `now()` | — |
| `updated_at` | timestamptz | ❌ | `now()` | — |

**RLS:** ✅ Habilitado  
**Dados:** 0 registros

---

### 9. `failed_registrations`

Rastreamento de registros falhados (para limpeza).

| Campo | Tipo | Nullable | Default | Constraints |
|-------|------|----------|---------|-------------|
| `id` | bigint | ❌ | `nextval('failed_registrations_id_seq')` | PK |
| `email` | text | ❌ | — | — |
| `created_at` | timestamptz | ✅ | `now()` | — |
| `created_resources` | jsonb | ❌ | — | — |
| `cleanup_attempted` | boolean | ✅ | `false` | — |
| `cleanup_status` | jsonb | ✅ | — | — |
| `error_message` | text | ✅ | — | — |
| `notes` | text | ✅ | — | — |
| `resolved_at` | timestamptz | ✅ | — | — |

**RLS:** ✅ Habilitado  
**Dados:** 0 registros  
**Nota:** Usado para rastreamento de falhas durante o registro e limpeza de recursos parciais.

---

## Resumo de Relações

```
tenants (raiz)
├── users (many-to-one)
├── contacts (many-to-one)
├── kanbans (many-to-one)
│   ├── columns (many-to-one)
│   │   └── conversations (many-to-one)
│   └── conversations (many-to-one)
│       └── messages (many-to-one)
└── automatic_messages (many-to-one)
```

---

## Padrões de Segurança

- ✅ **RLS Habilitado:** Todas as tabelas possuem RLS ativado
- ✅ **Multi-tenant:** Isolamento via `tenant_id` em cada tabela
- ✅ **Constraints:** CHECK constraints para enums (status, roles, etc.)
- ✅ **Integridade:** Foreign keys garantem integridade referencial
- ✅ **Auditoria:** `created_at` e `updated_at` em tabelas principais

---

## Índices e Performance

> Gerado automaticamente pelo Supabase para PKs e FKs.
> Execute `*analyze-performance hotpaths` para otimizações.

---

## Próximas Ações

- [ ] Validar policies de RLS (`*security-audit rls`)
- [ ] Analisar hotpaths de query (`*analyze-performance hotpaths`)
- [ ] Adicionar índices conforme necessário (`*design-indexes`)
