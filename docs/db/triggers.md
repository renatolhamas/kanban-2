# Triggers do Banco de Dados

> 📅 **Extraído em:** 2026-04-14  
> **Fonte:** Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real  
> **Status:** ✅ Atualizado

---

## Resumo

**Triggers de tabela (`information_schema.triggers`):** Nenhum encontrado no schema `public`.

---

## Event Triggers (nível de banco)

Event triggers não aparecem em `information_schema.triggers` — operam no nível do banco de dados, não de tabelas individuais.

| Event Trigger | Função | Evento | Propósito |
|---------------|--------|--------|-----------|
| *(presumido)* | `public.rls_auto_enable` | `ddl_command_end` | Habilita RLS automaticamente em novas tabelas do schema `public` |

> Para detalhes da função `rls_auto_enable`, consulte [functions.md](functions.md).

---

## Considerações para Desenvolvimento

Como não há triggers de tabela, as seguintes operações **devem ser feitas na aplicação** ou via migration:

| Operação | Responsabilidade |
|----------|-----------------|
| Atualizar `updated_at` | Aplicação ou trigger (não existe atualmente) |
| Auditoria de mudanças | Não implementada no banco |
| Soft delete automático | Não implementada no banco |

> **Recomendação:** Se `updated_at` precisar ser atualizado automaticamente, considerar adicionar trigger com `BEFORE UPDATE` chamando uma função que seta `NEW.updated_at = now()`.
