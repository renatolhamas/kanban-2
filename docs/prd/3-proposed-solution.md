# 3. Proposed Solution

## 3.1 Visão do Produto

Um **Dashboard Colaborativo Kanban** que transforma a operação de WhatsApp de caótica para estruturada, permitindo que equipes **visualizem, gerenciem e automatizem** conversas com contatos em um fluxo de vendas compartilhado.

## 3.2 Pilares Técnicos

1. **Kanban Compartilhado:** Interface visual com colunas configuráveis (Novo → Qualificado → Proposta → Vendido → Arquivado)
2. **Multi-tenancy with RLS:** Separação absoluta de dados por `tenant_id`; múltiplas instâncias isoladas em um único banco
3. **Sincronização Real-time:** Webhooks da Evo GO + Supabase Real-time Subscriptions = conversas atualizadas instantaneamente
4. **Automatização de Follow-up:** Mensagens pré-cadastradas disparadas em intervalos configuráveis por kanban/etapa
5. **Gestão de Contatos Centralizada:** CRUD integrado com auto-registro ao iniciar conversa

## 3.3 Arquitetura Conceitual

```
┌─────────────────────────────────────────┐
│   Frontend (Next.js + Tailwind)         │
│  ┌──────────────────────────────────┐   │
│  │ Home (Kanban) | Settings         │   │
│  │ Chat Modal | Contacts | Kanbans  │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│   Supabase Cloud (Backend)              │
│  ┌──────────────────────────────────┐   │
│  │ Auth (JWT) | RLS Policies        │   │
│  │ Real-time Subscriptions          │   │
│  │ PostgreSQL (tenants, users, etc) │   │
│  │ Cloud Storage (mídias)           │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│   Evo GO (WhatsApp Gateway)             │
│  (Pairing via QR, Webhooks de Msgs)     │
└─────────────────────────────────────────┘
```

---
