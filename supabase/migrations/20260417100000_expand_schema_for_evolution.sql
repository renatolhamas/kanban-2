-- Expansão do Schema para suporte à Evolution GO
-- Data: 2026-04-17
-- Referência: Story 4.2 e Story 5.1
-- Bloqueador removido: F4.plan.006

BEGIN;

-- 1. Adicionar colunas à tabela conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS evolution_message_id TEXT UNIQUE;

COMMENT ON COLUMN public.conversations.evolution_message_id IS 'ID da última mensagem recebida da Evolution GO (key.id) para idempotência de upsert';

-- 2. Adicionar colunas à tabela messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS evolution_message_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS sender_jid TEXT;

COMMENT ON COLUMN public.messages.evolution_message_id IS 'ID único da mensagem na Evolution GO (key.id) para evitar duplicidade';
COMMENT ON COLUMN public.messages.sender_jid IS 'JID completo do remetente (ex: 5511999999999@s.whatsapp.net)';

-- 3. Criar índices de performance para processamento de webhooks
-- Otimiza busca de conversas por telefone (fluxo principal do webhook)
CREATE INDEX IF NOT EXISTS idx_conversations_wa_phone_tenant
  ON public.conversations(wa_phone, tenant_id);

-- Otimiza verificação de duplicidade de mensagens
CREATE INDEX IF NOT EXISTS idx_messages_evolution_id
  ON public.messages(evolution_message_id);

-- Otimiza busca de conversas por ID externo
CREATE INDEX IF NOT EXISTS idx_conversations_evolution_id
  ON public.conversations(evolution_message_id);

COMMIT;
