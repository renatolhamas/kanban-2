# 5. Backend Architecture — API Routes & Middleware

## 5.1 Middleware Stack

All `/api/*` routes are protected by:

1. **`auth.ts`** — Verify JWT in cookie; extract `sub` (user ID) and `tenant_id` claims
2. **`tenant-isolation.ts`** — Ensure `req.tenant_id` is set from JWT; block if missing
3. **`error-handler.ts`** — Catch all errors; return `{ error: string, statusCode: number }`

```typescript
// /api/conversations/route.ts (example)
import { auth } from "@/lib/middleware/auth";
import { tenantIsolation } from "@/lib/middleware/tenant-isolation";

export async function GET(req: Request) {
  // Run middleware
  const user = await auth(req);
  const { tenantId } = await tenantIsolation(req, user);

  // Query database with tenant isolation
  const conversations = await supabase
    .from("conversations")
    .select("*")
    .eq("tenant_id", tenantId);

  return Response.json(conversations);
}
```

## 5.2 API Route Groups

### **Auth Routes** (`/api/auth/*`)

- `POST /api/auth/register` — Create tenant + user + "Main" kanban + columns
- `POST /api/auth/login` — Validate email/password; return JWT (httpOnly cookie)
- `POST /api/auth/logout` — Destroy session
- `POST /api/auth/refresh` — Refresh expired JWT
- `GET /api/auth/me` — Return current user & tenant info

### **Conversations** (`/api/conversations/*`)

- `GET /api/conversations` — List conversations for tenant (paginated)
- `GET /api/conversations/[id]` — Get single conversation
- `PATCH /api/conversations/[id]/column` — Move conversation to column (drag-drop)
- `PATCH /api/conversations/[id]/archive` — Archive conversation
- `DELETE /api/conversations/[id]` — Hard delete

### **Messages** (`/api/messages/*`)

- `POST /api/messages/send` — Send message via Evo GO + save to DB
- `GET /api/messages?conversation_id=...` — Get message history (paginated, newest first)
- `POST /api/messages/send-automatic` — Send automatic message template

### **Contacts** (`/api/contacts/*`)

- `GET /api/contacts` — List contacts (paginated)
- `POST /api/contacts` — Create contact
- `PATCH /api/contacts/[id]` — Update contact
- `DELETE /api/contacts/[id]` — Delete contact

### **Kanbans** (`/api/kanbans/*`)

- `GET /api/kanbans` — List all kanbans for tenant
- `POST /api/kanbans` — Create kanban (auto-create columns)
- `PATCH /api/kanbans/[id]` — Update kanban name/order
- `PATCH /api/kanbans/[id]/main` — Set as "Main" kanban
- `DELETE /api/kanbans/[id]` — Delete kanban (if not in use)

### **Automatic Messages** (`/api/automatic-messages/*`)

- `GET /api/automatic-messages` — List templates
- `POST /api/automatic-messages` — Create template
- `PATCH /api/automatic-messages/[id]` — Update template
- `DELETE /api/automatic-messages/[id]` — Delete template
- `POST /api/automatic-messages/[id]/test` — Send test message

### **Settings** (`/api/settings/*`)

- `PATCH /api/settings/profile` — Update user name/password
- `GET /api/settings/connection-status` — Evo GO connection status
- `POST /api/settings/qr-code` — Generate new QR code from Evo GO
- `POST /api/settings/reconnect` — Force reconnect to WhatsApp

### **Webhooks** (`/api/webhooks/*`)

- `POST /api/webhooks/messages` — Evo GO webhook for new messages
- `POST /api/webhooks/connection` — Evo GO webhook for connection status changes

---

> [!CAUTION]
> **Technical Specs:** Any implementation involving **Evo GO** must strictly follow [EVO-GO-TECHNICAL-SPECS.md](file:///c:/git/kanban.2/docs/db/EVO-GO-TECHNICAL-SPECS.md) for endpoint and webhook payloads. Do NOT use Evolution API v2 documentation.

---
