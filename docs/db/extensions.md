> 📅 Extraído em: 2026-04-29 (Dara — @data-engineer)
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Extensions, Migrations & Advisors

**Total: 6 extensões | 33 migrações | 0 edge functions | 7 WARN + 1 ERROR + 14 INFO advisors**

---

## Extensões Habilitadas (6)

| # | Nome | Versão | Propósito | Status | Schema |
|---|------|--------|----------|--------|--------|
| 1 | **pg_net** | 0.20.0 | Async HTTP (webhooks) | ✅ USADO | public ⚠️ |
| 2 | **pg_stat_statements** | 1.11 | Performance monitoring | ✅ | — |
| 3 | **pgcrypto** | 1.3 | Criptografia (future) | ✅ | — |
| 4 | **plpgsql** | 1.0 | Linguagem procedural | ✅ REQUERIDO | — |
| 5 | **supabase_vault** | 0.3.1 | Secrets storage (future) | ✅ | — |
| 6 | **uuid-ossp** | 1.1 | UUID generation | ✅ REQUERIDO | — |

**Note:** pg_net em public schema — recomendação: mover para extensões schema se suportado

---

## Migrações Aplicadas (33 total)

Versão: 20260402 → 20260425 (24 dias)

**Fases:**
1. **Core Schema** (v1-3): Tables, constraints, indexes
2. **RLS & Auth** (v4-17): Policies, JWT hook, auth logs
3. **Evolution Integration** (v18-19): Webhook schema, contacts, conversations
4. **Message Tracking** (v20-27): Status, polling, RPC, indexes
5. **Recent** (v28-33): Fixes, message status, polling setup

| # | Version | Name | Date | Status |
|----|---------|------|------|--------|
| 1 | 20260402025734 | create_core_schema_v3 | 2026-04-02 | ✅ |
| 2 | 20260402030054 | add_rls_policies | 2026-04-02 | ✅ |
| 3-6 | 20260403-0407 | fix RLS, failed_registrations | 2026-04-03~07 | ✅ |
| 7-9 | 20260408-0413 | kanbans, tenants, evolution token | 2026-04-08~13 | ✅ |
| 10-17 | 20260416-0416 | JWT hook, RLS fixes, auth logs | 2026-04-16 | ✅ |
| 18 | 20260417020912 | expand_schema_for_evolution | 2026-04-17 | ✅ |
| 19 | 20260421215046 | enhance_webhooks_schema | 2026-04-21 | ✅ |
| 20 | 20260421215102 | add_unread_count_conversations | 2026-04-21 | ✅ |
| 21-25 | 20260423-0424 | RPC, media_type, polling | 2026-04-23~24 | ✅ |
| 26 | 20260424155409 | add_unique_active_conversation_index | 2026-04-24 | ✅ |
| 27-33 | 20260425200020+ | **message status tracking & polling** | **2026-04-25** | ✅ |

**Latest Migrations (2026-04-25):**
- 20260425200020: `add_status_to_messages`
- 20260425200024: `disable_rls_debug_auth_logs`
- 20260425221550: `add_status_tracking`
- 20260425221552: `setup_polling_webhook`
- 20260425222303: `setup_polling_webhook_safe`

---

## Edge Functions

**Total: 0 edge functions**

**Recomendação:** Usar Edge Functions para webhooks e lógica de integração.

---

## Security & Performance Advisors (22 total findings)

### 🔴 ERROR (1)

| Level | Issue | Table/Function | Remediação |
|-------|-------|----------------|-----------|
| ERROR | RLS Disabled | `failed_registrations` | Intencional (pré-auth), não exposto via API |

### 🟡 WARNINGS (7)

| Level | Issue | Affected | Severity | Remediação |
|-------|-------|----------|----------|-----------|
| WARN | Function Search Path Mutable | 4 functions | HIGH | Adicionar `SET search_path = public;` |
| WARN | SECURITY DEFINER Accessible by anon | 4 functions | MEDIUM | Revocar `EXECUTE` se não intencionado |
| WARN | SECURITY DEFINER Accessible by authenticated | 4 functions | MEDIUM | Revocar `EXECUTE` se não intencionado |
| WARN | Leaked Password Protection Disabled | Auth | LOW | Habilitar em Supabase console → Auth → Policies |
| WARN | Extension in Public Schema | pg_net | INFO | Mover para outra schema se suportado |

**Functions with issues:**
- `upsert_contact` — mutable search_path + DEFINER accessible
- `handle_message_status_update` — mutable search_path + DEFINER accessible
- `trigger_poll_message_status` — mutable search_path + DEFINER accessible
- `get_conversations_with_last_message` — mutable search_path + DEFINER accessible

### 🔵 INFO (14)

| Level | Issue | Count | Remediação | Priority |
|-------|-------|-------|-----------|----------|
| INFO | Unindexed Foreign Keys | 3 | Crear índices se queries frequentes | LOW |
| INFO | Unused Indexes | 13 | Monitorar 2-3 semanas antes de remover | LOW |

**Unindexed FKs:**
- automatic_messages.scheduled_kanban_id_fkey
- conversations.contact_id_fkey
- conversations.column_id_fkey

**Unused Indexes (14 — monitorar antes de remover):**
- failed_registrations: 3 (email, created_at, resolved_at)
- tenants: 1 (subscription)
- kanbans: 1 (main_tenant)
- contacts: 1 (phone_tenant)
- conversations: 6 (last_message, wa_phone_tenant, evolution_id, active_by_tenant)
- messages: 1 (evolution_id)

---

## Maintenance Checklist

- [ ] **SECURITY:** Apply `SET search_path = public;` to 4 functions
- [ ] **SECURITY:** Verify intentionality of DEFINER accessible functions
- [ ] **AUTH:** Enable Leaked Password Protection in Auth settings
- [ ] **PERF:** Create indexes for 3 unindexed FKs (if queries slow)
- [ ] **OPS:** Monitor unused indexes with pg_stat_statements (2-3 weeks)
- [ ] **OPS:** Review error logs in debug_auth_logs weekly
- [ ] **OPS:** Cleanup old failed_registrations (resolved_at NOT NULL) monthly

