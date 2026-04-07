# Evo GO — Technical Specifications & Requirements

**Source:** https://docs.evolutionfoundation.com.br/evolution-go  
**Date:** 2026-04-06  
**Language:** Go (not Node.js)  
**Status:** ✅ PRODUCTION READY

---

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Server** | Go (Golang) | High-performance WhatsApp gateway |
| **Database** | PostgreSQL | Persistence (auth, instances, configs) |
| **ORM** | GORM | Database abstraction & migrations |
| **Message Queue** | RabbitMQ / NATS | Event distribution |
| **File Storage** | MinIO / S3 | Media files (images, videos, audio) |
| **Container** | Docker / Docker Compose | Deployment |

---

## 📊 Database Architecture

### Multiple PostgreSQL Databases

Evo GO creates **separate databases** for different concerns:

```
Database 1: evogo_auth
├─ Users
├─ Authentication
└─ Permissions

Database 2: evogo_users  
├─ User profiles
├─ Settings
└─ Preferences

Database 3: evogo_instances (implicit)
├─ WhatsApp instances
├─ Connection status
└─ Configuration

Database 4: runtime_configs
├─ License info
├─ System settings
└─ Feature flags
```

**Our Strategy:** We consolidate into single `kanban_db` with RLS policies (Supabase approach).

---

## 🔌 Webhook Events (Critical for Integration)

Evo GO emits **8 webhook event types**:

| Event | When | Payload |
|-------|------|---------|
| **QRCODE_UPDATED** | QR code generated/refreshed | QR code image, instance ID |
| **MESSAGES_UPSERT** | Message received | Phone, text, media_url, timestamp |
| **MESSAGES_UPDATE** | Message modified | Message ID, reaction, status |
| **MESSAGES_DELETE** | Message deleted | Message ID |
| **SEND_MESSAGE** | Message sent confirmation | Message ID, status |
| **CONNECTION_UPDATE** | Connection state changed | Status (connected/disconnected/error) |
| **TYPEBOT_START** | Bot workflow started | Instance ID, workflow ID |
| **TYPEBOT_CHANGE_STATUS** | Bot status changed | Instance ID, status |

### Webhook Configuration Options

```javascript
// Option 1: Global webhook (via .env)
WEBHOOK_URL=https://yourapp.com/webhooks
WEBHOOK_EVENTS=MESSAGES_UPSERT,CONNECTION_UPDATE

// Option 2: Per-instance webhook (via API)
POST /webhook/instance
{
  "url": "https://yourapp.com/webhooks",
  "webhook_by_events": true,  // separate URL per event
  "events": ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
}
```

### Webhook_by_Events Pattern

When enabled, Evo GO appends event name to webhook URL:

```
Base URL: https://yourapp.com/webhooks
QRCODE_UPDATED    → https://yourapp.com/webhooks-qrcode-updated
MESSAGES_UPSERT   → https://yourapp.com/webhooks-messages-upsert
CONNECTION_UPDATE → https://yourapp.com/webhooks-connection-update
```

---

## 🔐 Security & Authentication

### Instance Token

Each Evo GO instance has a unique **token** for:
- API authentication (X-API-Token header)
- Webhook validation (HMAC-SHA256)

### Webhook Validation

```
Signature Header: X-Signature
Algorithm: HMAC-SHA256
Secret: Instance token
```

---

## 📱 Instance Management

### Create Instance

```json
POST /instance/create
{
  "name": "main-instance",
  "integration": "WHATSAPP-BUSINESS",
  "number": "+5511987654321"
}

Response:
{
  "instanceId": "uuid-here",
  "token": "secret-token-here",
  "qrCode": "data:image/png;base64,..."
}
```

### Get Instance Status

```
GET /instance/{instanceId}

Response:
{
  "id": "uuid",
  "name": "main-instance",
  "status": "connected|disconnected|error",
  "number": "+5511987654321",
  "createdAt": "2026-04-06T10:00:00Z"
}
```

### Send Message

```json
POST /message/send
{
  "instanceId": "uuid",
  "to": "+5511987654321",
  "message": "Hello!",
  "media": {
    "type": "image|video|audio",
    "url": "https://..."
  }
}
```

---

## 💾 Data Storage

### Message Persistence

Evo GO stores in PostgreSQL:
- Full message history
- Media metadata (URL, type, size)
- Timestamps (accurate to millisecond)
- Sender identification

### Media Handling

- Media stored in **MinIO/S3** (not in database)
- Database stores **media_url** references
- Supports: images, videos, audio, documents

---

## 🚀 Installation & Setup

### Prerequisites

```bash
✅ Docker & Docker Compose
✅ PostgreSQL 12+
✅ 2GB+ RAM
✅ Stable internet connection
✅ Valid WhatsApp business account (optional for personal)
```

### Quick Start

```bash
# Clone or download docker-compose.yml from Evo GO
docker-compose up -d

# Access Evo GO API
http://localhost:3000/api
```

### Environment Variables

```env
POSTGRES_AUTH_DB=postgresql://user:pass@localhost:5432/evogo_auth
POSTGRES_USERS_DB=postgresql://user:pass@localhost:5432/evogo_users

WEBHOOK_URL=https://yourapp.com/webhooks
WEBHOOK_SECRET=your-secret-key

RABBITMQ_URL=amqp://guest:guest@localhost:5672
# OR
NATS_URL=nats://localhost:4222

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## 🔄 Message Flow

### Incoming Message (WhatsApp → Evo GO → Your App)

```
WhatsApp User sends message
    ↓
Evo GO receives (via WhatsApp Web/Business API)
    ↓
Evo GO stores in PostgreSQL
    ↓
Evo GO sends webhook: MESSAGES_UPSERT
    ↓
Your app: POST /webhooks receives event
    ↓
Your app: Insert into conversations + messages tables
    ↓
Your app: Broadcast via Supabase Real-time
    ↓
Frontend: UI updates instantly
```

### Outgoing Message (Your App → Evo GO → WhatsApp)

```
Frontend: User types message
    ↓
Frontend: POST /api/send-message
    ↓
Backend: Validate JWT + tenant_id
    ↓
Backend: Call Evo GO POST /message/send
    ↓
Evo GO: Sends to WhatsApp
    ↓
Evo GO: Webhook SEND_MESSAGE confirmation
    ↓
Backend: Insert message record
    ↓
Backend: Broadcast via Real-time
    ↓
Frontend: Message marked as sent
```

---

## 🔍 Schema Compatibility Check

| Requirement | Evo GO Needs | Our Schema Has |
|-----------|-------------|---|
| Multi-tenancy | Yes (instances) | ✅ tenants table |
| Contact storage | Yes (phone E.164) | ✅ contacts table |
| Conversation tracking | Yes (per contact) | ✅ conversations table |
| Message history | Yes (full) | ✅ messages table |
| Webhook events | Yes (8 types) | ✅ API ready |
| File references | Yes (media_url) | ✅ messages.media_url |
| User isolation | Yes (JWT token) | ✅ RLS policies |

**Verdict:** ✅ **100% COMPATIBLE**

---

## 📚 Official Documentation

**Main:** https://docs.evolutionfoundation.com.br/evolution-go  
**Installation:** https://docs.evolutionfoundation.com.br/evolution-go/installation  
**GitHub:** https://github.com/EvolutionAPI/evolution-go

---

## ⚠️ Do NOT Confuse With

**Evolution API v2** (deprecated for this project):
- Different project (Node.js, not Go)
- Docs: doc.evolution-api.com/v2
- GitHub: https://github.com/EvolutionAPI/evolution-api

---

**Last Updated:** 2026-04-06 by Aria  
**Reference:** docs.evolutionfoundation.com.br/evolution-go
