# Prompt Reutilizável — Extração e Atualização Completa do Banco de Dados

> **Como usar:** Copie o bloco abaixo e envie para o agente `@data-engineer` sempre que quiser atualizar a documentação do banco.
> Ou simplesmente diga: *"Execute o prompt em `docs/db/prompt.for.update.waterfall.picture.md`"*

---

## PROMPT PARA O @DATA-ENGINEER

```
Preciso que você extraia e atualize 100% da documentação do banco de dados Supabase
do projeto (project_ref: ujcjucgylwkjrdpsqffs) usando o MCP do Supabase.

## Objetivo

Manter os arquivos em `docs/db/` como **fonte da verdade** do banco, para que todos
os agentes AIOX possam consultá-los antes de planejar qualquer trabalho.

## Arquivos a atualizar (sobrescrever com dados atuais)

1. `docs/db/schema.md`   — documentação legível: tabelas, colunas, tipos, FKs, índices
2. `docs/db/schema.sql`  — DDL completo: CREATE TABLE, índices, sequences, enums
3. `docs/db/rls.md`      — todas as políticas RLS organizadas por tabela

## Arquivos a criar (se não existirem) ou atualizar

4. `docs/db/functions.md`   — funções customizadas no schema public
5. `docs/db/triggers.md`    — triggers em todas as tabelas
6. `docs/db/extensions.md`  — extensões habilitadas + advisors de segurança e performance

## Arquivos que NÃO devem ser alterados

- `docs/db/EVO-GO-TECHNICAL-SPECS.md`
- `docs/db/pesquisa.schema.evogo.md`
- `docs/db/prompt.for.update.waterfall.picture.md` (este arquivo)

## Passos de extração (via MCP Supabase — somente SELECT, zero DDL/DML)

Execute via `mcp__supabase__execute_sql`:

### 1. Tabelas e colunas
```sql
SELECT
  c.table_name,
  c.column_name,
  c.ordinal_position,
  c.column_default,
  c.is_nullable,
  c.data_type,
  c.character_maximum_length,
  c.udt_name,
  pgd.description AS column_comment
FROM information_schema.columns c
LEFT JOIN pg_catalog.pg_statio_all_tables st ON st.relname = c.table_name
LEFT JOIN pg_catalog.pg_description pgd
  ON pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
```

### 2. Chaves primárias e estrangeiras
```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
```

### 3. Índices
```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 4. RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;
```

### 5. Funções customizadas
```sql
SELECT
  routine_name,
  routine_type,
  data_type AS return_type,
  external_language AS language,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### 6. Triggers
```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### 7. Extensões habilitadas
```sql
SELECT name, default_version, installed_version, comment
FROM pg_available_extensions
WHERE installed_version IS NOT NULL
ORDER BY name;
```

### 8. Enums customizados
```sql
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;
```

### 9. Sequences
```sql
SELECT sequence_name, start_value, minimum_value, maximum_value, increment
FROM information_schema.sequences
WHERE sequence_schema = 'public';
```

### 10. Comentários nas tabelas
```sql
SELECT
  c.relname AS table_name,
  obj_description(c.oid) AS table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
```

Execute também via tools nativas do MCP:
- `mcp__supabase__list_migrations` → incluir em `extensions.md`
- `mcp__supabase__list_edge_functions` → incluir em `extensions.md`
- `mcp__supabase__get_advisors(type: 'security')` → incluir em `extensions.md`
- `mcp__supabase__get_advisors(type: 'performance')` → incluir em `extensions.md`

## Formato dos arquivos

Cada arquivo deve começar com:
```
> 📅 Extraído em: {data e hora atual}
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado
```

## Verificação final

Após escrever todos os arquivos, confirme:
- [ ] Quantidade de tabelas bate com schema anterior
- [ ] Quantidade de políticas RLS bate com rls.md anterior
- [ ] Arquivos protegidos não foram alterados
```

---

## Referência do Plano Original

Este prompt foi gerado a partir do plano de extração definido em 2026-04-14.

**Projeto Supabase:** `ujcjucgylwkjrdpsqffs`
**Arquivos gerenciados:** 6 (3 existentes + 3 novos)
**Método:** somente SELECT — zero risco ao banco
