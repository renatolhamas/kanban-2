> 📅 Extraído em: 2026-04-25 às 00:00 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Custom Functions

**Total: 4 funções PL/pgSQL**

---

## Tabelas de Suporte

### **debug_auth_logs** — Logs de Autenticação (Debug)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Timestamp |
| `event_type` | text | Tipo de evento (hook_start, error_*, hook_success, fatal_error) |
| `payload` | jsonb | Full JWT event payload |
| `extracted_id` | uuid | User ID extraído |
| `message` | text | Mensagem legível |
| `error_detail` | text | Detalhes de erro |

**Uso:** Rastreamento de problemas de autenticação JWT em `custom_access_token_hook()`

---

---

## 1. **custom_access_token_hook()**

**Tipo:** FUNCTION  
**Linguagem:** PL/pgSQL  
**Retorno:** jsonb (evento modificado)  
**Escopo:** Supabase Auth hook — executada em CADA login

### Objetivo

Enriquecer JWT com `tenant_id` e `role` do usuário, enabling RLS isolation.

### Fluxo

1. Extrai `user_id` (sub) do JWT
2. Faz lookup na tabela `users` para `tenant_id` e `role`
3. Deep-merges `app_metadata` no JWT preservando claims
4. Retorna JWT enriquecido

### Comportamento de Erro

- **STRICT mode:** Se falhar → **login falha**
- Garante que todo usuário logado tem `tenant_id` válido

---

## 2. **rls_auto_enable()**

**Tipo:** FUNCTION (Event Trigger)  
**Linguagem:** PL/pgSQL  
**Retorno:** event_trigger  
**Escopo:** Detecta novos CREATE TABLE e habilita RLS automaticamente

### Objetivo

Garante que **toda tabela nova** no schema `public` tem RLS habilitado.

### Fluxo

1. Detecta comandos DDL: CREATE TABLE, CREATE TABLE AS, SELECT INTO
2. Para cada tabela criada em `public`
3. Executa: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. Registra em logs se sucesso ou falha

### Segurança

- Previne RLS "deshabilitado por acidente"
- Se tabela nova não tiver policies, bloqueia SELECT automaticamente

---

## 3. **upsert_contact()**

**Tipo:** FUNCTION  
**Linguagem:** PL/pgSQL  
**Retorno:** uuid (contact_id)  
**Escopo:** Upsert idempotente de contatos WhatsApp

### Objetivo

Inserir ou atualizar contato com base no par `(phone, tenant_id)`, preservando edições manuais.

### Comportamento

- **Se novo:** INSERT
- **Se existe:** UPDATE apenas `wa_name`, `is_group`
- **Preserva:** Campo `name` (edições manuais não são sobrescritas)

### ⚠️ Aviso de Segurança

- `search_path` não está setado
- Deveria ter: `SET search_path = public;`
- Remediação: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

---

## 4. **get_conversations_with_last_message()**

**Tipo:** FUNCTION (RPC)  
**Linguagem:** PL/pgSQL  
**Retorno:** TABLE (id, wa_phone, status, last_message_at, column_id, contact_name, last_message_content, last_sender_type, last_media_url, last_media_type, unread_count)  
**Escopo:** Dashboard — carrega conversas com preview da última mensagem

### Objetivo

Retornar todas as conversas ATIVAS de um kanban, enriquecidas com última mensagem e metadados de contato, com isolamento JWT de tenant.

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `p_kanban_id` | uuid | ID do kanban |

### Retorno

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID da conversa |
| `wa_phone` | text | Número WhatsApp do contato |
| `status` | text | Status (`'active'` ou `'archived'`) |
| `last_message_at` | timestamptz | Timestamp da última mensagem |
| `column_id` | uuid | ID da coluna do kanban |
| `contact_name` | text | Nome do contato |
| `last_message_content` | text | Conteúdo da última mensagem |
| `last_sender_type` | text | Tipo do remetente (`'contact'` ou `'user'`) |
| `last_media_url` | text | URL da mídia (se houver) |
| `last_media_type` | text | Tipo de mídia (`'image'`, `'video'`, etc.) |
| `unread_count` | int | Contagem de mensagens não lidas |

### Isolamento de Tenant

- Extrai `tenant_id` do JWT via: `((SELECT auth.jwt()) -> 'app_metadata' ->> 'tenant_id')::uuid`
- **NÃO** passa `p_tenant_id` como parâmetro
- Filtra: `WHERE c.tenant_id = v_tenant_id`
- ✅ Seguro contra cross-tenant data access

### Fluxo

1. Extrai `tenant_id` do JWT
2. Busca conversas ativas do kanban para esse tenant
3. Para cada conversa:
   - JOIN com `contacts` para nome
   - Subqueries para última mensagem (conteúdo, remetente, mídia)
4. Ordena por `last_message_at DESC` (mais recentes primeiro)
5. Retorna resultado para frontend renderizar board

### Performance

- ⚠️ **Aviso:** Subqueries N+1 para `messages` (última msg por conversa)
- Para boards com 100+ conversas, considerar materializar em `last_message_*` columns
- Atualmente aceitável para típico (10-30 conversas por kanban)

---

## Resumo

| Função | Tipo | Retorno | Propósito |
|--------|------|---------|-----------|
| `custom_access_token_hook()` | Auth Hook | jsonb | Enriquecer JWT |
| `rls_auto_enable()` | Event Trigger | trigger | Auto-habilitar RLS |
| `upsert_contact()` | RPC | uuid | Upsert idempotente |
| `get_conversations_with_last_message()` | RPC | TABLE | Dashboard — conversas com última msg |

