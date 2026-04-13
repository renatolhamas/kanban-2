-- Kanban 2 Database Schema (DDL)
-- Generated from Supabase MCP introspection
-- Last updated: 2026-04-07

-- ========================================
-- EXTENSIONS
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: tenants
-- ========================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  subscription_status text NOT NULL DEFAULT 'active'::text CHECK (subscription_status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text])),
  evolution_instance_id text UNIQUE,
  connection_status text NOT NULL DEFAULT 'disconnected'::text CHECK (connection_status = ANY (ARRAY['connected'::text, 'connecting'::text, 'disconnected'::text, 'error'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- ========================================
-- TABLE: users
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user'::text CHECK (role = ANY (ARRAY['admin'::text, 'user'::text, 'owner'::text])),
  name text,
  password_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- ========================================
-- TABLE: kanbans
-- ========================================
CREATE TABLE IF NOT EXISTS public.kanbans (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  is_main boolean NOT NULL DEFAULT false,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT kanbans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT kanbans_unique_is_main_per_tenant UNIQUE (tenant_id, is_main) WHERE is_main = TRUE
);

-- ========================================
-- TABLE: columns (kanban columns)
-- ========================================
CREATE TABLE IF NOT EXISTS public.columns (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  kanban_id uuid NOT NULL,
  name text NOT NULL,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT columns_kanban_id_fkey FOREIGN KEY (kanban_id) REFERENCES public.kanbans(id) ON DELETE CASCADE
);

-- ========================================
-- TABLE: contacts
-- ========================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- ========================================
-- TABLE: conversations
-- ========================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  kanban_id uuid,
  column_id uuid,
  wa_phone text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'closed'::text, 'archived'::text])),
  last_message_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT conversations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT conversations_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE,
  CONSTRAINT conversations_kanban_id_fkey FOREIGN KEY (kanban_id) REFERENCES public.kanbans(id) ON DELETE SET NULL,
  CONSTRAINT conversations_column_id_fkey FOREIGN KEY (column_id) REFERENCES public.columns(id) ON DELETE SET NULL
);

-- ========================================
-- TABLE: messages
-- ========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type = ANY (ARRAY['contact'::text, 'agent'::text, 'system'::text])),
  content text NOT NULL,
  media_url text,
  media_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE
);

-- ========================================
-- TABLE: automatic_messages
-- ========================================
CREATE TABLE IF NOT EXISTS public.automatic_messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  message text NOT NULL,
  scheduled_interval_minutes integer,
  scheduled_kanban_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT automatic_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT automatic_messages_scheduled_kanban_id_fkey FOREIGN KEY (scheduled_kanban_id) REFERENCES public.kanbans(id) ON DELETE SET NULL
);

-- ========================================
-- TABLE: failed_registrations
-- ========================================
CREATE SEQUENCE IF NOT EXISTS public.failed_registrations_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

CREATE TABLE IF NOT EXISTS public.failed_registrations (
  id bigint NOT NULL DEFAULT nextval('public.failed_registrations_id_seq'::regclass),
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_resources jsonb NOT NULL,
  cleanup_attempted boolean DEFAULT false,
  cleanup_status jsonb,
  error_message text,
  notes text,
  resolved_at timestamp with time zone,
  PRIMARY KEY (id)
);

-- ========================================
-- INDEXES
-- ========================================
-- Multi-tenant isolation indexes
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON public.contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kanbans_tenant_id ON public.kanbans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_automatic_messages_tenant_id ON public.automatic_messages(tenant_id);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_columns_kanban_id ON public.columns(kanban_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_kanban_id ON public.conversations(kanban_id);
CREATE INDEX IF NOT EXISTS idx_conversations_column_id ON public.conversations(column_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_automatic_messages_kanban_id ON public.automatic_messages(scheduled_kanban_id);

-- Query optimization indexes
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_failed_registrations_email ON public.failed_registrations(email);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Note: RLS policies must be created separately per application requirements
-- RLS is ENABLED on all tables but policies are application-specific

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanbans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automatic_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_registrations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- COMMENTS & DOCUMENTATION
-- ========================================
COMMENT ON TABLE public.tenants IS 'Multi-tenant root isolation. Each tenant is an independent organization.';
COMMENT ON TABLE public.users IS 'Platform users (admins, agents) associated with a tenant.';
COMMENT ON TABLE public.kanbans IS 'Kanban boards for organizing conversations and tasks per tenant.';
COMMENT ON TABLE public.columns IS 'Columns within kanban boards (e.g., To Do, In Progress, Done).';
COMMENT ON TABLE public.contacts IS 'Contacts/customers within a tenant (WhatsApp users).';
COMMENT ON TABLE public.conversations IS 'Conversations between contacts and agents via WhatsApp.';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations.';
COMMENT ON TABLE public.automatic_messages IS 'Scheduled/automatic messages sent by the system.';
COMMENT ON TABLE public.failed_registrations IS 'Tracking for registration failures and resource cleanup.';

COMMENT ON COLUMN public.tenants.subscription_status IS 'Tenant subscription state: active, paused, or cancelled.';
COMMENT ON COLUMN public.tenants.connection_status IS 'WhatsApp Evo GO connection state: connected, disconnected, or error.';
COMMENT ON COLUMN public.users.role IS 'User role: admin (full access), owner (org owner), user (limited access).';
COMMENT ON COLUMN public.kanbans.is_main IS 'Whether this is the default/main kanban for the tenant.';
COMMENT ON COLUMN public.conversations.wa_phone IS 'WhatsApp phone number associated with this conversation.';
COMMENT ON COLUMN public.conversations.status IS 'Conversation state: active, closed, or archived.';
COMMENT ON COLUMN public.messages.sender_type IS 'Message origin: contact (customer), agent (staff), or system (automated).';
COMMENT ON COLUMN public.automatic_messages.scheduled_interval_minutes IS 'Interval in minutes for recurring messages (NULL = one-time).';

-- ========================================
-- GRANTS (customize per application requirements)
-- ========================================
-- All permissions should be managed through Supabase auth and RLS policies
-- This schema file is DDL-only and does not include role/permission grants

-- End of schema.sql
