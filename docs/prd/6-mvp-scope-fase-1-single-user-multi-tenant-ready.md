# 6. MVP Scope (Fase 1: Single-User, Multi-tenant Ready)

## 6.1 Filosofia do MVP

- **Foco:** Um usuário por tenant (Owner) com arquitetura preparada para multi-user
- **Abordagem:** Operacional E2E (Register → Config → Chat → Automação)
- **Qualidade:** Production-ready, não MVP "hacky"
- **Timeline:** 8-12 semanas (estimativa)

## 6.2 Feature Set (Must-Haves)

### 🔐 **Autenticação & Onboarding**

| Feature                | Descrição                                          | Aceitação                                             |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **Register Page**      | Cadastro de Owner com Email, Senha, Setup inicial  | Email validado, tenant criado automaticamente         |
| **Login Page**         | Autenticação via Supabase Cloud Auth com RLS ativo | JWT válido, usuário redirecionado para Home ou Config |
| **Row Level Security** | Políticas RLS por `tenant_id`                      | Nenhum vazamento inter-tenant em testes               |
| **Profile Page**       | Editar Nome, Senha do usuário logado               | Mudanças persistidas, validação de força de senha     |

### 📋 **Gestão de Kanbans (Funis/Pipelines)**

| Feature                | Descrição                                                | Aceitação                                            |
| ---------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| **CRUD de Kanbans**    | Criar, ler, atualizar, deletar pipelines com reordenação | Tabela em Settings com botões ↑↓ para reorder        |
| **Kanban "Main"**      | Radio button — apenas UM kanban pode ser "Main"          | Novas conversas roteadas automaticamente para "Main" |
| **Criação Automática** | Kanban "Main" criado no onboarding                       | Owner não precisa criar manualmente                  |
| **Ordem Customizável** | Reordenar kanbans em Settings                            | Botões ↑↓ para reorder; persistência no DB           |

### 💬 **Visualização Kanban (Home Page)**

| Feature               | Descrição                                                              | Aceitação                            |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| **Kanban Board**      | Layout visual com colunas (Novo, Qualificado, etc.)                    | Colunas renderizam com conversas     |
| **Cards de Conversa** | Cada conversa é um "post-it" com ID de contato + preview de última msg | Clicável para abrir modal Chat       |
| **Drag-and-drop**     | Mover conversas entre colunas do mesmo Kanban                          | Posição persistida no DB             |
| **Seletor de Kanban** | Dropdown/tab para alternar entre diferentes Kanbans                    | Apenas um Kanban visualizado por vez |
| **Filtros**           | Toggle "Conversas Ativas" vs "Arquivadas"                              | Filtragem client-side ou server-side |

### 💬 **Modal de Conversa (Chat)**

| Feature                   | Descrição                                                 | Aceitação                                                  |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| **Chat Bidimensional**    | Histórico de mensagens (sent/received) com timestamp      | Scroll infinito ou paginação                               |
| **Envio de Mensagens**    | Texto simples e mídia (fotos, vídeos, áudios)             | Validação de tipo de arquivo, upload para Supabase Storage |
| **Recebimento Real-time** | Webhooks da Evo GO + Real-time Subscriptions    | Mensagens aparecem em < 2s                                 |
| **Seletor Kanban/Coluna** | Dropdown para transferir conversa entre Kanbans e colunas | Formato: "Kanban - Coluna" alfabético                      |
| **Automatic Messages**    | Botão para selecionar e enviar mensagens pré-cadastradas  | Mensagem enviada imediatamente                             |
| **Arquivar Conversa**     | Botão para encerrar/retirar de visualização ativa         | Status "archived" no DB, removido de Home                  |

### 👥 **Gestão de Contatos**

| Feature                  | Descrição                                                           | Aceitação                                         |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------- |
| **Página Contacts**      | Tabela com colunas "Name", "Phone Number", "Actions"                | Paginação para 100+ contatos                      |
| **CRUD Completo**        | Criar, ler, atualizar, deletar contatos                             | Sem contactos duplicados (validação por telefone) |
| **Validação Telefone**   | Formato internacional com "+" (E.164: +5511987654321)               | Regex stricto, erro claro se inválido             |
| **Modal Create Contact** | Form com Name, Number; validação inline                             | Salva em `contacts` table                         |
| **Modal Edit Contact**   | Mesmos fields; validação idêntica                                   | Update sem criar duplicata                        |
| **Auto-registro**        | Contato gravado automaticamente ao receber primeira msg de WhatsApp (via webhook callback processado em Node.js, não trigger de BD) | Se não existe, criar; se existe, update timestamp |

### 🔧 **Página de Configurações**

**Profile Subsection:**

- [ ] Formulário para alterar Nome e Senha do Owner
- [ ] Validação de força de senha (min. 8 chars, mix de maiúsc/minúsc/número)
- [ ] Botão "Save" com feedback de sucesso/erro

**Connection Subsection:**

- [ ] Modal QR Code para pairing com WhatsApp (Evo GO)
- [ ] Status de conexão (Conectado / Desconectado)
- [ ] Botão "Reconectar" para gerar novo QR
- [ ] Validação de webhook da Evo GO (confirmação de entrega)

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

### 🎨 **UI/UX Geral**

| Componente         | Descrição                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| **Header**         | Logo, título da página, ícone de usuário (canto superior direito)           |
| **User Icon Menu** | Dropdown com "Profile", "Logout"                                            |
| **Logout Button**  | Botão vermelho com "X", destroi sessão JWT                                  |
| **Sidebar/Nav**    | Links para Home, Contacts, Settings (subdivisions)                          |
| **Design System**  | Tailwind CSS com cores corporativas (primária, secundária, success, danger) |
| **Responsividade** | Desktop-first MVP; mobile responsiveness **Fase 2+**                        |
| **Acessibilidade** | Alt text em imagens, labels em inputs, contraste WCAG AA                    |

## 6.3 Out of Scope (Será Roadmap)

❌ **Fase 2+:**

- Multi-user (Attendants) com RLS granular
- Notificações sonoras / push
- Dashboards de performance por atendente
- Magic Link / Login Social
- Múltiplas instâncias da Evo GO por Tenant
- Notas internas em cards
- IA (resumo de conversas, sugestão de respostas)
- Integrações externas (Zapier, Make)

---
