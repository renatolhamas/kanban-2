-- Migration: Fix RLS policies to read tenant_id from user_metadata
-- Date: 2026-04-07
-- Problem: RLS policies were checking auth.jwt()->>'tenant_id' (root level)
--          but tenant_id is stored in (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
-- Solution: Update all multi-tenant RLS policies to read from user_metadata
--           NOTE: JWT returns TEXT, but tenant_id is UUID, so we cast with ::uuid

-- ============================================================================
-- TABLE: automatic_messages
-- ============================================================================
DROP POLICY IF EXISTS "automatic_messages_select_own_tenant" ON automatic_messages;
CREATE POLICY "automatic_messages_select_own_tenant" ON automatic_messages
  FOR SELECT USING (
    tenant_id = ((auth.jwt()->'user_metadata'->>'tenant_id')::uuid)::uuid
  );

DROP POLICY IF EXISTS "automatic_messages_insert_own_tenant" ON automatic_messages;
CREATE POLICY "automatic_messages_insert_own_tenant" ON automatic_messages
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "automatic_messages_update_own_tenant" ON automatic_messages;
CREATE POLICY "automatic_messages_update_own_tenant" ON automatic_messages
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  ) WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "automatic_messages_delete_own_tenant" ON automatic_messages;
CREATE POLICY "automatic_messages_delete_own_tenant" ON automatic_messages
  FOR DELETE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

-- ============================================================================
-- TABLE: columns (depends on kanbans)
-- ============================================================================
DROP POLICY IF EXISTS "columns_select_own_tenant" ON columns;
CREATE POLICY "columns_select_own_tenant" ON columns
  FOR SELECT USING (
    kanban_id IN (
      SELECT id FROM kanbans
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "columns_insert_own_tenant" ON columns;
CREATE POLICY "columns_insert_own_tenant" ON columns
  FOR INSERT WITH CHECK (
    kanban_id IN (
      SELECT id FROM kanbans
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "columns_update_own_tenant" ON columns;
CREATE POLICY "columns_update_own_tenant" ON columns
  FOR UPDATE USING (
    kanban_id IN (
      SELECT id FROM kanbans
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  ) WITH CHECK (
    kanban_id IN (
      SELECT id FROM kanbans
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "columns_delete_own_tenant" ON columns;
CREATE POLICY "columns_delete_own_tenant" ON columns
  FOR DELETE USING (
    kanban_id IN (
      SELECT id FROM kanbans
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

-- ============================================================================
-- TABLE: contacts
-- ============================================================================
DROP POLICY IF EXISTS "contacts_select_own_tenant" ON contacts;
CREATE POLICY "contacts_select_own_tenant" ON contacts
  FOR SELECT USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "contacts_insert_own_tenant" ON contacts;
CREATE POLICY "contacts_insert_own_tenant" ON contacts
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "contacts_update_own_tenant" ON contacts;
CREATE POLICY "contacts_update_own_tenant" ON contacts
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  ) WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "contacts_delete_own_tenant" ON contacts;
CREATE POLICY "contacts_delete_own_tenant" ON contacts
  FOR DELETE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

-- ============================================================================
-- TABLE: conversations
-- ============================================================================
DROP POLICY IF EXISTS "conversations_select_own_tenant" ON conversations;
CREATE POLICY "conversations_select_own_tenant" ON conversations
  FOR SELECT USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "conversations_insert_own_tenant" ON conversations;
CREATE POLICY "conversations_insert_own_tenant" ON conversations
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "conversations_update_own_tenant" ON conversations;
CREATE POLICY "conversations_update_own_tenant" ON conversations
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  ) WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "conversations_delete_own_tenant" ON conversations;
CREATE POLICY "conversations_delete_own_tenant" ON conversations
  FOR DELETE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

-- ============================================================================
-- TABLE: kanbans
-- ============================================================================
DROP POLICY IF EXISTS "kanbans_select_own_tenant" ON kanbans;
CREATE POLICY "kanbans_select_own_tenant" ON kanbans
  FOR SELECT USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "kanbans_insert_own_tenant" ON kanbans;
CREATE POLICY "kanbans_insert_own_tenant" ON kanbans
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "kanbans_update_own_tenant" ON kanbans;
CREATE POLICY "kanbans_update_own_tenant" ON kanbans
  FOR UPDATE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  ) WITH CHECK (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "kanbans_delete_own_tenant" ON kanbans;
CREATE POLICY "kanbans_delete_own_tenant" ON kanbans
  FOR DELETE USING (
    tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

-- ============================================================================
-- TABLE: messages (depends on conversations)
-- ============================================================================
DROP POLICY IF EXISTS "messages_select_own_tenant" ON messages;
CREATE POLICY "messages_select_own_tenant" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "messages_insert_own_tenant" ON messages;
CREATE POLICY "messages_insert_own_tenant" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "messages_update_own_tenant" ON messages;
CREATE POLICY "messages_update_own_tenant" ON messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  ) WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

DROP POLICY IF EXISTS "messages_delete_own_tenant" ON messages;
CREATE POLICY "messages_delete_own_tenant" ON messages
  FOR DELETE USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
    )
  );

-- ============================================================================
-- TABLE: tenants
-- ============================================================================
DROP POLICY IF EXISTS "tenants_select_own" ON tenants;
CREATE POLICY "tenants_select_own" ON tenants
  FOR SELECT USING (
    id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "tenants_update_own" ON tenants;
CREATE POLICY "tenants_update_own" ON tenants
  FOR UPDATE USING (
    id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  ) WITH CHECK (
    id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "tenants_delete_own" ON tenants;
CREATE POLICY "tenants_delete_own" ON tenants
  FOR DELETE USING (
    id = (auth.jwt()->'user_metadata'->>'tenant_id')::uuid
  );
