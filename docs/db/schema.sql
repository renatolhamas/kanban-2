> 📅 Extraído em: 2026-04-25 às 00:00 UTC
> Fonte: Supabase (ujcjucgylwkjrdpsqffs) — dados em tempo real
> Status: ✅ Atualizado

-- DDL Completo do Schema Public
-- 10 tabelas | 37 índices | 1 sequence | 5 funções | 2 triggers | 6 extensões | 33 migrações
-- Multi-tenant isolado por tenant_id via RLS
-- Última atualização: 2026-04-28
-- ============================================================================

-- ============================================================================
-- SEQUENCES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS failed_registrations_id_seq
    START WITH 1
    INCREMENT BY 1;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    subscription_status text NOT NULL DEFAULT 'active'::text,
    evolution_instance_id text UNIQUE,
    connection_status text NOT NULL DEFAULT 'disconnected'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    qr_code text,
    qr_code_expires_at timestamp with time zone,
    evolution_instance_token text
);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'user'::text,
    name text,
    password_hash text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (email, tenant_id)
);

CREATE TABLE IF NOT EXISTS kanbans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    is_main boolean NOT NULL DEFAULT false,
    order_position integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, is_main) WHERE (is_main = true)
);

CREATE TABLE IF NOT EXISTS columns (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kanban_id uuid NOT NULL REFERENCES kanbans(id) ON DELETE CASCADE,
    name text NOT NULL,
    order_position integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    wa_name text,
    is_group boolean DEFAULT false,
    UNIQUE (phone, tenant_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    kanban_id uuid REFERENCES kanbans(id) ON DELETE SET NULL,
    column_id uuid REFERENCES columns(id) ON DELETE SET NULL,
    wa_phone text NOT NULL,
    status text NOT NULL DEFAULT 'active'::text,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    evolution_message_id text UNIQUE,
    unread_count integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type text NOT NULL,
    content text NOT NULL,
    media_url text,
    media_type text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    evolution_message_id text UNIQUE,
    sender_jid text,
    status text NOT NULL DEFAULT 'sent'::text,
    status_updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automatic_messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    message text NOT NULL,
    scheduled_interval_minutes integer,
    scheduled_kanban_id uuid REFERENCES kanbans(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS debug_auth_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    event_type text,
    payload jsonb,
    extracted_id uuid,
    message text,
    error_detail text
);

CREATE TABLE IF NOT EXISTS failed_registrations (
    id bigint PRIMARY KEY DEFAULT nextval('failed_registrations_id_seq'::regclass),
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_resources jsonb NOT NULL,
    cleanup_attempted boolean DEFAULT false,
    cleanup_status jsonb,
    error_message text,
    notes text,
    resolved_at timestamp with time zone
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_automatic_messages_tenant ON automatic_messages USING btree (tenant_id);

CREATE INDEX IF NOT EXISTS idx_columns_kanban_order ON columns USING btree (kanban_id, order_position);

CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_tenant ON contacts USING btree (phone, tenant_id);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations USING btree (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_kanban_column ON conversations USING btree (kanban_id, column_id);
CREATE INDEX IF NOT EXISTS idx_conversations_wa_phone_tenant ON conversations USING btree (wa_phone, tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_evolution_id ON conversations USING btree (evolution_message_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations USING btree (last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS failed_registrations_created_at_idx ON failed_registrations USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS failed_registrations_email_idx ON failed_registrations USING btree (email);
CREATE INDEX IF NOT EXISTS failed_registrations_resolved_at_idx ON failed_registrations USING btree (resolved_at) WHERE (resolved_at IS NULL);

CREATE INDEX IF NOT EXISTS idx_kanbans_tenant_order ON kanbans USING btree (tenant_id, order_position);
CREATE INDEX IF NOT EXISTS idx_kanbans_main_tenant ON kanbans USING btree (tenant_id) WHERE (is_main = true);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages USING btree (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_evolution_id ON messages USING btree (evolution_message_id);

CREATE INDEX IF NOT EXISTS idx_tenants_evolution_instance_id_unique ON tenants USING btree (evolution_instance_id) WHERE (evolution_instance_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants USING btree (subscription_status);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email_tenant ON users USING btree (email, tenant_id);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE automatic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE debug_auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanbans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ⚠️ Note: failed_registrations NÃO tem RLS (tabela de pré-autenticação)
-- ⚠️ Note: debug_auth_logs TEM RLS mas SEM policies (vide security advisors)

-- ============================================================================
-- INDEXES (ADICIONAIS)
-- ============================================================================

-- debug_auth_logs index
CREATE INDEX IF NOT EXISTS debug_auth_logs_pkey ON debug_auth_logs USING btree (id);

-- Índice parcial para unread resolutions
CREATE INDEX IF NOT EXISTS idx_conversations_unique_active_per_tenant_phone ON conversations USING btree (tenant_id, wa_phone) WHERE (status = 'active'::text);
CREATE INDEX IF NOT EXISTS idx_conversations_active_by_tenant ON conversations USING btree (tenant_id, status, last_message_at DESC NULLS LAST) WHERE (status = 'active'::text);

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN conversations.evolution_message_id IS 'ID da última mensagem recebida da Evolution GO (key.id) para idempotência de upsert';
COMMENT ON COLUMN messages.evolution_message_id IS 'ID único da mensagem na Evolution GO (key.id) para evitar duplicidade';
COMMENT ON COLUMN messages.sender_jid IS 'JID completo do remetente (ex: 5511999999999@s.whatsapp.net)';
COMMENT ON COLUMN messages.status IS 'Status do envio: sent, error, delivered, read';
COMMENT ON COLUMN messages.status_updated_at IS 'Timestamp atualizado quando status muda (via trigger)';
COMMENT ON COLUMN tenants.qr_code IS 'WhatsApp QR code for pairing, received from Evo GO webhook QRCODE_UPDATED';
COMMENT ON COLUMN tenants.qr_code_expires_at IS 'Timestamp when the QR code expires (typically 5 minutes after generation)';
COMMENT ON COLUMN tenants.evolution_instance_token IS 'Instance-specific token for Evo GO API calls';
COMMENT ON TABLE debug_auth_logs IS 'Internal audit table for JWT authentication hook events. RLS disabled as this is system-internal, not exposed via API.';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar status_updated_at quando status muda
CREATE TRIGGER IF NOT EXISTS tr_messages_status_update
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION handle_message_status_update();

-- Trigger para chamar webhook de polling quando mensagem é inserida
CREATE TRIGGER IF NOT EXISTS tr_poll_message_status
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION trigger_poll_message_status();
