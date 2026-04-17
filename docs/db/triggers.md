# Database Triggers — Eventos e Automação

> 📅 Extraído em: 2026-04-16 17:50 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado (COMPLETO — via waterfall extraction)

## 📋 Visão Geral

**Total de Triggers:** 0  
**Schema:** public

Nenhum trigger de tabela está configurado no momento. Os comportamentos automáticos são implementados via:

1. **Column Defaults** — `created_at`, `updated_at` com `now()`
2. **Constraints** — PK, FK, UNIQUE, CHECK
3. **Event Triggers** — `rls_auto_enable()` (ver `functions.md`)
4. **Auth Hooks** — JWT enrichment (ver `functions.md`)

---

## Por que Não Triggers Tradicionais?

### Vantagens de Defaults + Constraints

| Padrão | Vantagem | Aplicação |
|--------|----------|-----------|
| **DEFAULT now()** | Sem lógica, executado no servidor | Timestamps (`created_at`, `updated_at`) |
| **FOREIGN KEY CASCADE** | Integridade garantida no PG | Limpeza automática quando pai é deletado |
| **CONSTRAINT CHECK** | Validação atômica no schema | Valores válidos (status, subscription_status) |
| **Event Trigger** | Executa no DDL (CREATE TABLE) | RLS auto-enable em novas tabelas |

### Desvantagens de Triggers de Tabela

- ❌ Complexidade: cada trigger é uma função + trigger + ligação
- ❌ Performance: executado por linha, pode ficar lento em bulk operations
- ❌ Debugging: difícil rastrear o que mudou (auditoria complexa)
- ❌ Manutenção: várias partes móveis para gerenciar

---

## Alternativa: Realtime Subscriptions (Supabase)

Para notificar aplicações de mudanças em tempo real, use Supabase Realtime:

```javascript
// Next.js exemplo
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

supabase
  .channel('public:messages')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('Mudança capturada:', payload);
    }
  )
  .subscribe();
```

---

## Auditoria de Mudanças

Se auditoria é necessária no futuro, considere:

### Opção 1: Trigger de Auditoria (Simples)

```sql
CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL, -- INSERT, UPDATE, DELETE
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TRIGGER audit_messages AFTER INSERT OR UPDATE OR DELETE ON messages
FOR EACH ROW
EXECUTE FUNCTION audit_trigger_func();
```

### Opção 2: `updated_at` Automático via Trigger

```sql
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

**Status Atual:** Não implementado (usar defaults manuais ou fazer UPDATE com `now()` na aplicação).

---

## Event Triggers Existentes

Veja `functions.md` para:
- `rls_auto_enable()` — Habilita RLS em novas tabelas públicas automaticamente

---

## Recomendações

✅ **Manter** — Defaults + Constraints é suficiente para este projeto  
📋 **Considerar** — Auditoria se compliance for necessário (SOC 2, GDPR)  
⚠️ **Evitar** — Triggers complexos até haver necessidade clara
