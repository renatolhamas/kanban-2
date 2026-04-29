> 📅 Extraído em: 2026-04-29 (Dara — @data-engineer)
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Row-Level Security (RLS) Policies

**Total: 31 políticas RLS | Padrão: Multi-tenant via JWT app_metadata.tenant_id | 8 tabelas com RLS | 2 sem RLS (internas)**

---

## Estratégia de Isolamento

### Padrão: Multi-Tenant Isolation

Todas as tabelas (exceto `users`) usam **tenant_id baseado em JWT** para isolamento:

```sql
-- JWT app_metadata contém:
{
  "tenant_id": "uuid-do-tenant",
  "role": "admin|user"
}
```

### Exceção: Tabela `users`

A tabela `users` usa **auth.uid()** porque precisa ser inserida ANTES do user estar autenticado.

### 9. **failed_registrations** — ⚠️ SEM RLS

Esta tabela **NÃO tem RLS** porque salva erros ANTES do usuário estar autenticado.

---

## Resumo de Segurança

| Tabela | Isolamento | Policies | Status |
|--------|-----------|----------|--------|
| automatic_messages | tenant_id | 4 | ✅ OK |
| columns | kanban.tenant_id | 4 | ✅ OK |
| contacts | tenant_id | 4 | ✅ OK |
| conversations | tenant_id | 4 | ✅ OK |
| kanbans | tenant_id | 4 | ✅ OK |
| messages | conversation.tenant_id | 4 | ✅ OK |
| tenants | id (próprio) | 3 | ✅ OK |
| users | auth.uid() (próprio) | 4 | ✅ OK |
| failed_registrations | NONE | 0 | ⚠️ Sem RLS (por design) |

---

## Verificação de Segurança

### ✅ Implementado

- [x] Isolamento multi-tenant via JWT app_metadata.tenant_id
- [x] Todas as queries SELECT verificam tenant_id
- [x] Todas as queries INSERT verificam tenant_id no WITH CHECK
- [x] Todas as queries UPDATE verificam tenant_id
- [x] Todas as queries DELETE verificam tenant_id
- [x] Isolamento de usuário via auth.uid() na tabela users

### ⚠️ Security Advisors Findings

**🔴 ERROR (1):**
- RLS Disabled on `failed_registrations` (intencional — tabela pré-autenticação)
- RLS Disabled on `debug_auth_logs` (intencional — logs internos, não exposto via API)

**🟡 WARNINGS (7):**
1. Function Search Path Mutable (4 functions) — Adicionar `SET search_path = public;`
   - `upsert_contact`, `handle_message_status_update`, `trigger_poll_message_status`, `get_conversations_with_last_message`
2. SECURITY DEFINER Accessible by anon/authenticated (4 functions) — Revocar se não intencionado
3. Leaked Password Protection Disabled — Habilitar em Auth settings (Supabase console)
4. pg_net extension in public schema — Mover para outra schema se possível

**🔵 INFO (14):**
- Unindexed foreign keys (3) — Performance advisor, não crítico
- Unused indexes (13) — Monitorar antes de remover

