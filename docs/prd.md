---
> 📋 **DOCUMENTO SHARDADO**
>
> Este PRD foi shardado em **2026-04-01** por **Aria (@architect)** para facilitar navegação modular.
>
> **Versão shardada disponível em:** [`docs/prd/`](./prd/) (19 seções em arquivos separados)
>
> **Consulte os shards para leitura — este arquivo é mantido como referência histórica e fonte de verdade.**

---

# Product Requirements Document (PRD)

## WhatsApp Kanban System - Collaborative Conversation Management Platform

**Document Version:** 1.0  
**Status:** APPROVED FOR IMPLEMENTATION  
**Created:** 2026-04-01  
**Last Updated:** 2026-04-01  
**Product Manager:** Morgan (PM Agent - AIOX)  
**Next Phase:** Epic Creation & Story Development (Delegated to @sm)

---

## 1. Executive Summary

O **WhatsApp Kanban System** é uma plataforma SaaS multi-tenant que revoluciona o gerenciamento de conversas de atendimento ao cliente via WhatsApp. O produto permite que equipes de atendimento gerenciem colaborativamente fluxos de venda através de uma interface **Kanban visual**, integrando sincronização em tempo real com **Evo GO** (https://docs.evolutionfoundation.com.br/evolution-go) e garantindo isolamento total de dados via **Supabase Cloud RLS**.

⚠️ **Nota:** Este documento refere-se a **Evo GO**, não Evolution API v2. Consulte `docs/db/EVO-GO-TECHNICAL-SPECS.md` para especificações técnicas completas.

**Posicionamento:** Solução lightweight, intuitiva e colaborativa — alternativa simplificada a sistemas CRM complexos, focada especificamente em equipes que operacionalizam vendas/suporte via WhatsApp.

**Modelo Comercial:** SaaS subscription mensal, pricing por tenant (Owner). MVP direcionado para PMEs brasileiras (faixa 2-20 atendentes por tenant).

**Horizonte:** MVP (Single-User) → Fase 2 (Multi-User) → Fase 3+ (IA, integrações, analytics).

---

## 2. Problem Statement

### 2.1 O Problema Central

O gerenciamento de WhatsApp em equipes sofre com **falta de sincronia operacional** crítica:

| Sintoma                                | Impacto                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **"Um número, uma pessoa"**            | Impossível atribuição dinâmica de conversas; desalinhamento sobre quem está atendendo             |
| **Ausência de pipeline compartilhada** | Leads duplicados, respostas esquecidas, falta de clareza sobre qual etapa da venda o contato está |
| **Sem visibilidade centralizada**      | Managers não conseguem supervisionar produtividade; churn de vendas não é rastreável              |
| **Follow-ups manuais**                 | Alto custo operacional, inconsistência, oportunidades perdidas por falta de automação             |
| **Sem histórico estruturado**          | Conhecimento corporativo disperso em conversas privadas (nem sempre documentadas)                 |

### 2.2 Estado Atual do Mercado

- **Soluções complexas (HubSpot, Pipedrive, etc.):** Caras, over-engineered para PMEs, curva de aprendizado steep
- **WhatsApp Business API nativo:** Funcionalidades básicas, sem interface operacional intuitiva
- **Gaps de mercado:** Inexistência de solução Kanban-first, collaborative e com webhook real-time para Evolution API

### 2.3 Por Que Agora?

1. **Demanda latente:** COVID acelerou atendimento digital; crescimento de marketplaces + WhatsApp como canal #1
2. **Tecnologia madura:** Evolution API v2 estável, Supabase com RLS pronto para produção, Real-time Subscriptions consolidadas
3. **Timing de mercado:** Competidores focos em CRM genérico (não Kanban-first); oportunidade blue ocean

---

## 3. Proposed Solution

### 3.1 Visão do Produto

Um **Dashboard Colaborativo Kanban** que transforma a operação de WhatsApp de caótica para estruturada, permitindo que equipes **visualizem, gerenciem e automatizem** conversas com contatos em um fluxo de vendas compartilhado.

### 3.2 Pilares Técnicos

1. **Kanban Compartilhado:** Interface visual com colunas configuráveis (Novo → Qualificado → Proposta → Vendido → Arquivado)
2. **Multi-tenancy with RLS:** Separação absoluta de dados por `tenant_id`; múltiplas instâncias isoladas em um único banco
3. **Sincronização Real-time:** Webhooks da Evolution API + Supabase Real-time Subscriptions = conversas atualizadas instantaneamente
4. **Automatização de Follow-up:** Mensagens pré-cadastradas disparadas em intervalos configuráveis por kanban/etapa
5. **Gestão de Contatos Centralizada:** CRUD integrado com auto-registro ao iniciar conversa

### 3.3 Arquitetura Conceitual

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
│   Evolution API v2 (WhatsApp Gateway)   │
│  (Pairing via QR, Webhooks de Msgs)     │
└─────────────────────────────────────────┘
```

---

## 4. Target Users & Personas

### 4.1 Persona Primária: Owner (Dono/Gerente)

| Atributo          | Detalhe                                                              |
| ----------------- | -------------------------------------------------------------------- |
| **Título**        | Dono do negócio, Gerente de vendas                                   |
| **Idade**         | 28-55 anos                                                           |
| **Setor**         | E-commerce, Imóveis, Consultoria, Agências                           |
| **Pain Points**   | Falta de controle sobre pipeline; leads perdidos; equipe desalinhada |
| **Necessidades**  | Dashboard centralizado, automação, produtividade visível             |
| **Comportamento** | Busca soluções prontas, não quer complexidade; quer ROI rápido       |

**Fluxo Típico:**

1. Cadastra-se no sistema (Email + Senha)
2. Conecta Evolution API (QR Code)
3. Cria Kanbans (colunas do fluxo de vendas)
4. Monitora conversas em tempo real via Kanban
5. Visualiza performance de cada atendente (roadmap Fase 2)

### 4.2 Persona Secundária: Attendant (Atendente)

| Atributo          | Detalhe                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| **Título**        | Atendente, SDR, Vendedor                                                      |
| **Idade**         | 20-45 anos                                                                    |
| **Pain Points**   | Conversa perdida, falta de contexto, desorganização                           |
| **Necessidades**  | Interface simples, saber em qual etapa está o cliente, automação de follow-up |
| **Comportamento** | Usa sistema como ferramenta diária; quer feedback visual                      |

**Fluxo Típico (Fase 2+):**

1. Faz login (credenciais do Owner)
2. Vê Kanban com conversas atribuídas
3. Movimenta conversas entre colunas conforme progresso
4. Envia mensagens + mídias via modal Chat
5. Usa Automatic Messages para follow-up padronizado

---

## 5. Goals & Success Metrics

### 5.1 Objetivos de Negócio (SMART)

| Meta                            | Descrição                                                                                                  | Timeline           | KPI                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------- |
| **OKR 1: Triagem Ativa 100%**   | Garantir que TODAS as conversas novas sejam triadas (movidas para etapa adequada ou arquivadas) em até 24h | 30 dias após MVP   | % de conversas triadas / 24h ≥ 95%            |
| **OKR 2: Redução de Lead Time** | Reduzir tempo médio de permanência na primeira etapa em 30% através de alertas visuais/automação           | 60 dias pós-launch | Dias em "Novo" reduzidos de X para 0.7X       |
| **OKR 3: Follow-up Automático** | Aumentar % de contatos que recebem follow-up personalizado em 50%                                          | 45 dias pós-launch | % de conversas com follow-up automático ≥ 50% |

### 5.2 Métricas de Produto (North Star)

- **DAU (Daily Active Users):** Crescimento from 0 → 100+ tenants em 90 dias
- **Engagement:** % de conversas interagidas/dia > 60%
- **Retenção:** MRR churn < 5%
- **Satisfação:** NPS > 50

### 5.3 Métricas de Qualidade

- **Performance:** Latência de webhook < 2s
- **Uptime:** SLA ≥ 99.5%
- **RLS Enforcement:** 0 vazamentos de dados inter-tenant
- **Automação:** Mensagens agendadas disparadas com ≤ 1min de desvio

---

## 6. MVP Scope (Fase 1: Single-User, Multi-tenant Ready)

### 6.1 Filosofia do MVP

- **Foco:** Um usuário por tenant (Owner) com arquitetura preparada para multi-user
- **Abordagem:** Operacional E2E (Register → Config → Chat → Automação)
- **Qualidade:** Production-ready, não MVP "hacky"
- **Timeline:** 8-12 semanas (estimativa)

### 6.2 Feature Set (Must-Haves)

#### 🔐 **Autenticação & Onboarding**

| Feature                | Descrição                                          | Aceitação                                             |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **Register Page**      | Cadastro de Owner com Email, Senha, Setup inicial  | Email validado, tenant criado automaticamente         |
| **Login Page**         | Autenticação via Supabase Cloud Auth com RLS ativo | JWT válido, usuário redirecionado para Home ou Config |
| **Row Level Security** | Políticas RLS por `tenant_id`                      | Nenhum vazamento inter-tenant em testes               |
| **Profile Page**       | Editar Nome, Senha do usuário logado               | Mudanças persistidas, validação de força de senha     |

#### 📋 **Gestão de Kanbans (Funis/Pipelines)**

| Feature                | Descrição                                                | Aceitação                                            |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| **CRUD de Kanbans**    | Criar, ler, atualizar, deletar pipelines com reordenação | Tabela em Settings com botões ↑↓ para reorder        |
| **Kanban "Main"**      | Radio button — apenas UM kanban pode ser "Main"          | Novas conversas roteadas automaticamente para "Main" |
| **Criação Automática** | Kanban "Main" criado no onboarding                       | Owner não precisa criar manualmente                  |
| **Ordem Customizável** | Reordenar kanbans em Settings                            | Botões ↑↓ para reorder; persistência no DB           |

#### 💬 **Visualização Kanban (Home Page)**

| Feature               | Descrição                                                              | Aceitação                            |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| **Kanban Board**      | Layout visual com colunas (Novo, Qualificado, etc.)                    | Colunas renderizam com conversas     |
| **Cards de Conversa** | Cada conversa é um "post-it" com ID de contato + preview de última msg | Clicável para abrir modal Chat       |
| **Drag-and-drop**     | Mover conversas entre colunas do mesmo Kanban                          | Posição persistida no DB             |
| **Seletor de Kanban** | Dropdown/tab para alternar entre diferentes Kanbans                    | Apenas um Kanban visualizado por vez |
| **Filtros**           | Toggle "Conversas Ativas" vs "Arquivadas"                              | Filtragem client-side ou server-side |

#### 💬 **Modal de Conversa (Chat)**

| Feature                   | Descrição                                                 | Aceitação                                                  |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| **Chat Bidimensional**    | Histórico de mensagens (sent/received) com timestamp      | Scroll infinito ou paginação                               |
| **Envio de Mensagens**    | Texto simples e mídia (fotos, vídeos, áudios)             | Validação de tipo de arquivo, upload para Supabase Storage |
| **Recebimento Real-time** | Webhooks da Evolution API v2 + Real-time Subscriptions    | Mensagens aparecem em < 2s                                 |
| **Seletor Kanban/Coluna** | Dropdown para transferir conversa entre Kanbans e colunas | Formato: "Kanban - Coluna" alfabético                      |
| **Automatic Messages**    | Botão para selecionar e enviar mensagens pré-cadastradas  | Mensagem enviada imediatamente                             |
| **Arquivar Conversa**     | Botão para encerrar/retirar de visualização ativa         | Status "archived" no DB, removido de Home                  |

#### 👥 **Gestão de Contatos**

| Feature                  | Descrição                                                           | Aceitação                                         |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------- |
| **Página Contacts**      | Tabela com colunas "Name", "Phone Number", "Actions"                | Paginação para 100+ contatos                      |
| **CRUD Completo**        | Criar, ler, atualizar, deletar contatos                             | Sem contactos duplicados (validação por telefone) |
| **Validação Telefone**   | Formato internacional com "+" (E.164: +5511987654321)               | Regex stricto, erro claro se inválido             |
| **Modal Create Contact** | Form com Name, Number; validação inline                             | Salva em `contacts` table                         |
| **Modal Edit Contact**   | Mesmos fields; validação idêntica                                   | Update sem criar duplicata                        |
| **Auto-registro**        | Contato gravado automaticamente ao receber primeira msg de WhatsApp | Se não existe, criar; se existe, update timestamp |

#### 🔧 **Página de Configurações**

**Profile Subsection:**

- [ ] Formulário para alterar Nome e Senha do Owner
- [ ] Validação de força de senha (min. 8 chars, mix de maiúsc/minúsc/número)
- [ ] Botão "Save" com feedback de sucesso/erro

**Connection Subsection:**

- [ ] Modal QR Code para pairing com WhatsApp (Evolution API v2)
- [ ] Status de conexão (Conectado / Desconectado)
- [ ] Botão "Reconectar" para gerar novo QR
- [ ] Validação de webhook da Evolution API (confirmação de entrega)

**Automatic Messages Subsection:**

- [ ] Tabela com colunas "Name", "Message Preview", "Actions"
- [ ] Modal "Create Message" com fields Name e Message
- [ ] Modal "Edit Message" idêntico
- [ ] Botão "Delete" com confirmação
- [ ] Configuração de agendamento (intervalo, Kanban, coluna) — **Fase 1.5 (post-MVP)**
- [ ] Teste de envio manual

**Kanbans Subsection:**

- [ ] Tabela com colunas "Name", "Main" (radio), "Order", "Actions"
- [ ] Modal "Create Kanban" com Name, Order (numeração)
- [ ] Modal "Edit Kanban" idêntico
- [ ] Botão "Delete" com confirmação (validar se em uso)
- [ ] Radio "Main" com validação (apenas 1 selecionável)
- [ ] Botões "Antes"/"Depois" para reordenação intuitiva

#### 🎨 **UI/UX Geral**

| Componente         | Descrição                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| **Header**         | Logo, título da página, ícone de usuário (canto superior direito)           |
| **User Icon Menu** | Dropdown com "Profile", "Logout"                                            |
| **Logout Button**  | Botão vermelho com "X", destroi sessão JWT                                  |
| **Sidebar/Nav**    | Links para Home, Contacts, Settings (subdivisions)                          |
| **Design System**  | Tailwind CSS com cores corporativas (primária, secundária, success, danger) |
| **Responsividade** | Desktop-first MVP; mobile responsiveness **Fase 2+**                        |
| **Acessibilidade** | Alt text em imagens, labels em inputs, contraste WCAG AA                    |

### 6.3 Out of Scope (Será Roadmap)

❌ **Fase 2+:**

- Multi-user (Attendants) com RLS granular
- Notificações sonoras / push
- Dashboards de performance por atendente
- Magic Link / Login Social
- Múltiplas instâncias da Evolution API por Tenant
- Notas internas em cards
- IA (resumo de conversas, sugestão de respostas)
- Integrações externas (Zapier, Make)

---

## 7. User Lifecycle & Roles

### 7.1 Fluxo de Onboarding (MVP)

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

### 7.2 Modelo de Permissões (MVP)

| Entidade      | Permissões                        | Notas                               |
| ------------- | --------------------------------- | ----------------------------------- |
| **Owner**     | Full access (todas as features)   | Criado automaticamente no Register  |
| **Attendant** | RLS read/write limitado (Fase 2+) | N/A para MVP                        |
| **Public**    | Register + Login apenas           | Sem acesso a dados de nenhum tenant |

### 7.3 RLS Policies (Enforcement)

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

## 8. Post-MVP Vision (Roadmap)

### Fase 2: Multi-User & Collaboration (3-6 meses)

- [ ] Team Management: Owner cria usuários Attendant
- [ ] Granular RLS: Attendants veem apenas conversas atribuídas
- [ ] Atribuição de Conversa: Owner assign conversa para atendente
- [ ] Performance Dashboard: Métricas por atendente (msgs/dia, lead time, etc.)
- [ ] Notificações Sonoras: Alert quando conversa chega em "Novo"
- [ ] Email Service: Mailgun (5k/mês free tier) para notificações e follow-ups
- [ ] Mobile App: iOS + Android nativo (ou React Native)

### Fase 3: Intelligence & Automation (6-12 meses)

- [ ] IA Resumo: Claude API para resumir conversa automaticamente
- [ ] Sugestão de Resposta: IA propõe respostas baseado no histórico
- [ ] Agendamento Inteligente: Automatic Messages com delays dinâmicos
- [ ] Integração com Dados Externos: CRM sync, enrichment de contato

### Fase 4: Ecosystem (12+ meses)

- [ ] Webhooks de Saída: Triggar eventos em ferramentas externas (Zapier, Make)
- [ ] Marktplace de Templates: Kanban templates pré-prontos por setor
- [ ] Multi-Tenant Billing: Stripe integration, invoicing automático
- [ ] White-label: Rebrand para empresas integradoras

---

## 9. Technical Architecture

### 9.1 Stack Tecnológico

| Camada               | Tecnologia                                    | Justificativa                                            |
| -------------------- | --------------------------------------------- | -------------------------------------------------------- |
| **Frontend**         | Next.js 14+                                   | SSR, Vercel deployment, Tailwind CSS nativo              |
| **Design System**    | "Architectural Ledger" (Tailwind + shadcn/ui) | Emerald/Navy/Surface colors, Manrope typography, WCAG AA |
| **Backend & DB**     | Supabase Cloud (PostgreSQL)                   | RLS nativo, Auth integrada, Real-time, SaaS sem ops      |
| **Auth**             | Supabase Cloud Auth                           | JWT, OAuth-ready (Fase 2+), MFA (Fase 2+)                |
| **Real-time**        | Supabase Real-time Subscriptions              | WebSocket para sync instantâneo                          |
| **File Storage**     | Supabase Cloud Storage                        | Mídias de conversa (fotos, vídeos, áudios)               |
| **WhatsApp Gateway** | Evolution API v2                              | Pairing via QR, webhooks bidirecional, v2 stable         |
| **API Framework**    | Next.js API Routes (/app/api/)                | Auth middleware, CORS, RateLimit, Webhook validation     |
| **Rate Limiting**    | Redis local (VPS)                             | 100 req/min per tenant, zero cost                        |
| **Deployment**       | Vercel (Frontend) + Supabase Cloud            | Global CDN, auto-scaling, managed DB                     |
| **Monitoring**       | Sentry + Supabase Logs                        | Error tracking, performance APM                          |

### 9.2 Database Schema (Resumido)

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

### 9.3 Evolution API v2 Integration

**Fluxo de Pairing:**

1. Owner clica "Connect WhatsApp" em Settings/Connection
2. Backend gera novo QR via Evolution API `/qr-code` endpoint
3. Frontend mostra QR code em modal (tempo limitado, ex 60s)
4. Owner scaneia com WhatsApp pessoal
5. Evolution API notifica backend via webhook `connection.update`
6. Backend marca tenant como `connection_status = active`
7. Webhooks começam a chegar em `/webhooks/messages`

**Fluxo de Mensagens Recebidas:**

```
Evolution API webhook → Backend /webhooks/messages
  ├─ Validar assinatura (HMAC-SHA256)
  ├─ Extrair: wa_phone, message_text, media_url (se houver)
  ├─ Lookup contact ou auto-criar
  ├─ Lookup/crear conversation
  ├─ Insert message no DB
  ├─ Broadcast via Supabase Real-time Subscriptions (WebSocket)
  └─ Frontend atualiza UI instantaneamente
```

**Fluxo de Mensagens Enviadas:**

```
Frontend (Chat modal) → POST /api/send-message
  ├─ Validar JWT + tenant_id
  ├─ Chamar Evolution API `/send-message`
  ├─ Insert message em `messages` table
  ├─ Broadcast via Real-time
  └─ Retornar status (success/error)
```

### 9.4 Validações & Constraints

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

## 10. Constraints & Assumptions

### 10.1 Restrições (Hard Constraints)

| Restrição                     | Impacto                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **Evolution API v2 depency**  | Qualquer breaking change na API quebra o sistema; versão fixa obrigatória         |
| **Supabase Cloud (SaaS)**     | Sem self-hosted gratuito; cliente precisa pagar Supabase (dependência de crédito) |
| **WhatsApp Business Account** | Cliente precisa ser aprovado pelo WhatsApp (não controlado por nós)               |
| **Redis local (VPS)**         | Taxa de entrega depende de disponibilidade/uptime do Redis do desenvolvedor       |
| **Desktop-first MVP**         | Mobile UI não será polida na Fase 1                                               |
| **Sem SMS fallback**          | Apenas WhatsApp; sem suporte a SMS                                                |

### 10.2 Premissas (Assumptions)

| Premissa                                          | Validação                      |
| ------------------------------------------------- | ------------------------------ |
| Cliente possui instância Evolution API v2 ativa   | Onboarding checklist           |
| Cliente tem acesso a projeto Supabase Cloud       | Documentação de setup          |
| Banda larga estável (para webhooks)               | N/A para MVP                   |
| Mínimo 2 atendentes por tenant (valor de produto) | Pesquisa de mercado pré-launch |
| Contatos usam WhatsApp (obviamente)               | Educação no GTM                |

---

## 11. Go-to-Market (GTM) Strategy

### 11.1 Posicionamento

**Slogan:** _"Kanban para WhatsApp. Síncrono, automatizado, colaborativo."_

**Unique Selling Points (USPs):**

1. ✅ Interface Kanban dedicada para WhatsApp (não é CRM genérico)
2. ✅ Colaboração em tempo real (não um-para-um)
3. ✅ Automação de follow-up sem código (não precisa Zapier)
4. ✅ Preço acessível (vs HubSpot/Pipedrive)

### 11.2 Channels Iniciais

- **Community & Outreach:** LinkedIn, WhatsApp Business groups, comunidades de marketers/e-commerce BR
- **Content:** Case studies, how-to videos, blog (SEO)
- **Partnerships:** Resellers/agências que trabalham com equipes de venda
- **Product Hunt:** Fase de traction após 100 usuários

### 11.3 Pricing (Post-MVP)

**Modelo:** SaaS subscription mensal por tenant

| Plano          | Preço      | Limites                               | Público                         |
| -------------- | ---------- | ------------------------------------- | ------------------------------- |
| **Starter**    | R$ 99/mês  | 1 Kanban, 50 contatos, 1 Attendant\*  | Freelancers, 1-pessoa           |
| **Pro**        | R$ 299/mês | 5 Kanbans, 500 contatos, 5 Attendants | Pequenas equipes (5-10 pessoas) |
| **Enterprise** | Custom     | Unlimited                             | 10+ atendentes, SLA, suporte    |

\*MVP = 1 user (Owner only), preço TBD na Fase 2

---

## 12. Risks & Mitigation

| Risco                             | Probabilidade | Impacto | Mitigação                                                               |
| --------------------------------- | ------------- | ------- | ----------------------------------------------------------------------- |
| Evolution API v2 breaking changes | Média         | Alto    | Monitorar changelog, versionar API, contract tests                      |
| Custo Supabase cresce exponencial | Média         | Médio   | Rate limiting, otimizar queries, cache layer                            |
| Compliance WhatsApp (ToS)         | Baixa         | Crítico | Legal review, terms of service, documentação clara                      |
| Latência webhook > 2s (UX ruins)  | Baixa         | Médio   | Async queues, database indexing, CDN strategy                           |
| RLS misconfiguration (data leak)  | Muito Baixa   | Crítico | Security audit pré-produção, testes automatizados, Code Review rigorosa |

---

## 13. Success Criteria

### Fase 1 (MVP)

- ✅ 0 data breaches (RLS enforcement 100%)
- ✅ Sistema operacional E2E (Register → WhatsApp → Chat)
- ✅ Performance < 500ms latência (webhook to UI); webhook timeout 5s
- ✅ 50+ usuários beta (feedback loop)
- ✅ NPS > 40 (early adopters)
- ✅ Uptime ≥ 99.5%

### Fase 2 (Multi-User)

- ✅ 500+ tenants pagos
- ✅ Feature parity com CRMs básicos
- ✅ MRR > R$ 100k
- ✅ NPS > 55

---

## 14. Implementation Roadmap — 7 Epics (Sequenced)

### Sequência de Implementação

```
Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 → Epic 6 → Epic 7
(Linear, sem dependencies cruzadas)
```

---

### Epic 1: FOUNDATION & AUTH

**Objetivo:** Schema, Auth, Onboarding, RLS, Evolution API pairing setup

**Stories:**

- Story 1.1: Create schema (tenants, users, contacts, conversations, messages, columns)
- Story 1.2: Supabase Auth (register, login, profile)
- Story 1.3: Onboarding (tenant auto-create, default kanban "Main" com colunas padrão)
- Story 1.4: RLS policies validation
- Story 1.5: Evolution API pairing (QR code generation)
- Story 1.6: Webhook endpoint setup (/api/webhooks/messages)

**Outputs:** Auth working, webhook validated, schema ready

---

### Epic 2: EVOLUTION PHASE 1 (Setup & Pairing)

**Objetivo:** Evolution API integration, webhook validation, manual testing

**Stories:**

- Story 2.1: Evolution API pairing (QR code)
- Story 2.2: Webhook endpoint (/api/webhooks/messages)
- Story 2.3: Webhook validation (HMAC-SHA256)
- Story 2.4: Manual testing (curl, console logs)

**Outputs:** Evolution connected, webhooks validated, ready for DB

---

### Epic 3: KANBAN BOARD & CONTACTS

**Objetivo:** Kanban visualization, drag-and-drop, contacts management

**Stories:**

- Story 3.1: Home page (Kanban board)
- Story 3.2: Drag-and-drop (dnd-kit v8.0.0)
- Story 3.3: Kanban CRUD em Settings
- Story 3.4: Contacts page CRUD
- Story 3.5: Contact validation (E.164 format)

**Outputs:** Kanban visível, contacts gerenciáveis

---

### Epic 4: EVOLUTION PHASE 2 (DB Integration)

**Objetivo:** End-to-end message flow, webhook → DB → UI

**Stories:**

- Story 4.1: Webhook → auto-register contacts
- Story 4.2: Webhook → auto-create conversations
- Story 4.3: Webhook → save messages to DB
- Story 4.4: Send message UI → Evolution API
- Story 4.5: Message delivery validation

**Outputs:** Messages flowing end-to-end

---

### Epic 5: CHAT & REAL-TIME

**Objetivo:** Real-time messaging, WebSocket subscriptions, chat interface

**Stories:**

- Story 5.1: Chat modal UI
- Story 5.2: Message history pagination
- Story 5.3: Real-time subscriptions (WebSocket)
- Story 5.4: Kanban/column selector in chat
- Story 5.5: Archive conversation
- Story 5.6: Loading + error states

**Outputs:** Chat funcional, instantaneous updates

---

### Epic 6: SETTINGS

**Objetivo:** User configuration, kanbans, automatic messages, Evolution status

**Stories:**

- Story 6.1: Profile subsection (name, password)
- Story 6.2: Connection subsection (Evolution status)
- Story 6.3: Kanbans subsection (CRUD, reorder com setas ↑↓)
- Story 6.4: Automatic Messages subsection (CRUD)

**Outputs:** Full settings interface

---

### Epic 7: AUTOMAÇÃO

**Objetivo:** Automatic Messages system, manual triggers, testing, polish

**Stories:**

- Story 7.1: Automatic Messages template system
- Story 7.2: Manual trigger (botão em Chat)
- Story 7.3: Message testing
- Story 7.4: Polish + edge cases

**Outputs:** Manual follow-up ready, agendamento em pós-MVP

---

### Timeline Estimativa

| Epic            | Duration        | Period            |
| --------------- | --------------- | ----------------- |
| Epic 1          | 2-3 semanas     | Semanas 1-3       |
| Epic 2          | 1-2 semanas     | Semanas 4-5       |
| Epic 3          | 2 semanas       | Semanas 6-7       |
| Epic 4          | 2 semanas       | Semanas 8-9       |
| Epic 5          | 2 semanas       | Semanas 10-11     |
| Epic 6          | 1-2 semanas     | Semanas 12-13     |
| Epic 7          | 1 semana        | Semanas 14        |
| **QA & Polish** | **1-2 semanas** | **Semanas 15-16** |

**Total: 8-12 semanas** (MVP ready for beta)

---

### Próximos Passos

1. **@pm \*create-epic** — Estruturar cada epic em EPIC-{ID}.md
2. **@sm \*draft** — Quebrar stories em AC detalhados
3. **@architect \*design-review** — Validar arquitetura
4. **@dev \*sprint-planning** — Iniciar Sprint 0

---

## 15. Appendices

### 15.1 References

- **Evolution API v2 Docs:** https://doc.evolution-api.com/v2/api-reference
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

### 15.2 Glossary

| Term                  | Definição                                                                 |
| --------------------- | ------------------------------------------------------------------------- |
| **Tenant**            | Instância isolada de cliente/empresa; separação lógica via `tenant_id`    |
| **Kanban**            | Pipeline/funil de vendas com colunas customizáveis                        |
| **Conversation**      | Thread de chat entre Owner/Attendant e um contato via WhatsApp            |
| **Automatic Message** | Template de mensagem pré-cadastrada para envio manual ou automático       |
| **RLS**               | Row Level Security — política de segurança que filtra dados por tenant_id |
| **Evolution API**     | Gateway WhatsApp third-party; pairing + webhooks                          |
| **E2E**               | End-to-End (fluxo completo Register → Chat)                               |

### 15.3 Related Documents

- `docs/brief.md` — Project brief (estratégia de negócio)
- `docs/architecture/` — Technical diagrams (ERD, API flows)
- `docs/stories/` — User stories (criadas por @sm após approval do PRD)
- `docs/prd.md` — Este documento

---

## 16. Approval & Sign-Off

| Papel           | Nome                         | Data       | Assinatura |
| --------------- | ---------------------------- | ---------- | ---------- |
| Product Manager | Morgan (AIOX)                | 2026-04-01 | ✅         |
| Product Owner   | Pax (AIOX)                   | 2026-04-01 | ✅         |
| Technical Lead  | (Pendente @architect review) | TBD        | ⏳         |

**Status:** ✅ APPROVED FOR EPIC BREAKDOWN (Validation checklist: `docs/CHECKLIST-PO-VALIDATION.md`)

---

## 17. Next Steps

1. **✅ PO Review (@po):** CONCLUÍDO — Validação 10/10 seções em `docs/CHECKLIST-PO-VALIDATION.md`
2. **Epic Creation (@pm):** Quebrar PRD em epics estruturados (Onboarding, Kanban, Chat, Settings)
3. **Story Creation (@sm):** Quebrar epics em user stories com AC detalhados
4. **Architecture Review (@architect):** Validar stack, RLS design, API contracts
5. **Development (Fase 1):** Sprint planning + implementation

---

**Document Generated by:** Morgan (PM Agent - AIOX)  
**Version Control:** GitOps in `/docs/prd.md`  
**Last Updated:** 2026-04-01 14:45 UTC (Aligned with PO Validation Checklist — 8 divergences resolved)

*Ready for epic breakdown and story development. Delegate epic creation to @pm *create-epic and story drafting to @sm.\*
