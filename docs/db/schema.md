# Schema — Documentação do Banco de Dados

> 📅 **Extraído em:** 2026-04-14  
> **Fonte:** Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real  
> **Status:** ✅ Atualizado

---

## Visão Geral

Sistema multi-tenant para gerenciamento de kanbans e conversas via WhatsApp.

| # | Tabela | PK | RLS | Descrição |
|---|--------|----|-----|-----------|
| 1 | `tenants` | uuid | ✅ | Raiz multi-tenant (organizações) |
| 2 | `users` | uuid | ✅ | Usuários da plataforma |
| 3 | `kanbans` | uuid | ✅ | Quadros kanban (max 1 `is_main=true` por tenant) |
| 4 | `columns` | uuid | ✅ | Colunas dentro de um kanban |
| 5 | `contacts` | uuid | ✅ | Contatos/clientes do tenant |
| 6 | `conversations` | uuid | ✅ | Conversas via WhatsApp |
| 7 | `messages` | uuid | ✅ | Mensagens das conversas |
| 8 | `automatic_messages` | uuid | ✅ | Mensagens automáticas/agendadas |
| 9 | `failed_registrations` | bigint | ✅ (sem policy) | Rastreamento de registros falhados |

**View:** `test_user_access` — SECURITY DEFINER (ver advisors de segurança)

---

## Tabelas

### `tenants`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `name` | text | NO | — | — |
| `subscription_status` | text | NO | `'active'` | — |
| `evolution_instance_id` | text | YES | — | UNIQUE (quando não nulo) |
| `connection_status` | text | NO | `'disconnected'` | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |
| `qr_code` | text | YES | — | QR code WhatsApp, recebido do webhook QRCODE_UPDATED (Evo GO) |
| `qr_code_expires_at` | timestamptz | YES | — | Expiração do QR code (tipicamente 5 min após geração) |
| `evolution_instance_token` | text | YES | — | Token da instância para chamadas à API Evo GO |

**Constraints:** PK `id` | UNIQUE `evolution_instance_id` | UNIQUE PARTIAL quando não nulo

---

### `users`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `tenant_id` | uuid | NO | — | FK → tenants.id CASCADE |
| `email` | text | NO | — | — |
| `role` | text | NO | `'user'` | — |
| `name` | text | YES | — | — |
| `password_hash` | text | YES | — | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `tenant_id → tenants.id CASCADE` | UNIQUE `(email, tenant_id)`

---

### `kanbans`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `tenant_id` | uuid | NO | — | FK → tenants.id CASCADE |
| `name` | text | NO | — | — |
| `is_main` | boolean | NO | `false` | Max 1 true por tenant (partial unique index) |
| `order_position` | integer | NO | `0` | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `tenant_id → tenants.id CASCADE` | UNIQUE PARTIAL `(tenant_id, is_main) WHERE is_main=true`

---

### `columns`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `kanban_id` | uuid | NO | — | FK → kanbans.id CASCADE |
| `name` | text | NO | — | — |
| `order_position` | integer | NO | `0` | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `kanban_id → kanbans.id CASCADE`

---

### `contacts`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `tenant_id` | uuid | NO | — | FK → tenants.id CASCADE |
| `name` | text | NO | — | — |
| `phone` | text | NO | — | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `tenant_id → tenants.id CASCADE` | UNIQUE `(phone, tenant_id)`

---

### `conversations`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `tenant_id` | uuid | NO | — | FK → tenants.id CASCADE |
| `contact_id` | uuid | NO | — | FK → contacts.id CASCADE |
| `kanban_id` | uuid | YES | — | FK → kanbans.id SET NULL |
| `column_id` | uuid | YES | — | FK → columns.id SET NULL |
| `wa_phone` | text | NO | — | Número WhatsApp |
| `status` | text | NO | `'active'` | — |
| `last_message_at` | timestamptz | YES | — | — |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `tenant_id CASCADE` | FK `contact_id CASCADE` | FK `kanban_id SET NULL` | FK `column_id SET NULL`

> ⚠️ **Advisor:** `contact_id` e `column_id` não possuem índice cobrindo a FK.

---

### `messages`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `conversation_id` | uuid | NO | — | FK → conversations.id CASCADE |
| `sender_type` | text | NO | — | — |
| `content` | text | NO | — | — |
| `media_url` | text | YES | — | — |
| `media_type` | text | YES | — | — |
| `created_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `conversation_id → conversations.id CASCADE`

---

### `automatic_messages`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | uuid | NO | uuid_generate_v4() | PK |
| `tenant_id` | uuid | NO | — | FK → tenants.id CASCADE |
| `name` | text | NO | — | — |
| `message` | text | NO | — | — |
| `scheduled_interval_minutes` | integer | YES | — | — |
| `scheduled_kanban_id` | uuid | YES | — | FK → kanbans.id SET NULL |
| `created_at` | timestamptz | NO | now() | — |
| `updated_at` | timestamptz | NO | now() | — |

**Constraints:** PK `id` | FK `tenant_id CASCADE` | FK `scheduled_kanban_id SET NULL`

> ⚠️ **Advisor:** `scheduled_kanban_id` não possui índice cobrindo a FK.

---

### `failed_registrations`

| Coluna | Tipo | Nullable | Default | Comentário |
|--------|------|----------|---------|------------|
| `id` | bigint | NO | nextval(seq) | PK — sequência, não UUID |
| `email` | text | NO | — | — |
| `created_at` | timestamptz | YES | now() | — |
| `created_resources` | jsonb | NO | — | Recursos criados antes da falha |
| `cleanup_attempted` | boolean | YES | `false` | — |
| `cleanup_status` | jsonb | YES | — | — |
| `error_message` | text | YES | — | — |
| `notes` | text | YES | — | — |
| `resolved_at` | timestamptz | YES | — | — |

**Constraints:** PK `id` (bigint/sequence)

> ⚠️ **Advisor (Segurança CRÍTICO):** RLS habilitado mas **sem nenhuma policy** — tabela inacessível para usuários autenticados.

---

## Índices

| Tabela | Índice | Tipo | Notas |
|--------|--------|------|-------|
| `automatic_messages` | `idx_automatic_messages_tenant` | btree(tenant_id) | — |
| `columns` | `idx_columns_kanban_order` | btree(kanban_id, order_position) | — |
| `contacts` | `contacts_phone_tenant_id_key` | UNIQUE btree(phone, tenant_id) | — |
| `contacts` | `idx_contacts_phone_tenant` | btree(phone, tenant_id) | Redundante com UNIQUE |
| `contacts` | `idx_contacts_tenant` | btree(tenant_id) | — |
| `conversations` | `idx_conversations_kanban_column` | btree(kanban_id, column_id) | — |
| `conversations` | `idx_conversations_last_message` | btree(last_message_at DESC) | ⚠️ Não usado |
| `conversations` | `idx_conversations_tenant_status` | btree(tenant_id, status) | — |
| `failed_registrations` | `failed_registrations_created_at_idx` | btree(created_at DESC) | ⚠️ Não usado |
| `failed_registrations` | `failed_registrations_email_idx` | btree(email) | ⚠️ Não usado |
| `failed_registrations` | `failed_registrations_resolved_at_idx` | btree PARTIAL WHERE IS NULL | ⚠️ Não usado |
| `kanbans` | `idx_kanbans_main_tenant` | btree PARTIAL WHERE is_main=true | ⚠️ Não usado |
| `kanbans` | `idx_kanbans_tenant_order` | btree(tenant_id, order_position) | — |
| `kanbans` | `idx_kanbans_unique_is_main_per_tenant` | UNIQUE PARTIAL btree(tenant_id, is_main) | Constraint de negócio |
| `messages` | `idx_messages_conversation_created` | btree(conversation_id, created_at DESC) | — |
| `tenants` | `idx_tenants_evolution_instance_id_unique` | UNIQUE PARTIAL WHERE IS NOT NULL | — |
| `tenants` | `idx_tenants_subscription` | btree(subscription_status) | ⚠️ Não usado |
| `users` | `idx_users_email_tenant` | btree(email, tenant_id) | — |
| `users` | `idx_users_tenant` | btree(tenant_id) | — |

---

## Diagrama de Relacionamentos

```
tenants
  ├── users          (tenant_id → CASCADE)
  ├── kanbans        (tenant_id → CASCADE)
  │     └── columns  (kanban_id → CASCADE)
  ├── contacts       (tenant_id → CASCADE)
  │     └── conversations (contact_id → CASCADE)
  │           ├── → kanbans  (kanban_id → SET NULL)
  │           ├── → columns  (column_id → SET NULL)
  │           └── messages   (conversation_id → CASCADE)
  └── automatic_messages (tenant_id → CASCADE)
        └── → kanbans   (scheduled_kanban_id → SET NULL)
```

---

## Sequences

| Sequence | Tabela | Início | Incremento |
|----------|--------|--------|------------|
| `failed_registrations_id_seq` | failed_registrations.id | 1 | 1 |
