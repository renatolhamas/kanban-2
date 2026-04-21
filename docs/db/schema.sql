-- Database Schema — DDL Completo
-- 📅 Extraído em: 2026-04-21 12:30 UTC
-- Fonte: Supabase (ujcjucgylwkjrdpsqffs)
-- Status: ✅ Atualizado (via MCP Supabase - live extraction)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA extensions;

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id                      uuid        NOT NULL DEFAULT uuid_generate_v4(),
  name                    text        NOT NULL,
  subscription_status     text        NOT NULL DEFAULT 'active',
  evolution_instance_id   text,
  connection_status       text        NOT NULL DEFAULT 'disconnected',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  qr_code                 text,        -- QR code WhatsApp, recebido do webhook QRCODE_UPDATED (Evo GO)
  qr_code_expires_at      timestamptz, -- Expiração do QR code (tipicamente 5 min após geração)
  evolution_instance_token text,       -- Token da instância para chamadas à API Evo GO
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_evolution_instance_id_key UNIQUE (evolution_instance_id)
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.users (
  id          uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id   uuid        NOT NULL,
  email       text        NOT NULL,
  role        text        NOT NULL DEFAULT 'user',
  name        text,
  password_hash text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_tenant_id_key UNIQUE (email, tenant_id),
  CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.kanbans (
  id             uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id      uuid        NOT NULL,
  name           text        NOT NULL,
  is_main        boolean     NOT NULL DEFAULT false,
  order_position integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kanbans_pkey PRIMARY KEY (id),
  CONSTRAINT kanbans_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE
);

ALTER TABLE public.kanbans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.columns (
  id             uuid        NOT NULL DEFAULT uuid_generate_v4(),
  kanban_id      uuid        NOT NULL,
  name           text        NOT NULL,
  order_position integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT columns_pkey PRIMARY KEY (id),
  CONSTRAINT columns_kanban_id_fkey FOREIGN KEY (kanban_id)
    REFERENCES public.kanbans(id) ON DELETE CASCADE
);

ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.contacts (
  id         uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id  uuid        NOT NULL,
  name       text        NOT NULL,
  phone      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_pkey PRIMARY KEY (id),
  CONSTRAINT contacts_phone_tenant_id_key UNIQUE (phone, tenant_id),
  CONSTRAINT contacts_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.conversations (
  id              uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id       uuid        NOT NULL,
  contact_id      uuid        NOT NULL,
  kanban_id       uuid,
  column_id       uuid,
  wa_phone        text        NOT NULL,
  status          text        NOT NULL DEFAULT 'active',
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT conversations_contact_id_fkey FOREIGN KEY (contact_id)
    REFERENCES public.contacts(id) ON DELETE CASCADE,
  CONSTRAINT conversations_kanban_id_fkey FOREIGN KEY (kanban_id)
    REFERENCES public.kanbans(id) ON DELETE SET NULL,
  CONSTRAINT conversations_column_id_fkey FOREIGN KEY (column_id)
    REFERENCES public.columns(id) ON DELETE SET NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id              uuid        NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid        NOT NULL,
  sender_type     text        NOT NULL,
  content         text        NOT NULL,
  media_url       text,
  media_type      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id)
    REFERENCES public.conversations(id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.automatic_messages (
  id                          uuid        NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id                   uuid        NOT NULL,
  name                        text        NOT NULL,
  message                     text        NOT NULL,
  scheduled_interval_minutes  integer,
  scheduled_kanban_id         uuid,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT automatic_messages_pkey PRIMARY KEY (id),
  CONSTRAINT automatic_messages_tenant_id_fkey FOREIGN KEY (tenant_id)
    REFERENCES public.tenants(id) ON DELETE CASCADE,
  CONSTRAINT automatic_messages_scheduled_kanban_id_fkey FOREIGN KEY (scheduled_kanban_id)
    REFERENCES public.kanbans(id) ON DELETE SET NULL
);

ALTER TABLE public.automatic_messages ENABLE ROW LEVEL SECURITY;

CREATE SEQUENCE IF NOT EXISTS public.failed_registrations_id_seq
  START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE IF NOT EXISTS public.failed_registrations (
  id                bigint      NOT NULL DEFAULT nextval('failed_registrations_id_seq'::regclass),
  email             text        NOT NULL,
  created_at        timestamptz DEFAULT now(),
  created_resources jsonb       NOT NULL,
  cleanup_attempted boolean     DEFAULT false,
  cleanup_status    jsonb,
  error_message     text,
  notes             text,
  resolved_at       timestamptz,
  CONSTRAINT failed_registrations_pkey PRIMARY KEY (id)
);

ALTER TABLE public.failed_registrations ENABLE ROW LEVEL SECURITY;
-- ATENÇÃO: RLS habilitado mas SEM policies — tabela inacessível via RLS

-- ============================================================
-- ÍNDICES
-- ============================================================

-- tenants
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_evolution_instance_id_unique
  ON public.tenants (evolution_instance_id) WHERE evolution_instance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_subscription
  ON public.tenants (subscription_status);

-- users
CREATE INDEX IF NOT EXISTS idx_users_tenant
  ON public.users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email_tenant
  ON public.users (email, tenant_id);

-- kanbans
CREATE UNIQUE INDEX IF NOT EXISTS idx_kanbans_unique_is_main_per_tenant
  ON public.kanbans (tenant_id, is_main) WHERE is_main = true;
CREATE INDEX IF NOT EXISTS idx_kanbans_tenant_order
  ON public.kanbans (tenant_id, order_position);
CREATE INDEX IF NOT EXISTS idx_kanbans_main_tenant
  ON public.kanbans (tenant_id) WHERE is_main = true;

-- columns
CREATE INDEX IF NOT EXISTS idx_columns_kanban_order
  ON public.columns (kanban_id, order_position);

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_tenant
  ON public.contacts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_tenant
  ON public.contacts (phone, tenant_id);

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status
  ON public.conversations (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_kanban_column
  ON public.conversations (kanban_id, column_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON public.conversations (last_message_at DESC NULLS LAST);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at DESC);

-- automatic_messages
CREATE INDEX IF NOT EXISTS idx_automatic_messages_tenant
  ON public.automatic_messages (tenant_id);

-- failed_registrations
CREATE INDEX IF NOT EXISTS failed_registrations_email_idx
  ON public.failed_registrations (email);
CREATE INDEX IF NOT EXISTS failed_registrations_created_at_idx
  ON public.failed_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS failed_registrations_resolved_at_idx
  ON public.failed_registrations (resolved_at) WHERE resolved_at IS NULL;

-- ============================================================
-- FUNÇÃO: rls_auto_enable (event trigger)
-- Habilita RLS automaticamente em novas tabelas criadas no schema public
-- ============================================================

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public')
        AND cmd.schema_name NOT IN ('pg_catalog','information_schema')
        AND cmd.schema_name NOT LIKE 'pg_toast%'
        AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (schema não enforçado: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- MIGRAÇÕES APLICADAS
-- ============================================================
-- 20260402025734 — create_core_schema_v3
-- 20260402030054 — add_rls_policies
-- 20260403024916 — fix_users_rls_policy_to_auth_uid
-- 20260404191826 — create_failed_registrations
-- 20260407022056 — fix_rls_tenant_id_claim_with_cast
-- 20260408021733 — add_kanbans_is_main_unique_constraint
-- 20260413014555 — update_tenants_connection_status_and_add_unique_constraint
-- 20260413144601 — add_qr_code_to_tenants
-- 20260413171746 — add_evolution_instance_token
-- 20260416085155 — create_custom_access_token_hook
-- 20260416092722 — fix_custom_access_token_hook
-- 20260416093514 — fix_rls_use_app_metadata
-- 20260416192121 — drop_test_user_access_view
-- 20260416192125 — disable_rls_failed_registrations
-- 20260416192127 — fix_users_rls_auth_uid_initplan_drop
-- 20260416192130 — fix_users_rls_auth_uid_initplan_create
