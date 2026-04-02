# 7. Security Architecture

## 7.1 Authentication Flow (JWT + httpOnly Cookies)

```
Registration:
  Email, Name, Password (8+ chars, mixed case + number)
    ↓ POST /api/auth/register
  Supabase Auth creates user record
    ↓
  Backend creates tenant + owner user
    ↓
  Generate JWT (includes sub + tenant_id claims)
    ↓
  Set httpOnly cookie (secure flag in prod)
    ↓
  Redirect to /settings/connection

Login:
  Email, Password
    ↓ POST /api/auth/login
  Supabase Auth validates
    ↓
  Generate JWT
    ↓
  httpOnly cookie
    ↓
  Redirect to / (home)

JWT Payload:
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "owner@example.com",
  "role": "owner",
  "iat": 1234567890,
  "exp": 1234567890 + 3600  // 1 hour
}
```

## 7.2 Webhook Security (HMAC-SHA256)

Evolution API signs all webhooks with `X-Signature` header using HMAC-SHA256:

```typescript
import crypto from 'crypto';

export function validateWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
```

## 7.3 RLS Enforcement

Every row in a tenant-scoped table has `tenant_id`. Supabase RLS policies extract the authenticated user's `tenant_id` from the JWT and enforce at the database layer — **no cross-tenant data leakage possible**.

## 7.4 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

---
