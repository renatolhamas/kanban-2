> 📅 Extraído em: 2026-04-24T17:30:00Z
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Row Level Security (RLS) — Políticas de Isolamento

**Total: 30 políticas RLS | Padrão: Multi-tenant via JWT app_metadata.tenant_id**

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

### ⚠️ Findings da Auditoria Supabase

1. **WARN: Function Search Path Mutable** (upsert_contact)
2. **ERROR: RLS Disabled on failed_registrations** (por design)
3. **WARN: Leaked Password Protection Disabled** — Habilitar no Auth settings

