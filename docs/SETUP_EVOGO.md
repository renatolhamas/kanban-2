# Evo GO WhatsApp Integration Setup

## Overview

Story 3.2 implements WhatsApp pairing via Evo GO. This document explains how to configure the required environment variables.

## Required Environment Variables

### `EVO_GO_API_KEY`
- **Type:** API Key
- **Required:** Yes (for WhatsApp QR code generation)
- **Where to get:** Evo GO dashboard → API Keys section
- **Development:** Use a test/sandbox key from Evo GO
- **Production:** Use your real production API key
- **Location:** `.env.local`

Example:
```
EVO_GO_API_KEY=your_actual_evogo_api_key_here
```

### `EVO_GO_WEBHOOK_SECRET`
- **Type:** Secret string
- **Required:** Yes (for webhook validation)
- **Where to get:** Generate one or use the secret from Evo GO webhook settings
- **How to generate:** `openssl rand -base64 32`
- **Must match:** The secret you configured in Evo GO webhook settings
- **Location:** `.env.local`

Example:
```
EVO_GO_WEBHOOK_SECRET=your_webhook_secret_here
```

### `EVOGO_API_URL` (Optional)
- **Type:** URL
- **Required:** No (defaults to `https://evogo.renatop.com.br`)
- **When to use:** To point to sandbox or custom Evo GO instance
- **Location:** `.env.local`

Example:
```
EVOGO_API_URL=https://sandbox.evogo.com/api
```

## Setup Steps

### 1. Get Evo GO API Credentials
1. Sign up at [Evo GO](https://evogo.renatop.com.br/)
2. Navigate to Settings → API Keys
3. Copy your API key

### 2. Configure Webhook Secret
1. In Evo GO dashboard, go to Webhooks
2. Create or copy your webhook secret
3. Or generate one: `openssl rand -base64 32`

### 3. Update `.env.local`
```bash
# Replace these with your actual values:
EVO_GO_API_KEY=your_api_key_here
EVO_GO_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Test the Connection
```bash
npm run dev
# Navigate to /settings page
# Click "Conectar WhatsApp"
# You should see a QR code
```

## Testing Without Real Evo GO Credentials

### Option 1: Mock API (Recommended for development)

If you don't have Evo GO credentials yet, you can create a mock endpoint for development:

```typescript
// lib/api/evo-go-client.ts (during development)
export async function callEvoGoCreateInstance(tenantId: string) {
  // Development mock - remove before production!
  if (process.env.NODE_ENV === 'development' && !process.env.EVO_GO_API_KEY?.startsWith('real_')) {
    return {
      instance_id: 'mock_instance_' + Math.random().toString(36).substr(2, 9),
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      phone: '+5511999999999',
      status: 'connecting',
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }
  
  // ... rest of real implementation
}
```

### Option 2: Use Sandbox Environment
Evo GO offers a sandbox for testing. Configure:
```
EVOGO_API_URL=https://sandbox.evogo.com/api
EVO_GO_API_KEY=sandbox_test_key
```

## Webhook Configuration

### Register Your Webhook URL

In Evo GO dashboard:

1. Go to Webhooks
2. Add new webhook
3. **URL:** `https://your-domain.com/api/webhooks/evo-go?tenantId={tenantId}`
4. **Method:** POST
5. **Secret:** The value of `EVO_GO_WEBHOOK_SECRET`
6. **Events:** CONNECTION_UPDATE, QRCODE_UPDATED, MESSAGES_UPSERT

### Local Development with Tunneling

For local development, use ngrok to expose your localhost:

```bash
ngrok http 3017
```

Then register the webhook URL:
```
https://xxxxx-xxx-xxx-xxxxx.ngrok-free.app/api/webhooks/evo-go?tenantId={tenantId}
```

## Story 3.2 Endpoints

All endpoints are protected by JWT authentication + tenant isolation:

### GET `/api/settings/evo-go/status`
- Returns current connection status
- No external API calls

### POST `/api/settings/evo-go/qr`
- **Requires:** `EVO_GO_API_KEY`
- Calls Evo GO to generate QR code
- Updates tenant instance_id in database

### POST `/api/webhooks/evo-go`
- **Requires:** `EVO_GO_WEBHOOK_SECRET`
- Validates HMAC-SHA256 signature
- Processes CONNECTION_UPDATE events

### POST `/api/settings/evo-go/disconnect`
- No external API calls
- Clears instance_id from database

## Troubleshooting

### Error: "EVO_GO_API_KEY environment variable is not set"
**Solution:** Add `EVO_GO_API_KEY` to `.env.local`

### Error: "Invalid Evo GO API key" (401)
**Solution:** Check that your API key is correct in `.env.local`

### Error: "Request timeout (>5s)"
**Solution:** Check your Evo GO API URL is correct and accessible

### Webhook returning 401 (Invalid signature)
**Solution:** Ensure `EVO_GO_WEBHOOK_SECRET` matches what's configured in Evo GO

## References

- [Evo GO Documentation](https://docs.evogo.renatop.com.br/)
- [Story 3.2 Implementation](../stories/3.2.story.md)
- Story 3.1: QR Code Generation (predecessor)
- Story 3.3: QRCODE_UPDATED Event Handler
