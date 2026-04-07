# 6. Integration Patterns — Evo GO + Supabase

⚠️ **IMPORTANT:** This document describes integration with **Evo GO** ONLY (https://docs.evolutionfoundation.com.br/evolution-go). Do NOT use Evolution API v2.

## 6.1 WhatsApp Message Receive Flow (Webhook → DB → Real-time)

```
┌─────────────────────────┐
│   Evo GO                │
│   (WhatsApp gateway)    │
└──────────┬──────────────┘
           │ POST webhook
           ▼
┌─────────────────────────────────────┐
│   /api/webhooks/messages            │
│   ├─ Validate HMAC-SHA256 signature │
│   ├─ Extract: phone, message, media │
│   └─ Parse to EvolutionMessage type │
└──────────┬────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Database Transaction               │
│   ├─ Lookup contact by wa_phone      │
│   ├─ IF NOT EXISTS → CREATE          │
│   ├─ Lookup conversation             │
│   ├─ IF NOT EXISTS → CREATE in Main  │
│   │   (kanban auto-routed)           │
│   ├─ INSERT message                  │
│   └─ UPDATE conversation.updated_at  │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   Supabase Real-time Broadcast       │
│   (WebSocket to all active clients)  │
│   ├─ Event: "INSERT" on messages     │
│   ├─ Event: "UPDATE" on conversations│
│   └─ Frontend re-renders             │
└──────────────────────────────────────┘
```

**Code example:**

```typescript
// /api/webhooks/messages
import { validateWebhookSignature } from "@/lib/api/webhook-validator";

export async function POST(req: Request) {
  const signature = req.headers.get("X-Signature");
  const body = await req.text();

  // Validate
  if (!validateWebhookSignature(body, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const { phone, message, media_url } = event.data;

  // 1. Find or create contact
  let contact = await supabase
    .from("contacts")
    .select("*")
    .eq("phone", phone)
    .single();

  if (!contact) {
    contact = await supabase
      .from("contacts")
      .insert({ phone, tenant_id })
      .single();
  }

  // 2. Find or create conversation
  let conversation = await supabase
    .from("conversations")
    .select("*")
    .eq("contact_id", contact.id)
    .single();

  if (!conversation) {
    // Auto-route to "Main" kanban
    const mainKanban = await supabase
      .from("kanbans")
      .select("*")
      .eq("is_main", true)
      .single();

    conversation = await supabase
      .from("conversations")
      .insert({
        contact_id: contact.id,
        kanban_id: mainKanban.id,
        column_id: mainKanban.columns[0].id, // First column
        wa_phone: phone,
      })
      .single();
  }

  // 3. Save message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_type: "contact",
    content: message,
    media_url,
    media_type: event.data.media_type,
  });

  // 4. Supabase Real-time broadcasts automatically
  return Response.json({ ok: true });
}
```

## 6.2 Send Message Flow (Frontend → Evolution API → DB)

```
┌──────────────────┐
│   Chat Modal     │
│   Message Input  │
└────────┬─────────┘
         │ onChange + POST
         ▼
┌────────────────────────────────┐
│   /api/messages/send           │
│   ├─ Validate JWT              │
│   ├─ Call Evolution API         │
│   │   POST /message             │
│   │   { phone, message, media } │
│   └─ Await 200 OK               │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Database INSERT              │
│   ├─ INSERT message            │
│   │   (sender_type: 'user')     │
│   └─ UPDATE last_message_at     │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   Supabase Real-time           │
│   ├─ Broadcast to subscribers  │
│   └─ Frontend updates UI        │
└────────────────────────────────┘
```

---
