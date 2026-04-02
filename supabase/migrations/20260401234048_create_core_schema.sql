-- Story 1.1: Database Schema Creation
-- Multi-tenant PostgreSQL schema for WhatsApp Kanban application
-- Created: 2026-04-01
-- Migration: Create 8 core tables with RLS, indexes, and constraints

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to extract tenant_id from JWT payload
CREATE OR REPLACE FUNCTION auth.get_tenant_id()
RETURNS UUID AS $$
  SELECT (auth.jwt()->>'tenant_id')::UUID;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. TENANTS TABLE - Root entity for multi-tenancy
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled')),
  evolution_instance_id TEXT UNIQUE,
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. USERS TABLE - Tenant-scoped users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  name TEXT,
  password_hash TEXT, -- Nullable for future OAuth support
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. KANBANS TABLE - Kanban boards per tenant
CREATE TABLE IF NOT EXISTS kanbans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  order_position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. COLUMNS TABLE - Kanban board columns (stages)
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kanban_id UUID NOT NULL REFERENCES kanbans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. CONTACTS TABLE - WhatsApp contacts per tenant
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL, -- E.164 format
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. CONVERSATIONS TABLE - WhatsApp conversations (contact × kanban board)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  kanban_id UUID REFERENCES kanbans(id) ON DELETE SET NULL,
  column_id UUID REFERENCES columns(id) ON DELETE SET NULL,
  wa_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 7. MESSAGES TABLE - WhatsApp conversation messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('contact', 'agent', 'system')),
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 8. AUTOMATIC_MESSAGES TABLE - Scheduled/automatic messages
CREATE TABLE IF NOT EXISTS automatic_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_interval_minutes INT,
  scheduled_kanban_id UUID REFERENCES kanbans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

ALTER TABLE users ADD CONSTRAINT uq_users_email_tenant UNIQUE (email, tenant_id);
ALTER TABLE contacts ADD CONSTRAINT uq_contacts_phone_tenant UNIQUE (phone, tenant_id);
ALTER TABLE kanbans ADD CONSTRAINT uq_kanbans_main_per_tenant UNIQUE (tenant_id) WHERE is_main = TRUE;

-- ============================================================================
-- INDEXES - Performance optimization per access patterns
-- ============================================================================

-- Tenants indexes
CREATE INDEX idx_tenants_subscription ON tenants(subscription_status);

-- Users indexes
CREATE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);

-- Kanbans indexes
CREATE INDEX idx_kanbans_main_tenant ON kanbans(tenant_id) WHERE is_main = TRUE;
CREATE INDEX idx_kanbans_tenant_order ON kanbans(tenant_id, order_position);

-- Columns indexes
CREATE INDEX idx_columns_kanban_order ON columns(kanban_id, order_position);

-- Contacts indexes
CREATE INDEX idx_contacts_phone_tenant ON contacts(phone, tenant_id);
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);

-- Conversations indexes (critical for board rendering and filtering)
CREATE INDEX idx_conversations_tenant_status ON conversations(tenant_id, status);
CREATE INDEX idx_conversations_kanban_column ON conversations(kanban_id, column_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- Messages indexes (critical for message history)
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Automatic messages indexes
CREATE INDEX idx_automatic_messages_tenant ON automatic_messages(tenant_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenant data isolation
-- ============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanbans ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automatic_messages ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: tenants table
CREATE POLICY "tenants_select_own" ON tenants
  FOR SELECT USING (id = auth.get_tenant_id());

CREATE POLICY "tenants_update_own" ON tenants
  FOR UPDATE USING (id = auth.get_tenant_id());

CREATE POLICY "tenants_delete_own" ON tenants
  FOR DELETE USING (id = auth.get_tenant_id());

-- RLS POLICIES: users table (access own tenant's users)
CREATE POLICY "users_select_own_tenant" ON users
  FOR SELECT USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "users_update_own_tenant" ON users
  FOR UPDATE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "users_delete_own_tenant" ON users
  FOR DELETE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "users_insert_own_tenant" ON users
  FOR INSERT WITH CHECK (tenant_id = auth.get_tenant_id());

-- RLS POLICIES: kanbans table
CREATE POLICY "kanbans_select_own_tenant" ON kanbans
  FOR SELECT USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "kanbans_update_own_tenant" ON kanbans
  FOR UPDATE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "kanbans_delete_own_tenant" ON kanbans
  FOR DELETE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "kanbans_insert_own_tenant" ON kanbans
  FOR INSERT WITH CHECK (tenant_id = auth.get_tenant_id());

-- RLS POLICIES: columns table (access via kanban's tenant_id)
CREATE POLICY "columns_select_own_tenant" ON columns
  FOR SELECT USING (
    kanban_id IN (
      SELECT id FROM kanbans WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "columns_update_own_tenant" ON columns
  FOR UPDATE USING (
    kanban_id IN (
      SELECT id FROM kanbans WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "columns_delete_own_tenant" ON columns
  FOR DELETE USING (
    kanban_id IN (
      SELECT id FROM kanbans WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "columns_insert_own_tenant" ON columns
  FOR INSERT WITH CHECK (
    kanban_id IN (
      SELECT id FROM kanbans WHERE tenant_id = auth.get_tenant_id()
    )
  );

-- RLS POLICIES: contacts table
CREATE POLICY "contacts_select_own_tenant" ON contacts
  FOR SELECT USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "contacts_update_own_tenant" ON contacts
  FOR UPDATE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "contacts_delete_own_tenant" ON contacts
  FOR DELETE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "contacts_insert_own_tenant" ON contacts
  FOR INSERT WITH CHECK (tenant_id = auth.get_tenant_id());

-- RLS POLICIES: conversations table
CREATE POLICY "conversations_select_own_tenant" ON conversations
  FOR SELECT USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "conversations_update_own_tenant" ON conversations
  FOR UPDATE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "conversations_delete_own_tenant" ON conversations
  FOR DELETE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "conversations_insert_own_tenant" ON conversations
  FOR INSERT WITH CHECK (tenant_id = auth.get_tenant_id());

-- RLS POLICIES: messages table (access via conversation's tenant_id)
CREATE POLICY "messages_select_own_tenant" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "messages_update_own_tenant" ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "messages_delete_own_tenant" ON messages
  FOR DELETE USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE tenant_id = auth.get_tenant_id()
    )
  );

CREATE POLICY "messages_insert_own_tenant" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE tenant_id = auth.get_tenant_id()
    )
  );

-- RLS POLICIES: automatic_messages table
CREATE POLICY "automatic_messages_select_own_tenant" ON automatic_messages
  FOR SELECT USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "automatic_messages_update_own_tenant" ON automatic_messages
  FOR UPDATE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "automatic_messages_delete_own_tenant" ON automatic_messages
  FOR DELETE USING (tenant_id = auth.get_tenant_id());

CREATE POLICY "automatic_messages_insert_own_tenant" ON automatic_messages
  FOR INSERT WITH CHECK (tenant_id = auth.get_tenant_id());

-- ============================================================================
-- COMMENTS - Documentation
-- ============================================================================

COMMENT ON TABLE tenants IS 'Root entity for multi-tenancy - each tenant is an isolated organization';
COMMENT ON TABLE users IS 'Tenant-scoped users - each user belongs to exactly one tenant';
COMMENT ON TABLE kanbans IS 'Kanban boards per tenant - primary board has is_main = TRUE';
COMMENT ON TABLE columns IS 'Stages/columns within a kanban board';
COMMENT ON TABLE contacts IS 'WhatsApp contacts - phone is unique per tenant';
COMMENT ON TABLE conversations IS 'WhatsApp conversations - links contact to kanban column';
COMMENT ON TABLE messages IS 'Message history - sender_type can be contact, agent, or system';
COMMENT ON TABLE automatic_messages IS 'Templates for automatic/scheduled messages';

COMMENT ON COLUMN users.password_hash IS 'Nullable to support future OAuth/SSO integration';
COMMENT ON COLUMN conversations.kanban_id IS 'Nullable - conversation survives kanban deletion';
COMMENT ON COLUMN conversations.column_id IS 'Nullable - conversation survives column deletion';
COMMENT ON COLUMN conversations.last_message_at IS 'Nullable until first message';
COMMENT ON COLUMN automatic_messages.scheduled_kanban_id IS 'Nullable - template can apply to all boards';
