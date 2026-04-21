# Database Functions — Funções Customizadas

> 📅 Extraído em: 2026-04-21 12:30 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado (via MCP Supabase - live extraction)

## 📋 Visão Geral

**Total de Funções:** 2  
**Linguagem:** PL/pgSQL  
**Schema:** public

| # | Função | Tipo | Retorno | Linguagem | Descrição |
|---|--------|------|---------|-----------|-----------|
| 1 | `custom_access_token_hook` | FUNCTION | jsonb | PL/pgSQL | Enriquece JWT com tenant_id e role do usuário (auth hook) |
| 2 | `rls_auto_enable` | FUNCTION | event_trigger | PL/pgSQL | Event trigger que habilita RLS automaticamente em novas tabelas |

---

## 1. `custom_access_token_hook()`

**Tipo:** FUNCTION  
**Retorno:** jsonb (evento JWT enriquecido)  
**Linguagem:** PL/pgSQL  
**Propósito:** JWT enrichment hook — adiciona tenant_id e role do usuário a cada login

### Fluxo de Execução

1. **Validação:** Verifica se `sub` (user_id) existe em `event.claims`
2. **Lookup:** Busca `tenant_id` e `role` na tabela `users` usando o user_id
3. **Deep Merge:** Mescla dados no campo `app_metadata` do JWT (preserva todos os outros claims)
4. **Erro:** Qualquer falha levanta exceção → login falha (STRICT mode)

### Código Fonte

```sql
DECLARE
  user_tenant_id UUID;
  user_role TEXT;
BEGIN
  -- Extract user_id from claims
  -- STRICT: If user_id is missing, raise exception
  IF NOT (event->'claims' ? 'sub') THEN
    RAISE EXCEPTION 'custom_access_token_hook: missing user_id (sub) in claims';
  END IF;

  -- Fetch tenant_id and role from users table using user_id from JWT
  -- STRICT: If query fails (user not found, DB down, etc.) exception is raised
  BEGIN
    SELECT tenant_id, role INTO user_tenant_id, user_role
    FROM public.users
    WHERE id = (event->'claims' ->> 'sub')::uuid;

    IF user_tenant_id IS NULL THEN
      RAISE EXCEPTION 'User not found or missing tenant_id for user_id: %', event->'claims' ->> 'sub';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- STRICT mode: any error raises exception, login fails
    RAISE EXCEPTION 'custom_access_token_hook failed to fetch user data: %', SQLERRM;
  END;

  -- Deep merge: Update app_metadata within claims, preserving all other JWT fields
  event := jsonb_set(
    event,
    '{claims, app_metadata}',
    COALESCE(event->'claims'->'app_metadata', '{}'::jsonb) ||
    jsonb_build_object(
      'tenant_id', user_tenant_id::text,
      'role', user_role
    )
  );

  RETURN event;

EXCEPTION WHEN OTHERS THEN
  -- STRICT: any unhandled error raises exception
  RAISE EXCEPTION 'custom_access_token_hook fatal error: %', SQLERRM;
END;
```

### Exemplo de Saída JWT

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490,
  "app_metadata": {
    "tenant_id": "tenant-uuid",
    "role": "admin"
  }
}
```

### Segurança

- ✅ **STRICT Mode:** Qualquer erro levanta exception (falha segura)
- ✅ **User Lookup:** Busca no banco, não confia em claims do cliente
- ✅ **Deep Merge:** Não sobrescreve claims existentes, apenas `app_metadata`
- ⚠️ **Crítico:** Se user não existe no banco → login falha (proteção contra junk tokens)

### Uso

Configurado automaticamente em `auth.users.after_sign_in` (Supabase Auth event hook).

---

## 2. `rls_auto_enable()`

**Tipo:** EVENT TRIGGER  
**Retorno:** event_trigger (void)  
**Linguagem:** PL/pgSQL  
**Propósito:** Habilita RLS automaticamente em novas tabelas criadas no schema public

### Escopo

- **Ativado por:** `CREATE TABLE`, `CREATE TABLE AS`, `SELECT INTO`
- **Schema:** `public` (enforçado)
- **Excluded:** pg_catalog, information_schema, pg_toast*, pg_temp*

### Código Fonte

```sql
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public')
        AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
        AND cmd.schema_name NOT LIKE 'pg_toast%'
        AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (schema não enforçado: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;
```

### Exemplo

```sql
-- Ao executar:
CREATE TABLE public.new_table (id uuid PRIMARY KEY);

-- Resultado:
-- ✅ rls_auto_enable: enabled RLS on public.new_table
-- A tabela é criada com RLS já habilitado automaticamente
```

### Segurança

- ✅ **Fail-Safe:** Não falha se RLS já está habilitado (`IF NOT EXISTS`)
- ✅ **Logged:** Todos os eventos registrados em pg_log
- ⚠️ **Administrativo:** Apenas DBA pode criar tabelas no public schema

---

## Migrações Relacionadas

| Migration | Descrição |
|-----------|-----------|
| `20260416085155` | `create_custom_access_token_hook` — Criação inicial |
| `20260416092722` | `fix_custom_access_token_hook` — Correção de erro handling |
| `20260416093514` | `fix_rls_use_app_metadata` — Migração de user_metadata → app_metadata em todas as RLS policies |
