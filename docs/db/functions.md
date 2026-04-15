# Funções do Banco de Dados

> 📅 **Extraído em:** 2026-04-14  
> **Fonte:** Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real  
> **Status:** ✅ Atualizado

---

## Resumo

| # | Função | Tipo | Linguagem | Retorno |
|---|--------|------|-----------|---------|
| 1 | `rls_auto_enable` | FUNCTION | PLPGSQL | event_trigger |

---

## `rls_auto_enable`

**Tipo:** Event Trigger Function  
**Linguagem:** PL/pgSQL  
**Retorno:** `event_trigger`

**Propósito:** Habilita automaticamente Row Level Security (RLS) em qualquer nova tabela criada no schema `public`. Garante que nenhuma tabela fique sem RLS por esquecimento.

**Ativado por:** Event trigger DDL em comandos `CREATE TABLE`, `CREATE TABLE AS`, `SELECT INTO`

**Lógica:**
1. Captura eventos DDL de criação de tabela via `pg_event_trigger_ddl_commands()`
2. Filtra apenas tabelas no schema `public`
3. Executa `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` automaticamente
4. Registra log de sucesso ou falha

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
        RAISE LOG 'rls_auto_enable: skip % (schema: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;
```

---

## Enums Customizados

Nenhum enum customizado encontrado no schema `public`.

---

## Triggers

Nenhum trigger encontrado no schema `public`.

> Nota: A função `rls_auto_enable` é invocada por um **event trigger** (nível de banco, não de tabela). Event triggers não aparecem em `information_schema.triggers`.
