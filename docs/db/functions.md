> 📅 Extraído em: 2026-04-22
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — funções customizadas
> Status: ✅ Atualizado

# Funções Customizadas — Database Logic

**Total: 3 funções PL/pgSQL**

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

## Resumo

| Função | Tipo | Retorno | Propósito |
|--------|------|---------|-----------|
| `custom_access_token_hook()` | Auth Hook | jsonb | Enriquecer JWT |
| `rls_auto_enable()` | Event Trigger | trigger | Auto-habilitar RLS |
| `upsert_contact()` | RPC | uuid | Upsert idempotente |

