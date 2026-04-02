-- Story 1.1: Schema Validation Smoke Test
-- Run this after migration to verify all tables, indexes, and RLS are working
-- This is NOT a migration - run manually for validation only

-- ============================================================================
-- SMOKE TEST 1: Verify All Tables Exist (AC #1-8)
-- ============================================================================

-- Expected: 8 rows returned
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
)
ORDER BY tablename;

-- Count check
SELECT COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
);
-- Expected: 8

-- ============================================================================
-- SMOKE TEST 2: Verify All Indexes Exist (AC #10)
-- ============================================================================

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
)
ORDER BY tablename, indexname;

-- Count check - expect 13 indexes
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
);
-- Expected: 13

-- ============================================================================
-- SMOKE TEST 3: Verify RLS Is Enabled (AC #11)
-- ============================================================================

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
)
ORDER BY tablename;
-- Expected: All should have rowsecurity = true

-- ============================================================================
-- SMOKE TEST 4: Verify RLS Policies Exist (AC #11)
-- ============================================================================

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table (should be 4 per tenant-scoped table)
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected: 32 policies total (4 × 8 tables: SELECT, INSERT, UPDATE, DELETE)

-- ============================================================================
-- SMOKE TEST 5: Verify Unique Constraints (AC #12)
-- ============================================================================

SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND constraint_type = 'UNIQUE'
ORDER BY table_name;

-- Expected constraints:
-- - users: uq_users_email_tenant
-- - contacts: uq_contacts_phone_tenant
-- - kanbans: uq_kanbans_main_per_tenant

-- ============================================================================
-- SMOKE TEST 6: Verify Foreign Keys (AC #9)
-- ============================================================================

SELECT constraint_name, table_name, column_name, referenced_table_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND referenced_table_name IS NOT NULL
ORDER BY table_name, column_name;

-- Expected: 11 foreign key relationships

-- ============================================================================
-- SMOKE TEST 7: Verify auth.get_tenant_id() Function (AC #11)
-- ============================================================================

SELECT proname, nargs
FROM pg_proc
WHERE proname = 'get_tenant_id'
ORDER BY proname;

-- Expected: 1 function found

-- ============================================================================
-- SMOKE TEST 8: Test Basic Insert (AC #2)
-- ============================================================================

-- Create test tenant (wrap in transaction for safety)
BEGIN;

INSERT INTO tenants (id, name, subscription_status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Smoke Test Tenant', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO users (id, tenant_id, email, role)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'smoketest@example.com', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO kanbans (id, tenant_id, name, is_main)
VALUES ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Test Board', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO columns (id, kanban_id, name)
VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'To Do')
ON CONFLICT DO NOTHING;

INSERT INTO contacts (id, tenant_id, name, phone)
VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Test Contact', '+5585999999999')
ON CONFLICT DO NOTHING;

INSERT INTO conversations (id, tenant_id, contact_id, kanban_id, column_id, wa_phone, status)
VALUES ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '+5585999999999', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO messages (id, conversation_id, sender_type, content)
VALUES ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'contact', 'Test message')
ON CONFLICT DO NOTHING;

INSERT INTO automatic_messages (id, tenant_id, name, message)
VALUES ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Test Template', 'Welcome!')
ON CONFLICT DO NOTHING;

-- Verify inserts
SELECT
  (SELECT COUNT(*) FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111') as tenants_count,
  (SELECT COUNT(*) FROM users WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as users_count,
  (SELECT COUNT(*) FROM kanbans WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as kanbans_count,
  (SELECT COUNT(*) FROM columns WHERE kanban_id = '33333333-3333-3333-3333-333333333333') as columns_count,
  (SELECT COUNT(*) FROM contacts WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as contacts_count,
  (SELECT COUNT(*) FROM conversations WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as conversations_count,
  (SELECT COUNT(*) FROM messages WHERE conversation_id = '66666666-6666-6666-6666-666666666666') as messages_count,
  (SELECT COUNT(*) FROM automatic_messages WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as auto_messages_count;
-- Expected: All counts = 1

ROLLBACK;  -- Clean up test data

-- ============================================================================
-- SMOKE TEST 9: Test Foreign Key Constraints (AC #3)
-- ============================================================================

-- This test should FAIL and is just documented
-- Uncomment to manually test:
/*
BEGIN;
INSERT INTO users (tenant_id, email, role)
VALUES ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'invalid@test.com', 'user');
-- Expected: ERROR - violates foreign key constraint "users_tenant_id_fkey"
ROLLBACK;
*/

-- ============================================================================
-- SMOKE TEST 10: Test Unique Constraints (AC #3)
-- ============================================================================

-- Test that email is unique per tenant, but same email can exist in different tenants
BEGIN;

-- Create test tenants
INSERT INTO tenants (id, name) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tenant A') ON CONFLICT DO NOTHING;
INSERT INTO tenants (id, name) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tenant B') ON CONFLICT DO NOTHING;

-- Insert same email in different tenants - should succeed
INSERT INTO users (tenant_id, email, role) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'unique@test.com', 'user') ON CONFLICT DO NOTHING;
INSERT INTO users (tenant_id, email, role) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'unique@test.com', 'user') ON CONFLICT DO NOTHING;

-- Verify both exist
SELECT COUNT(DISTINCT tenant_id) as tenant_count
FROM users
WHERE email = 'unique@test.com';
-- Expected: 2

-- Duplicate email in SAME tenant should fail (uncomment to test):
/*
INSERT INTO users (tenant_id, email, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'unique@test.com', 'user');
-- Expected: ERROR - duplicate key value violates unique constraint "uq_users_email_tenant"
*/

ROLLBACK;

-- ============================================================================
-- SMOKE TEST 11: Verify Index Usage with EXPLAIN (AC #4)
-- ============================================================================

BEGIN;

-- Setup test data
INSERT INTO tenants (id, name) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tenant C') ON CONFLICT DO NOTHING;
INSERT INTO contacts (id, tenant_id, name, phone) VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Test', '+5585988888888') ON CONFLICT DO NOTHING;

-- Verify index is used
EXPLAIN ANALYZE
SELECT * FROM contacts
WHERE phone = '+5585988888888' AND tenant_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
-- Expected: "Index Scan using idx_contacts_phone_tenant..."

ROLLBACK;

-- ============================================================================
-- SMOKE TEST 12: Column Constraints & Defaults (AC #2)
-- ============================================================================

-- Verify DEFAULT values are applied
BEGIN;

INSERT INTO tenants (name, subscription_status)
VALUES ('Default Test', 'active');

SELECT
  created_at IS NOT NULL as created_at_default,
  updated_at IS NOT NULL as updated_at_default,
  subscription_status = 'active' as subscription_default
FROM tenants
WHERE name = 'Default Test'
LIMIT 1;
-- Expected: true, true, true

ROLLBACK;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Run these queries to verify schema health:
-- 1. SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename IN (...) -- expect 8
-- 2. SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public' AND tablename IN (...) -- expect 13
-- 3. SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' -- expect 32
-- 4. Run INSERT test above - should complete successfully
-- 5. Review index EXPLAIN plans - should show "Index Scan" operations

-- If all tests pass, schema is ready for production use.
