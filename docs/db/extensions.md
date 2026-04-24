> 📅 Extraído em: 2026-04-24 às 00:00 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

# Extensions & Advisors

**Total: 6 extensões | 27 migrações | 0 edge functions | 5 security + 13 performance findings**

---

## Extensões Habilitadas

| # | Nome | Versão | Propósito | Status |
|---|------|--------|----------|--------|
| 1 | **pg_graphql** | 1.5.11 | GraphQL API auto-gerado | ✅ (não usado) |
| 2 | **pg_stat_statements** | 1.11 | Performance monitoring | ✅ |
| 3 | **pgcrypto** | 1.3 | Funções criptográficas | ✅ (future use) |
| 4 | **plpgsql** | 1.0 | Linguagem procedural | ✅ REQUERIDO |
| 5 | **supabase_vault** | 0.3.1 | Armazenamento de secrets | ✅ (future use) |
| 6 | **uuid-ossp** | 1.1 | Geração de UUIDs | ✅ REQUERIDO |

---

## Migrações Aplicadas (27 total)

| # | Version | Name | Status |
|---|---------|------|--------|
| 1 | 20260402025734 | create_core_schema_v3 | ✅ |
| 2 | 20260402030054 | add_rls_policies | ✅ |
| 3 | 20260403024916 | fix_users_rls_policy_to_auth_uid | ✅ |
| 4 | 20260404191826 | create_failed_registrations | ✅ |
| 5 | 20260407022056 | fix_rls_tenant_id_claim_with_cast | ✅ |
| 6 | 20260408021733 | add_kanbans_is_main_unique_constraint | ✅ |
| 7 | 20260413014555 | update_tenants_connection_status | ✅ |
| 8 | 20260413144601 | add_qr_code_to_tenants | ✅ |
| 9 | 20260413171746 | add_evolution_instance_token | ✅ |
| 10 | 20260416085155 | create_custom_access_token_hook | ✅ |
| 11 | 20260416092722 | fix_custom_access_token_hook | ✅ |
| 12 | 20260416093514 | fix_rls_use_app_metadata | ✅ |
| 13 | 20260416192121 | drop_test_user_access_view | ✅ |
| 14 | 20260416192125 | disable_rls_failed_registrations | ✅ |
| 15 | 20260416192127 | fix_users_rls_auth_uid_initplan_drop | ✅ |
| 16 | 20260416192130 | fix_users_rls_auth_uid_initplan_create | ✅ |
| 17 | 20260417020912 | expand_schema_for_evolution | ✅ |
| 18 | 20260421215046 | enhance_webhooks_schema | ✅ |
| 19 | 20260421215102 | add_unread_count_conversations | ✅ |
| 20 | 20260423134520 | add_messages_conversation_created_index | ✅ |
| 21 | 20260423143217 | add_get_conversations_with_last_message_rpc | ✅ |
| 22 | 20260423183458 | update_get_conversations_rpc_media_type | ✅ |
| 23 | 20260423230815 | update_rpc_to_use_jwt_tenant | ✅ |
| 24 | 20260424001443 | debug_jwt_hook | ✅ |
| 25 | 20260424143354 | restore_get_conversations_with_last_message_rpc | ✅ |
| **26** | **20260424155409** | **add_unique_active_conversation_index** | **✅** |
| **27** | *pendente* | *próxima migração* | — |

---

## Edge Functions

**Total: 0 edge functions**

**Recomendação:** Usar Edge Functions para webhooks e lógica de integração.

---

## Advisories — Findings

### 🔴 ERROR (1)

**RLS Disabled on `failed_registrations`** — Intencional (pré-auth logging)

### 🟡 WARNINGS (2)

1. **Function Search Path Mutable** (`upsert_contact`, `get_conversations_with_last_message`) — Adicionar `SET search_path = public;`
2. **Leaked Password Protection Disabled** — Habilitar em Auth settings

### 🔵 INFO (2)

1. **RLS Enabled No Policy** — `debug_auth_logs` tem RLS mas sem policies
2. **Unindexed ForeignKeys:** 3 (automatic_messages, conversations x2)
3. **Unused Indexes:** 14 (monitorar por 2-3 semanas)
   - failed_registrations: 3 índices
   - tenants, kanbans, contacts: 1 each
   - conversations: 6 índices
   - messages: 1 índice

---

## Checklist de Manutenção

- [ ] Aplicar fix `search_path` em `upsert_contact()`
- [ ] Habilitar leaked password protection
- [ ] Criar índices para FKs sem índices
- [ ] Monitorar performance via `pg_stat_statements`
- [ ] Revisar unused indexes em 2 semanas

