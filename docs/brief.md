# Project Brief: WhatsApp Kanban System

> Status: Finalized (Discovery Phase) → Enhanced with Technical Specifications
> Mode: MVP Single-User (Arquitetura preparada para Multi-tenant)
> Created: 2026-03-31
> Updated: 2026-04-01
> Last Enhanced: 2026-04-01

**Change Log:**
| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-03-31 | 1.0 | Brief inicial com estratégia de negócio e MVP scope | PM |
| 2026-04-01 | 2.0 | Integração de especificações técnicas do brainstorm; detalhamento UI/UX; roadmap E2E | Analyst (Atlas) |

---

### 1. Executive Summary

O projeto se inicia com uma **Plataforma SaaS Multi-tenant de Gestão de Conversas**, permitindo que empresas (Clientes/Tenants) gerenciem fluxos de atendimento no WhatsApp de forma colaborativa. Através de uma interface **Kanban**, múltiplos atendentes vinculados a um único "Dono" podem visualizar e interagir com conversas em tempo real, utilizando a **Evolution API v2** e garantindo isolamento total de dados via **Supabase Cloud RLS**.

---

### 2. Problem Statement

O gerenciamento de WhatsApp em equipes sofre com a falta de sincronia. O modelo tradicional de "um número, uma pessoa" gera desalinhamento sobre quem está atendendo quem e em qual estágio a venda se encontra.

A inexistência de uma **pipeline compartilhada** resulta em leads duplicados, respostas esquecidas e falta de clareza sobre a produtividade do time. Soluções de mercado costumam ser restritivas ou complexas, dificultando a implementação de uma gestão visual simples (Kanban) aliada à automação de follow-up para equipes.

---

### 3. Proposed Solution

A solução é um **Dashboard Colaborativo Multi-tenant** que separa a entidade **Dono (Tenant)** da entidade **Usuário (User)**.

**Pilares Técnicos e Funcionais:**

- **Kanban Compartilhado:** Visibilidade total para todos os atendentes do Tenant sobre as conversas ativas.
- **Hierarquia de Acesso:** Definição básica de papéis (Owner vs. Attendant) para gestão de instâncias da Evolution API.
- **Sincronização de Threads:** Uso de webhooks para garantir que qualquer ação tomada por um atendente reflita instantaneamente para os outros.
- **Persistência Centralizada:** Banco de dados estruturado com `tenant_id`, permitindo que o histórico e as configurações de "Automatic Messages" sejam compartilhadas pela equipe.

---

### 4. Target Users

O sistema atende a estruturas organizacionais que buscam profissionalizar e escalar o atendimento via WhatsApp através de colaboração:

- **Dono do Negócio (Tenant/Owner):** Responsável estratégico. Configura a **Evolution API**, define colunas do Kanban e mensagens de automação. Busca supervisão, controle de leads e redução do churn de vendas.
- **Equipe de Atendimento (Attendants/Users):** Execução ágil. Operam o Kanban compartilhado para gerenciar diálogos, enviar mídias e registrar contatos, sabendo exatamente em que etapa o cliente está no funil.

---

### 5. Goals & Metrics

O sucesso da plataforma será medido pela capacidade do **Tenant** de organizar o fluxo e otimizar a conversão de seus contatos.

**Objetivos de Negócio (SMART):**

1.  **Triagem Ativa (100%):** Garantir que todas as conversas que entram pelo "Funil Principal" sejam triadas (movidas para o funil/etapa adequada ou arquivadas) em até 24h.
2.  **Redução de Lead Time:** Diminuir em 30% o tempo médio de permanência de um contato na primeira etapa do Funil Principal através de alertas visuais.
3.  **Eficiência de Follow-up:** Aumentar em 50% o número de contatos que recebem follow-ups personalizados, automatizados via "Automatic Messages".

---

### 6. MVP Scope

O foco inicial é entregar um fluxo operacional robusto e colaborativo de ponta a ponta (E2E).

**MVP Fase 1: Single-User com Arquitetura Multi-tenant**
O MVP será desenvolvido para **um usuário por tenant** (Owner), mas a arquitetura RLS do Supabase já suportará múltiplos usuários (Attendants) em fases futuras.

**Recursos Incluídos (Must-Haves):**

**🔐 Autenticação & Onboarding:**

- **Página Register:** Cadastro de Owner com Email, Senha e Setup inicial da instância
- **Página Login:** Autenticação via Supabase Cloud Auth com RLS funcionando
- **RLS (Row Level Security):** Separação total de dados por `tenant_id`
- **Perfil do Usuário:** Página "Profile" para alterar Nome e Senha do usuário logado

**📋 Gestão de Kanbans (Funis/Pipelines):**

- **CRUD de Kanbans:** Nome, Ordem (esquerda→direita via números), botões "Antes"/"Depois" para reordenação
- **Kanban "Main":** Campo radio button — apenas UM kanban pode ser "Main" (funil principal)
- **Criação Automática:** Kanban "Main" criado automaticamente no onboarding
- **Novas Conversas:** Automáticamente roteadas para o Kanban "Main"

**💬 Visualização Kanban (Home):**

- **Página Home:** Kanban visual com colunas configuráveis
- **Cards de Conversa:** Cada conversa é um "post-it" arrastável entre colunas
- **Drag-and-drop:** Movimentação de conversas entre etapas dentro do mesmo Kanban
- **Seletor de Kanban:** Filtro para alternar entre diferentes Kanbans
- **Filtros:** "Conversas Ativas" vs "Arquivadas"

**💬 Modal de Conversa (Chat):**

- **Envio de Mensagens:** Texto e mídia (fotos, vídeos, áudios)
- **Recebimento em Tempo Real:** Via webhooks da Evolution API v2
- **Seletor de Kanban/Coluna:** Dropdown para transferir conversa entre Kanbans e colunas
  - Formato: "Kanban - Coluna" em ordem alfabética (por Kanban, depois por Coluna dentro do Kanban)
- **Automatic Messages:** Botão para selecionar e enviar mensagens pré-cadastradas
- **Arquivar Conversa:** Botão para encerrar/retirar conversa da visualização ativa

**👥 Gestão de Contatos:**

- **Página Contacts:** Tabela com colunas "Name", "Phone Number", "Actions"
- **CRUD Completo:** Criar, ler, atualizar, deletar contatos
- **Validação de Telefone:** Formato internacional começando com "+"
- **Botão "Novo":** Abre modal "Create Contact" (Name, Number)
- **Editar Contato:** Modal "Edit Contact" idêntico ao Create
- **Registro Automático:** Contatos gravados automaticamente ao iniciar conversa

**🔧 Página de Configurações:**

**📱 Profile:**

- Alterar Nome e Senha do usuário logado

**🔌 Connection:**

- Pairing com WhatsApp via QR Code (Evolution API v2)
- Gerenciamento de instâncias da Evolution API
- Sincronização de mensagens via webhooks em tempo real

**📧 Automatic Messages:**

- **Tabela:** Colunas "Name", "Actions"
- **CRUD Completo:** Criar, editar, deletar mensagens automáticas
- **Modal "Create Message":** Fields "Name" e "Message"
- **Modal "Edit Message":** Idêntico ao Create
- **Configuração por Kanban e Período:** Mensagens podem ser programadas para follow-up automático (enviadas em intervalos específicos por Kanban)
- **Uso Manual ou Automático:** Podem ser selecionadas manualmente no chat ou disparadas automaticamente

**🎨 Kanbans (Gerenciamento):**

- **Tabela:** Colunas "Name", "Main" (radio button), "Actions"
- **CRUD Completo:** Criar, editar, deletar Kanbans
- **Modal "Create Kanban":** Fields "Name", "Order" (numeração) + botões "Antes"/"Depois"
- **Modal "Edit Kanban":** Idêntico ao Create
- **Radio Button "Main":** Apenas UM Kanban pode ser marcado como "Main"

**🎛️ UI/UX Geral:**

- **Ícone de Usuário:** Canto superior direito → leva para página "Profile"
- **Botão Logout:** Botão vermelho com "X" ao lado do ícone de usuário
- **Responsividade:** Design adaptado para desktop (MVP focado em desktop)

---

### 7. User Lifecycle & Roles

O sistema utiliza uma hierarquia clara para garantir a autonomia do Cliente (Tenant) e a segurança dos dados.

**Fluxo de Onboarding (MVP - Single User):**

1.  **Página Register:** O usuário se cadastra preenchendo Email e Senha
2.  **Criação do Tenant:** O backend cria automaticamente um registro na tabela `tenants` e vincula o usuário como **OWNER** deste novo ID
3.  **Setup Inicial (Automático):**

- Kanban "Main" criado automaticamente
- Usuário é redirecionado para "Configuration" → "Connection" para conectar Evolution API v2 via QR Code
- Após conexão bem-sucedida, acesso à página "Home" (Kanban)

**Fluxo Operacional (MVP):**

- Owner tem acesso completo a todas as funcionalidades
- Pode gerenciar Kanbans, Contatos, Mensagens Automáticas e Configurações
- Pode visualizar e interagir com todas as conversas do WhatsApp

**Roadmap - Gestão de Equipe (Fase 2):**

- O Owner poderá criar usuários **Attendants** via "Team Management"
- Attendants terão acesso ao Kanban e conversas (sujeito a RLS do Supabase)
- Papéis: OWNER vs ATTENDANT com permissões granulares
- Arquitetura já preparada para suportar multi-user via RLS

---

### 8. Post-MVP Vision

A plataforma deve evoluir para um ecossistema completo de atendimento e inteligência para negócios intensivos no WhatsApp.

- **Experiência do Usuário:** Notificações sonoras e Dashboards de performance por atendente.
- **Autenticação Flexível:** Implementação de Magic Link e Login Social (Google/WhatsApp).
- **Fase 2 (Escalabilidade):** Suporte a múltiplas instâncias por Tenant e notas internas em cards.
- **Inteligência Artificial:** Resumo automático de conversas e sugestão de respostas automatizadas.
- **Conectividade:** Webhooks de saída para integração com ferramentas de automação (Zapier/Make).

---

### 9. Technical Considerations

A arquitetura será centrada na separação rígida de dados (**Multi-tenancy**) e na comunicação em tempo real.

**Stack Tecnológica:**

- **Frontend:** **Next.js** com **Tailwind CSS**. Estrutura componentizada para reutilização. Código em **English (Market Standard)**.
- **Backend & DB:** **Supabase Cloud (SaaS)**. Uso extensivo de **Row Level Security (RLS)** baseado em `tenant_id` para isolamento total de dados.
- **Autenticação:** Supabase Cloud Auth com JWT
- **Histórico de Mensagens:** Persistência total no **Supabase Cloud** com estrutura denormalizada para performance
- **Integração WhatsApp:** **Evolution API v2**

* Pairing via QR Code (sessão única por tenant)
* Recebimento de mensagens via webhooks em tempo real
* Sincronização bidirecional (envio e recebimento)

- **Mensagens Automáticas:** Sistema de agendamento para disparar mensagens em intervalos configurados por Kanban
- **Diretório do Sistema:** Todo o desenvolvimento mantido em `/SYSTEM`
- **Armazenamento de Mídias:** Supabase Cloud Storage para anexos de conversa (fotos, áudios, vídeos)

**Considerações de Design:**

- **Validação de Telefone:** Formato internacional com "+" (E.164)
- **RLS Policies:** Baseadas em `tenant_id` para garantir isolamento total entre tenants
- **Webhooks Evolution API:** Validação de assinatura e processamento assíncrono
- **Estado de Conversa:** Sincronizado entre múltiplos usuários via Real-time Subscriptions (Supabase)

---

### 10. Tools & Infrastructure Access

**Supabase Web (Cloud SaaS - Versão Paga):**

- **Plataforma:** https://supabase.com/ (versão web hospedada, NÃO é a versão auto-hospedada gratuita)
- **Documentação:** https://supabase.com/docs
- **Acesso:** Via MCP (Model Context Protocol) para:
  - Implementação de schemas (criação de tabelas, enums, índices)
  - Configuração de Row Level Security (RLS) policies
  - Gerenciamento de dados
  - Alterações de estrutura do banco durante o desenvolvimento
- **Autenticação:** Supabase Cloud Auth com JWT
- **Storage:** Supabase Cloud Storage para arquivos de mídia
- **Real-time:** Supabase Real-time Subscriptions para sincronização de conversas

**Acesso MCP:**

- O orquestrador (Antigravity/Atlas) possuirá acesso MCP configurado
- Operações de DDL (Data Definition Language) executadas via MCP
- Migrations e alterações de schema feitas via MCP durante desenvolvimento
- Permitirá implementação rápida de mudanças no banco conforme novas features forem desenvolvidas

**Alternativas Rejeitadas:**

- ❌ Supabase Auto-hospedado (versão gratuita): Não será utilizado
- ❌ Bancos de dados self-hosted: Não se aplica

---

### 12. Constraints & Assumptions

**Restrições (Constraints):**

- **Versionamento da API:** Dependência estrita da **Evolution API v2**.
- **Plataforma Supabase:** Uso do **Supabase Web (Cloud SaaS)** — versão paga hospedada em https://supabase.com/
- **Interface Web-Only:** MVP focado em Dashboard para uso operacional de equipe.

**Premissas (Assumptions):**

- **Infraestrutura Disponível:** O Cliente possui uma instância da **Evolution API v2** funcional.
- **Acesso MCP:** O orquestrador possui acesso MCP configurado para gerenciar Supabase Cloud.
- **Credenciais Supabase:** Acesso administrativo ao projeto Supabase Cloud via https://supabase.com/

---

### 13. Risks & Open Questions

**Caminho de Pesquisa:**

- **Gerenciamento de Mídias (Supabase Cloud Storage):** Analisar o impacto no armazenamento ao persistir todas as fotos/áudios.
- **Limites de Cota:** Monitorar o volume de webhooks e requisições no **Supabase Cloud** conforme escala.
- **Custos Supabase:** Acompanhar custos da versão paga conforme volume de dados cresce.

---

### 15. Appendices

- **API Documentation:** [Evolution API v2](https://doc.evolution-api.com/v2/api-reference)
- **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
- **Infrastructure:** Supabase Web (Cloud SaaS) - PostgreSQL, Auth & Storage
- **Design System:** Tailwind CSS Modern Patterns

---

### 16. MVP E2E (End-to-End) Checklist

Para que o MVP seja funcional e completo, os seguintes componentes devem estar implementados e integrados:

**🔐 Autenticação & Onboarding:**

- [ ] Página Register funcionando com validação
- [ ] Página Login funcionando com RLS
- [ ] Criação automática de Tenant no Register
- [ ] Kanban "Main" criado automaticamente
- [ ] Redirecionamento para "Configuration" → "Connection" após primeiro login

**📱 Integração WhatsApp:**

- [ ] Modal QR Code na página "Connection"
- [ ] Recebimento de webhooks da Evolution API v2
- [ ] Sincronização de mensagens em tempo real
- [ ] Envio de mensagens via Evolution API

**💬 Kanban & Conversas:**

- [ ] Página Home com layout Kanban
- [ ] Colunas e Kanbans listados corretamente
- [ ] Drag-and-drop de conversas entre colunas
- [ ] Modal de conversa com Chat bidimensional
- [ ] Seletor Kanban/Coluna no modal (dropdown)
- [ ] Envio de texto e mídia
- [ ] Recebimento de mensagens em tempo real

**👥 Contatos:**

- [ ] Página Contacts com CRUD completo
- [ ] Validação de telefone (formato +)
- [ ] Registro automático de contatos ao iniciar conversa
- [ ] Modals Create/Edit Contact funcionando

**🔧 Configurações:**

- [ ] Página Profile para alterar Nome e Senha
- [ ] Página Connection com QR Code
- [ ] Página Automatic Messages com CRUD
- [ ] Página Kanbans com CRUD
- [ ] Radio button "Main" funcionando (apenas 1 selecionável)

**🎨 UI/UX:**

- [ ] Ícone de usuário → Profile
- [ ] Botão Logout (vermelho com X)
- [ ] Design responsivo e consistente

---

### 17. Next Steps

O próximo passo é realizar o **Forge Phase** (Implementação):

**Fase 1 - Fundação:**

1.  Setup da estrutura inicial do Next.js em `/SYSTEM` (pastas, componentes base)
2.  Configuração do Schema do Supabase (Tables: tenants, users, kanbans, columns, conversations, contacts, automatic_messages, etc.)
3.  Implementação de RLS policies por tenant_id

**Fase 2 - Autenticação & Onboarding:** 4. Páginas Register e Login com Supabase Auth 5. Lógica de criação automática de Tenant e Kanban "Main" 6. Página Profile para alterar dados do usuário

**Fase 3 - Configuração & Integração:** 7. Página Connection com modal QR Code (Evolution API v2) 8. Páginas Kanbans, Contacts, Automatic Messages (CRUD completo)

**Fase 4 - Kanban & Chat:** 9. Página Home com layout Kanban, drag-and-drop 10. Modal de conversa com Chat 11. Seletor Kanban/Coluna no modal

**Fase 5 - Integração & Testes:** 12. Webhooks da Evolution API v2 (recebimento de mensagens) 13. Sincronização em tempo real (Supabase Real-time Subscriptions) 14. Testes E2E: Register → Login → Configurar Kanban → Conectar WhatsApp → Usar Sistema

---
