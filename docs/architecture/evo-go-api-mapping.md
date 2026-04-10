# Evo GO API Mapping — Endpoint Reference

Este documento define o mapeamento técnico entre a API da **Evo GO** (https://docs.evolutionfoundation.com.br/evolution-go) e as rotas/lógica interna da nossa plataforma Kanban.

**Data:** 2026-04-10  
**Versão:** 1.0  
**Responsável:** Aria (Architect)  

---

## 📱 1. Gerenciamento de Instâncias

Mapeamento de endpoints para criação e status da conexão WhatsApp.

| Ação | Endpoint Evo GO | Nossa Rota API | Campo DB (tenants) |
| :--- | :--- | :--- | :--- |
| **Criar Instância** | `POST /instance/create` | `POST /api/settings/evo-go/create` | `evolution_instance_id` |
| **Obter QR Code** | (Incluso no `/create`) | `GET /api/settings/evo-go/qr` | - |
| **Status Conexão** | `GET /instance/{id}` | `GET /api/settings/connection-status` | `connection_status` |
| **Logout/Disconnect**| `DELETE /instance/logout/{id}` | `POST /api/settings/disconnect` | `connection_status = 'inactive'` |

---

## 💬 2. Mensagens e Conversas

Mapeamento para envio e recebimento de mensagens.

| Ação | Endpoint Evo GO | Nossa Rota API | Origen/Destino |
| :--- | :--- | :--- | :--- |
| **Enviar Texto** | `POST /message/sendText` | `POST /api/messages/send` | Chat Modal → WhatsApp |
| **Enviar Mídia** | `POST /message/sendMedia` | `POST /api/messages/send` | Chat Modal → WhatsApp |
| **Receber Msg** | (Webhook) | `POST /api/webhooks/messages` | WhatsApp → DB |

---

## 🔗 3. Eventos de Webhook (Evo GO)

Lógica de processamento de eventos síncronos.

| Evento (Payload) | Descrição | Ação no Sistema |
| :--- | :--- | :--- |
| **`MESSAGES_UPSERT`** | Nova mensagem recebida | 1. Upsert Contato<br>2. Upsert Conversa<br>3. Insert Message<br>4. Supabase Real-time Broadcast |
| **`CONNECTION_UPDATE`** | Mudança de status | Atualizar `tenants.connection_status` |
| **`QRCODE_UPDATED`** | Novo QR Code gerado | Enviar via WebSocket para a UI de Pairing |
| **`MESSAGES_UPDATE`** | Mensagem lida/reaction | Atualizar status da mensagem no DB |

---

## 🔐 4. Segurança e Validação

Todas as requisições de Webhook **DEVEM** ser validadas:

- **Algoritmo:** HMAC-SHA256
- **Header:** `X-Signature`
- **Secret:** `EVO_GO_WEBHOOK_SECRET` (Instance Token)

---

## ⚠️ Diferenças Cruciais (vs v2)

- **Case Sensitive:** Os eventos da Evo GO são em CAIXA ALTA (`MESSAGES_UPSERT` vs `messages.upsert`).
- **Authorization:** Uso de `X-API-Token` no header para chamadas REST.
- **Library:** Baseado em `whatsmeow` (Golang).

---
**Links Oficiais:**
- Documentação: `https://docs.evolutionfoundation.com.br/evolution-go`
- Servidor: `https://evogo.renatop.com.br`
