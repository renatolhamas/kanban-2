> 📅 Extraído em: 2026-04-29 (Dara — @data-engineer)
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Database Schema — Kanban & Conversations System

**10 tabelas | 37 índices | 31 políticas RLS | 5 funções | 33 migrações | 2 triggers | 6 extensões | 7.5K records**

## Estrutura Geral

O schema é baseado em **multi-tenant** com isolamento por `tenant_id`. Dados de usuários, contatos, conversas e kanbans são organizados hierarquicamente:

```
tenants (raiz)
├── users (usuários do tenant)
├── kanbans (boards kanban)
│   ├── columns (colunas do kanban)
│   └── conversations (conversas associadas)
├── contacts (contatos do WhatsApp)
├── conversations (conversas com contatos)
└── messages (mensagens nas conversas)
```

---

## Tabelas

### 1. **tenants** — Raiz do Multi-Tenant

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `name` | text | NO | — | — | Nome do tenant |
| `subscription_status` | text | NO | 'active' | — | Status: active, suspended, cancelled |
| `evolution_instance_id` | text | YES | — | — | ID único da instância Evolution GO (UNIQUE quando NOT NULL) |
| `connection_status` | text | NO | 'disconnected' | — | Conexão WhatsApp: disconnected, connected, reconnecting |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |
| `qr_code` | text | YES | — | — | QR code para pareamento WhatsApp |
| `qr_code_expires_at` | timestamptz | YES | — | — | Timestamp de expiração do QR code |
| `evolution_instance_token` | text | YES | — | — | Token específico da instância para chamadas de API Evo GO |

**Índices:** 4 (pkey, 2x UNIQUE, 1x subscription)  
**RLS Policies:** 3 (select_own, update_own, delete_own)

---

### 2. **users** — Usuários do Tenant

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `tenant_id` | uuid | NO | — | tenants(id) CASCADE | FK para tenant |
| `email` | text | NO | — | — | Email único por tenant |
| `role` | text | NO | 'user' | — | Role: admin, user |
| `name` | text | YES | — | — | Nome do usuário |
| `password_hash` | text | YES | — | — | Hash da senha |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |

**Constraints:** UNIQUE (email, tenant_id)  
**Índices:** 4 (pkey, 2x UNIQUE, tenant lookup)  
**RLS Policies:** 4 (via auth.uid() — exceção ao padrão)

---

### 3. **kanbans** — Boards Kanban

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `tenant_id` | uuid | NO | — | tenants(id) CASCADE | FK para tenant |
| `name` | text | NO | — | — | Nome do kanban board |
| `is_main` | boolean | NO | false | — | Se é o board principal |
| `order_position` | integer | NO | 0 | — | Posição na lista |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |

**Constraints:** UNIQUE (tenant_id, is_main WHERE is_main)  
**Índices:** 4  
**RLS Policies:** 4

---

### 4. **columns** — Colunas do Kanban

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `kanban_id` | uuid | NO | — | kanbans(id) CASCADE | FK para kanban |
| `name` | text | NO | — | — | Nome da coluna |
| `order_position` | integer | NO | 0 | — | Posição da coluna |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |

**Índices:** 2 (pkey, kanban_order composite)  
**RLS Policies:** 4 (via kanban.tenant_id)

---

### 5. **contacts** — Contatos do WhatsApp

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `tenant_id` | uuid | NO | — | tenants(id) CASCADE | FK para tenant |
| `name` | text | NO | — | — | Nome do contato (editável) |
| `phone` | text | NO | — | — | Número do WhatsApp |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |
| `wa_name` | text | YES | — | — | Nome do WhatsApp (Evo GO) |
| `is_group` | boolean | YES | false | — | Se é um grupo |

**Constraints:** UNIQUE (phone, tenant_id)  
**Índices:** 4  
**RLS Policies:** 4

---

### 6. **conversations** — Conversas com Contatos

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `tenant_id` | uuid | NO | — | tenants(id) CASCADE | FK para tenant |
| `contact_id` | uuid | NO | — | contacts(id) CASCADE | FK para contato ⚠️ |
| `kanban_id` | uuid | YES | — | kanbans(id) SET NULL | FK para kanban |
| `column_id` | uuid | YES | — | columns(id) SET NULL | FK para coluna ⚠️ |
| `wa_phone` | text | NO | — | — | Número do WhatsApp (cópia) |
| `status` | text | NO | 'active' | — | Status: active, archived, closed |
| `last_message_at` | timestamptz | YES | — | — | Timestamp da última mensagem |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |
| `evolution_message_id` | text | YES | — | — | ID da última mensagem (Evo GO) |
| `unread_count` | integer | YES | 0 | — | Contador de não lidas |

**Constraints:** UNIQUE (evolution_message_id)  
**Índices:** 7 (alguns nunca usados)  
**RLS Policies:** 4  
**⚠️ Nota:** contact_id e column_id sem índices cobrindo FK

---

### 7. **messages** — Mensagens nas Conversas

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `conversation_id` | uuid | NO | — | conversations(id) CASCADE | FK para conversa |
| `sender_type` | text | NO | — | — | customer, agent, system |
| `content` | text | NO | — | — | Conteúdo da mensagem |
| `media_url` | text | YES | — | — | URL de mídia |
| `media_type` | text | YES | — | — | image, video, audio, document |
| `created_at` | timestamptz | NO | now() | — | |
| `evolution_message_id` | text | YES | — | — | ID único (Evo GO) |
| `sender_jid` | text | YES | — | — | JID do remetente |

**Constraints:** UNIQUE (evolution_message_id)  
**Índices:** 4  
**RLS Policies:** 4

---

### 8. **automatic_messages** — Mensagens Automáticas

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | uuid | NO | uuid_generate_v4() | — | PK |
| `tenant_id` | uuid | NO | — | tenants(id) CASCADE | FK para tenant |
| `name` | text | NO | — | — | Nome da mensagem |
| `message` | text | NO | — | — | Conteúdo |
| `scheduled_interval_minutes` | integer | YES | — | — | Intervalo de disparo |
| `scheduled_kanban_id` | uuid | YES | — | kanbans(id) SET NULL | FK para kanban ⚠️ |
| `created_at` | timestamptz | NO | now() | — | |
| `updated_at` | timestamptz | NO | now() | — | |

**Índices:** 2  
**RLS Policies:** 4  
**⚠️ Nota:** scheduled_kanban_id sem índice cobrindo FK

---

### 9. **failed_registrations** — Registro de Falhas

| Campo | Tipo | Nullable | Default | FK | Descrição |
|-------|------|----------|---------|----|----|
| `id` | bigint | NO | nextval(...) | — | PK (autoincrement) |
| `email` | text | NO | — | — | Email que falhou |
| `created_at` | timestamptz | YES | now() | — | |
| `created_resources` | jsonb | NO | — | — | Recursos criados |
| `cleanup_attempted` | boolean | YES | false | — | Se foi tentado cleanup |
| `cleanup_status` | jsonb | YES | — | — | Status do cleanup |
| `error_message` | text | YES | — | — | Mensagem de erro |
| `notes` | text | YES | — | — | Notas |
| `resolved_at` | timestamptz | YES | — | — | Timestamp de resolução |

**⚠️ Nota:** RLS está DESABILITADO (necessário para pré-auth logging)  
**Índices:** 4 (alguns nunca usados)

---

## Resumo de Constraints

| Tipo | Count |
|------|-------|
| PRIMARY KEY | 9 |
| FOREIGN KEY | 10 |
| UNIQUE | 7 |
| CHECK | 0 |

---

## 📊 Messages Table Extended

| Coluna | Tipo | Nullable | Padrão | Descrição |
|--------|------|----------|--------|-----------|
| `status` | text | NO | 'sent' | **NEW:** sent \| error \| delivered \| read |
| `status_updated_at` | timestamptz | NO | now() | **NEW:** Atualizado por trigger quando status muda |

**Triggers on messages:**
- `tr_messages_status_update` (BEFORE UPDATE) — atualiza status_updated_at automaticamente
- `tr_poll_message_status` (AFTER INSERT) — chama webhook para polling de status

## 🔴 Issues Encontrados

1. **3 FKs sem índices cobrindo (INFO - performance):**
   - automatic_messages.scheduled_kanban_id
   - conversations.contact_id
   - conversations.column_id
   - Recomendação: Criar índices se queries frequentes

2. **13 índices nunca usados (INFO - monitorar):**
   - failed_registrations: 3 (created_at, email, resolved_at)
   - tenants: 1 (subscription)
   - kanbans: 1 (main_tenant)
   - contacts: 1 (phone_tenant)
   - conversations: 6 (last_message, wa_phone_tenant, evolution_id, active_by_tenant)
   - messages: 1 (evolution_id)
   
   Monitorar por 2-3 semanas antes de remover.

3. **RLS desabilitado em 2 tabelas (por design):**
   - `failed_registrations` — tabela pré-autenticação
   - `debug_auth_logs` — logs internos (RLS habilitado mas sem policies)

4. **4 Functions com search_path mutable (WARN - security):**
   - `upsert_contact`
   - `handle_message_status_update`
   - `trigger_poll_message_status`
   - `get_conversations_with_last_message`
   
   Remediação: Adicionar `SET search_path = public;` nas definições

5. **4 SECURITY DEFINER functions acessíveis (WARN):**
   - Mesmas 4 acima podem ser executadas por `anon` e `authenticated` roles
   - Recomendação: Revisar intencionalidade ou revocar access

