> 📅 Extraído em: 2026-04-29 (Dara — @data-engineer)
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Database Triggers

**Total: 2 triggers operacionais + 1 event trigger (rls_auto_enable)**

---

## Triggers on messages (2)

### 1. `tr_messages_status_update` (BEFORE UPDATE)

**Event:** BEFORE UPDATE on messages  
**Function:** handle_message_status_update()  
**Purpose:** Auto-update `status_updated_at` when `status` changes

```sql
TRIGGER tr_messages_status_update
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION handle_message_status_update()
```

**Logic:**
```sql
IF OLD.status IS DISTINCT FROM NEW.status THEN
  NEW.status_updated_at = now();
END IF;
RETURN NEW;
```

**Use Case:** Track quando mensagem foi marcada como delivered, read, error, etc.

---

### 2. `tr_poll_message_status` (AFTER INSERT)

**Event:** AFTER INSERT on messages  
**Function:** trigger_poll_message_status()  
**Purpose:** Trigger webhook para polling de status de msg na Evolution GO

```sql
TRIGGER tr_poll_message_status
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_poll_message_status()
```

**Flow:**
1. Lê settings: `app.supabase_project_ref`, `app.supabase_service_role_key`
2. HTTP POST para `/functions/v1/poll-message-status`
3. Body: `{ "record": {...} }`
4. Se settings ausentes → retorna silenciosamente (SAFE FALLBACK) 

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

