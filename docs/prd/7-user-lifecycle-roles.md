# 7. User Lifecycle & Roles

## 7.1 Fluxo de Onboarding (MVP)

```
┌────────────────┐
│  Visit App     │
└────────┬───────┘
         │
         ▼
┌────────────────────────────┐
│  Register Page             │
│  Email + Senha             │
└────────┬───────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Backend (Auto):                    │
│  1. Criar tenant                    │
│  2. Criar usuário (OWNER)           │
│  3. Criar Kanban "Main"             │
│  4. Criar colunas padrão            │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Redirect to Config/Connection
│  (QR Code para Evolution API) │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  After QR Pairing:           │
│  Redirect to Home (Kanban)   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Ready to use!               │
│  Start managing conversations│
└──────────────────────────────┘
```

## 7.2 Modelo de Permissões (MVP)

| Entidade | Permissões | Notas |
|----------|-----------|-------|
| **Owner** | Full access (todas as features) | Criado automaticamente no Register |
| **Attendant** | RLS read/write limitado (Fase 2+) | N/A para MVP |
| **Public** | Register + Login apenas | Sem acesso a dados de nenhum tenant |

## 7.3 RLS Policies (Enforcement)

```sql
-- Policy: Users podem ver seus próprios dados (by tenant_id)
CREATE POLICY "user_tenant_isolation" ON conversations
  FOR SELECT
  USING (tenant_id = auth.jwt() -> 'tenant_id');

-- Policy: Users podem atualizar apenas conversas do seu tenant
CREATE POLICY "user_tenant_update" ON conversations
  FOR UPDATE
  USING (tenant_id = auth.jwt() -> 'tenant_id');
```

---
