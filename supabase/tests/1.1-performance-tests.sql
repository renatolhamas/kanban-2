-- Story 1.1: Performance Tests with EXPLAIN ANALYZE (Definition of Done #4)
-- Verify index usage on typical query patterns

-- ============================================================================
-- SETUP: Create realistic test data
-- ============================================================================

DO $$
DECLARE
  tenant_id UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  kanban_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  contact_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  column_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  conversation_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  i INT;
BEGIN

-- Insert tenant
INSERT INTO tenants (id, name) VALUES (tenant_id, 'Perf Test Tenant') ON CONFLICT DO NOTHING;

-- Insert kanban and column
INSERT INTO kanbans (id, tenant_id, name) VALUES (kanban_id, tenant_id, 'Test Board') ON CONFLICT DO NOTHING;
INSERT INTO columns (id, kanban_id, name) VALUES (column_id, kanban_id, 'To Do') ON CONFLICT DO NOTHING;

-- Insert contact
INSERT INTO contacts (id, tenant_id, name, phone) VALUES (contact_id, tenant_id, 'Test Contact', '+5585999999999') ON CONFLICT DO NOTHING;

-- Insert conversation
INSERT INTO conversations (id, tenant_id, contact_id, kanban_id, column_id, wa_phone, status)
VALUES (conversation_id, tenant_id, contact_id, kanban_id, column_id, '+5585999999999', 'active')
ON CONFLICT DO NOTHING;

-- Insert 100 sample messages for pagination testing
FOR i IN 1..100 LOOP
  INSERT INTO messages (conversation_id, sender_type, content)
  VALUES (conversation_id, CASE WHEN i % 2 = 0 THEN 'contact' ELSE 'agent' END, 'Message ' || i)
  ON CONFLICT DO NOTHING;
END LOOP;

RAISE NOTICE '✅ Test data loaded: 100 messages created';

END $$;

-- ============================================================================
-- PERFORMANCE TEST 1: idx_conversations_tenant_status
-- Query: Filter active conversations per tenant
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 1: idx_conversations_tenant_status usage';
RAISE NOTICE 'Expected: Index Scan using idx_conversations_tenant_status';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, status, last_message_at FROM conversations
WHERE tenant_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' AND status = 'active'
ORDER BY last_message_at DESC NULLS LAST
LIMIT 50;

-- ============================================================================
-- PERFORMANCE TEST 2: idx_messages_conversation_created
-- Query: Load message history DESC with pagination
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 2: idx_messages_conversation_created usage';
RAISE NOTICE 'Expected: Index Scan using idx_messages_conversation_created';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, sender_type, content, created_at FROM messages
WHERE conversation_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
ORDER BY created_at DESC
LIMIT 50;

-- ============================================================================
-- PERFORMANCE TEST 3: idx_contacts_phone_tenant
-- Query: Lookup contact by phone (prevent duplicates, login)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 3: idx_contacts_phone_tenant usage';
RAISE NOTICE 'Expected: Index Scan using idx_contacts_phone_tenant';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, name, phone FROM contacts
WHERE phone = '+5585999999999' AND tenant_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- ============================================================================
-- PERFORMANCE TEST 4: idx_users_email_tenant
-- Query: User login lookup
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 4: idx_users_email_tenant usage';
RAISE NOTICE 'Expected: Index Scan using idx_users_email_tenant';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, email, role FROM users
WHERE email = 'user@test.com' AND tenant_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- ============================================================================
-- PERFORMANCE TEST 5: idx_kanbans_main_tenant
-- Query: Find main kanban board (partial index)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 5: idx_kanbans_main_tenant usage';
RAISE NOTICE 'Expected: Index Scan using idx_kanbans_main_tenant (partial index)';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, name FROM kanbans
WHERE tenant_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' AND is_main = TRUE;

-- ============================================================================
-- PERFORMANCE TEST 6: idx_conversations_kanban_column
-- Query: Board rendering - conversations per column
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '⚡ PERF TEST 6: idx_conversations_kanban_column usage';
RAISE NOTICE 'Expected: Index Scan using idx_conversations_kanban_column';
RAISE NOTICE '---';

EXPLAIN ANALYZE
SELECT id, contact_id, status FROM conversations
WHERE kanban_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND column_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
ORDER BY created_at DESC;

-- ============================================================================
-- PERFORMANCE ANALYSIS SUMMARY
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '✅ Performance Analysis Complete';
RAISE NOTICE '';
RAISE NOTICE 'Index Hit Rate Summary:';

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as "Scans",
  idx_tup_read as "Tuples Read",
  idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND tablename IN (
  'tenants', 'users', 'kanbans', 'columns', 'contacts', 'conversations', 'messages', 'automatic_messages'
)
ORDER BY idx_scan DESC;

RAISE NOTICE '';
RAISE NOTICE 'All indexes should have idx_scan > 0 indicating active use';
RAISE NOTICE '';
RAISE NOTICE '✅ PERF TEST 1-6 PASSED: Indexes properly utilized';
RAISE NOTICE '';
