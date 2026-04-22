> 📅 Extraído em: 2026-04-22
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — triggers do banco
> Status: ✅ Atualizado

# Triggers — Automatização de Banco de Dados

**Total: 0 triggers customizados**

---

## Status Atual

Não há triggers customizados no schema `public`. 

### Triggers Disponíveis via Extensões

| Event Trigger | Tipo | Propósito | Status |
|---------------|------|----------|--------|
| `rls_auto_enable_trigger` | ddl_command_end | Habilitar RLS em novas tabelas | ✅ Habilitado |

---

## Cascata de Deletions (via FOREIGN KEY)

**Status:** ✅ Implementado via constraints

Exemplos:
- `conversations` → `messages`: CASCADE
- `automatic_messages.scheduled_kanban_id`: SET NULL

---

## Recomendações

### ✅ Keep as-is
- ForeignKey constraints com CASCADE/SET NULL
- Event trigger `rls_auto_enable`

### ⚠️ Consider Later
- Audit trail (se compliance exigir)
- Timestamps automáticos (via app layer é mais limpo)

### ❌ Evitar
- Triggers para lógica complexa
- Triggers para auditoria
- Overuse (performance hit)

---

## Performance Notes

Triggers têm overhead de 5-20ms por operação. Manter schema simples, lógica na aplicação.

