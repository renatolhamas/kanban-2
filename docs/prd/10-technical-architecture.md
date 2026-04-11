# 10. Technical Architecture

## 10.1 Stack Tecnológico

| Camada               | Tecnologia                                    | Justificativa                                            |
| -------------------- | --------------------------------------------- | -------------------------------------------------------- |
| **Frontend**         | Next.js 14+                                   | SSR, Vercel deployment, Tailwind CSS nativo              |
| **Design System**    | "Architectural Ledger" (Tailwind + shadcn/ui) | Ver [Seção 4: UI/UX Considerations](./4-ui-ux-considerations.md) |
| **Backend & DB**     | Supabase Cloud (PostgreSQL)                   | RLS nativo, Auth integrada, Real-time, SaaS sem ops      |
| **Auth**             | Supabase Cloud Auth                           | JWT, OAuth-ready (Fase 2+), MFA (Fase 2+)                |
| **Real-time**        | Supabase Real-time Subscriptions              | WebSocket para sync instantâneo                          |
| **File Storage**     | Supabase Cloud Storage                        | Mídias de conversa (fotos, vídeos, áudios)               |
| **WhatsApp Gateway** | **Evo GO** (https://docs.evolutionfoundation.com.br/evolution-go) | Pairing via QR, webhooks bidirecional, suporte completo |
| **API Framework**    | Next.js API Routes (/app/api/)                | Auth middleware, CORS, RateLimit, Webhook validation     |
| **Rate Limiting**    | Redis local (VPS)                             | 100 req/min per tenant, zero cost                        |
| **Deployment**       | Vercel (Frontend) + Supabase Cloud            | Global CDN, auto-scaling, managed DB                     |
| **Monitoring**       | Sentry + Supabase Logs                        | Error tracking, performance APM                          |

## 10.2 Database Schema (Resumido)

```sql
-- Tenants (Multi-tenancy root)
table tenants {
  id UUID primary key
  name TEXT
  subscription_status ENUM (active, paused, cancelled)
  created_at TIMESTAMP
}

-- Users (Owners + Attendants)
table users {
  id UUID primary key
  tenant_id UUID (fk -> tenants)
  email TEXT unique
  role ENUM (owner, attendant)
  name TEXT
  password_hash TEXT
  created_at TIMESTAMP
}

-- Kanbans (Pipelines)
table kanbans {
  id UUID primary key
  tenant_id UUID (fk -> tenants)
  name TEXT
  is_main BOOLEAN (apenas 1 por tenant)
  order INT
  created_at TIMESTAMP
}

-- Columns (Etapas do Kanban)
table columns {
  id UUID primary key
  kanban_id UUID (fk -> kanbans)
  name TEXT
  order INT
  created_at TIMESTAMP
}

-- Conversations (Chats com WhatsApp)
table conversations {
  id UUID primary key
  tenant_id UUID (fk -> tenants)
  contact_id UUID (fk -> contacts)
  kanban_id UUID (fk -> kanbans)
  column_id UUID (fk -> columns)
  wa_phone TEXT (WhatsApp number)
  status ENUM (active, archived)
  last_message_at TIMESTAMP
  created_at TIMESTAMP
}

-- Messages (Histórico)
table messages {
  id UUID primary key
  conversation_id UUID (fk -> conversations)
  sender_type ENUM (user, contact)
  content TEXT
  media_url TEXT (NULL se sem mídia)
  media_type ENUM (image, video, audio, NULL)
  created_at TIMESTAMP
}

-- Contacts (Catálogo de pessoas)
table contacts {
  id UUID primary key
  tenant_id UUID (fk -> tenants)
  name TEXT
  phone TEXT (E.164 format: +5511987654321)
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

-- Automatic Messages (Templates)
table automatic_messages {
  id UUID primary key
  tenant_id UUID (fk -> tenants)
  name TEXT
  message TEXT
  scheduled_interval INT (minutos, NULL = manual only)
  scheduled_kanban_id UUID (opcional)
  created_at TIMESTAMP
}

-- RLS Policies (sketch)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sees_tenant_conversations" ON conversations
  FOR SELECT USING (tenant_id = auth.jwt() -> 'tenant_id');
```

## 10.3 Evo GO Integration

⚠️ **IMPORTANTE:** Usamos **Evo GO** (https://docs.evolutionfoundation.com.br/evolution-go), não Evo GO.

📌 **Referência Técnica:** Consulte `docs/db/EVO-GO-TECHNICAL-SPECS.md` para especificações completas do Evo GO, webhook events, e arquitetura de banco de dados.

**Servidor:** `https://evogo.renatop.com.br`

**Fluxo de Pairing (Evo GO):**

1. Owner clica "Connect WhatsApp" em Settings/Connection
2. Backend gera novo QR via Evo GO `/qr-code` endpoint
3. Frontend mostra QR code em modal (tempo limitado, ex 60s)
4. Owner scaneia com WhatsApp pessoal
5. Evo GO notifica backend via webhook `connection.update`
6. Backend marca tenant como `connection_status = active`
7. Webhooks começam a chegar em `/webhooks/evo-go/messages`

**Fluxo de Mensagens Recebidas (Evo GO):**

```
Evo GO webhook → Backend /api/webhooks/evo-go/messages (Node.js application layer)
  ├─ Validar assinatura HMAC-SHA256 (Evo GO)
  ├─ Extrair: wa_phone, message_text, media_url (se houver)
  ├─ Lookup contact ou auto-criar
  ├─ Lookup/crear conversation
  ├─ Insert message no DB
  ├─ Broadcast via Supabase Real-time Subscriptions (WebSocket)
  └─ Frontend atualiza UI instantaneamente
```

**IMPORTANTE:** Todos os passos (validação, lookup, criação) executam em Node.js **application-layer**, NÃO em PostgreSQL Triggers ou Edge Functions. Padrão: `app/api/auth/register/route.ts` (STEP 4-5) serve como modelo de orquestração multi-step com rollback automático.

**Fluxo de Mensagens Enviadas (via Evo GO):**

```
Frontend (Chat modal) → POST /api/send-message
  ├─ Validar JWT + tenant_id
  ├─ Chamar Evo GO `/send-message` endpoint
  ├─ Insert message em `messages` table
  ├─ Broadcast via Real-time
  └─ Retornar status (success/error)
```

## 10.4 Validações & Constraints

| Validação          | Local                                            | Nível    |
| ------------------ | ------------------------------------------------ | -------- |
| Telefone E.164     | Frontend regex + Backend constraint              | STRICT   |
| Email unique       | Backend constraint + Frontend check              | STRICT   |
| RLS tenant_id      | Database policy                                  | CRITICAL |
| JWT validity       | Backend middleware                               | CRITICAL |
| Webhook signature  | Backend HMAC validation                          | CRITICAL |
| Webhook processing | Backend async (return 200 OK <200ms, timeout 5s) | CRITICAL |
| File size (mídia)  | Frontend + Backend (max 50MB)                    | MEDIUM   |
| Rate limiting      | Redis local (VPS) — 100 req/min per tenant       | MEDIUM   |

---
