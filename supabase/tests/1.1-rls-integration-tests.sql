-- Story 1.1: RLS Cross-Tenant Isolation Tests (Definition of Done #3)
-- Execute with authenticated JWT bearer token for each tenant

-- ============================================================================
-- TEST SETUP: Create test data for 2 tenants
-- ============================================================================

-- RUN AS SERVICE_ROLE (can bypass RLS)

CREATE TEMP TABLE test_config AS
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as tenant_a_id,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as tenant_b_id,
  'user-a-uuid' as user_a_id,
  'user-b-uuid' as user_b_id;

INSERT INTO tenants (id, name) SELECT tenant_a_id, 'Tenant A' FROM test_config;
INSERT INTO tenants (id, name) SELECT tenant_b_id, 'Tenant B' FROM test_config;

INSERT INTO users (id, tenant_id, email, role, name)
SELECT user_a_id, tenant_a_id, 'user-a@test.com', 'admin', 'User A' FROM test_config;

INSERT INTO users (id, tenant_id, email, role, name)
SELECT user_b_id, tenant_b_id, 'user-b@test.com', 'admin', 'User B' FROM test_config;

INSERT INTO contacts (id, tenant_id, name, phone)
SELECT 'contact-a-uuid', tenant_a_id, 'Contact A', '+5585911111111' FROM test_config;

INSERT INTO contacts (id, tenant_id, name, phone)
SELECT 'contact-b-uuid', tenant_b_id, 'Contact B', '+5585922222222' FROM test_config;

-- ============================================================================
-- RLS TEST 1: Tenant A User Can See Own Tenant Data
-- ============================================================================

-- Authenticate as Tenant A user (with JWT tenant_id = tenant_a_id)

SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"user-a@test.com","role":"admin"}';

RAISE NOTICE '🧪 RLS TEST 1: Tenant A user viewing own tenant data...';

DECLARE
  row_count INT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM users WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  IF row_count = 0 THEN
    RAISE EXCEPTION 'RLS FAILED: Tenant A user cannot see own tenant data';
  END IF;

  RAISE NOTICE '✅ RLS TEST 1 PASSED: Tenant A user sees own data (% rows)', row_count;
END;

-- ============================================================================
-- RLS TEST 2: Tenant A User CANNOT See Tenant B Data (SELECT)
-- ============================================================================

RAISE NOTICE '🧪 RLS TEST 2: Tenant A user attempting to see Tenant B data...';

DECLARE
  row_count INT;
BEGIN
  -- Set JWT to Tenant A
  SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

  -- Try to SELECT Tenant B data - should return 0 rows due to RLS
  SELECT COUNT(*) INTO row_count FROM users WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS BYPASS VULNERABILITY: Tenant A can see Tenant B data!';
  END IF;

  RAISE NOTICE '✅ RLS TEST 2 PASSED: Tenant A user blocked from seeing Tenant B data (SELECT returned 0)';
END;

-- ============================================================================
-- RLS TEST 3: Tenant A User CANNOT UPDATE Tenant B Data
-- ============================================================================

RAISE NOTICE '🧪 RLS TEST 3: Tenant A user attempting to UPDATE Tenant B data...';

DECLARE
  rows_affected INT;
BEGIN
  -- Set JWT to Tenant A
  SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

  -- Try to UPDATE Tenant B data
  UPDATE contacts SET name = 'HACKED'
  WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  IF rows_affected > 0 THEN
    RAISE EXCEPTION 'RLS BYPASS VULNERABILITY: Tenant A can UPDATE Tenant B data!';
  END IF;

  RAISE NOTICE '✅ RLS TEST 3 PASSED: Tenant A UPDATE blocked (affected 0 rows)';
END;

-- ============================================================================
-- RLS TEST 4: Tenant A User CANNOT DELETE Tenant B Data
-- ============================================================================

RAISE NOTICE '🧪 RLS TEST 4: Tenant A user attempting to DELETE Tenant B data...';

DECLARE
  rows_affected INT;
BEGIN
  -- Set JWT to Tenant A
  SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

  -- Try to DELETE Tenant B data
  DELETE FROM contacts WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  IF rows_affected > 0 THEN
    RAISE EXCEPTION 'RLS BYPASS VULNERABILITY: Tenant A can DELETE Tenant B data!';
  END IF;

  RAISE NOTICE '✅ RLS TEST 4 PASSED: Tenant A DELETE blocked (affected 0 rows)';
END;

-- ============================================================================
-- RLS TEST 5: Nested RLS - Conversations Access Control
-- ============================================================================

-- Setup conversations for both tenants (as service role)

INSERT INTO kanbans (id, tenant_id, name)
VALUES ('kanban-a-uuid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Board A');

INSERT INTO kanbans (id, tenant_id, name)
VALUES ('kanban-b-uuid', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Board B');

INSERT INTO columns (id, kanban_id, name)
VALUES ('column-a-uuid', 'kanban-a-uuid', 'To Do');

INSERT INTO columns (id, kanban_id, name)
VALUES ('column-b-uuid', 'kanban-b-uuid', 'To Do');

INSERT INTO conversations (id, tenant_id, contact_id, kanban_id, column_id, wa_phone, status)
VALUES ('conv-a-uuid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'contact-a-uuid', 'kanban-a-uuid', 'column-a-uuid', '+5585911111111', 'active');

INSERT INTO conversations (id, tenant_id, contact_id, kanban_id, column_id, wa_phone, status)
VALUES ('conv-b-uuid', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'contact-b-uuid', 'kanban-b-uuid', 'column-b-uuid', '+5585922222222', 'active');

RAISE NOTICE '🧪 RLS TEST 5: Testing nested RLS on conversations...';

DECLARE
  row_count INT;
BEGIN
  -- Set JWT to Tenant A
  SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

  -- Tenant A should see own conversations
  SELECT COUNT(*) INTO row_count FROM conversations WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  IF row_count = 0 THEN
    RAISE EXCEPTION 'RLS FAILED: Tenant A cannot see own conversations';
  END IF;

  -- Tenant A should NOT see Tenant B conversations
  SELECT COUNT(*) INTO row_count FROM conversations WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS BYPASS: Tenant A can see Tenant B conversations!';
  END IF;

  RAISE NOTICE '✅ RLS TEST 5 PASSED: Nested RLS on conversations working';
END;

-- ============================================================================
-- RLS TEST 6: Deep Nesting - Messages Access Control
-- ============================================================================

INSERT INTO messages (id, conversation_id, sender_type, content)
VALUES ('msg-a-uuid', 'conv-a-uuid', 'contact', 'Message from A');

INSERT INTO messages (id, conversation_id, sender_type, content)
VALUES ('msg-b-uuid', 'conv-b-uuid', 'contact', 'Message from B');

RAISE NOTICE '🧪 RLS TEST 6: Testing deep nested RLS on messages...';

DECLARE
  row_count INT;
BEGIN
  -- Set JWT to Tenant A
  SET request.jwt.claims = '{"sub":"user-a-uuid","tenant_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}';

  -- Tenant A should see own messages (via conversation FK)
  SELECT COUNT(*) INTO row_count FROM messages
  WHERE conversation_id IN (SELECT id FROM conversations WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

  IF row_count = 0 THEN
    RAISE EXCEPTION 'RLS FAILED: Tenant A cannot see own messages';
  END IF;

  -- Tenant A should NOT see Tenant B messages
  SELECT COUNT(*) INTO row_count FROM messages
  WHERE conversation_id IN (SELECT id FROM conversations WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS BYPASS: Tenant A can see Tenant B messages!';
  END IF;

  RAISE NOTICE '✅ RLS TEST 6 PASSED: Deep nested RLS on messages working';
END;

-- ============================================================================
-- CLEANUP
-- ============================================================================

RAISE NOTICE '✅ All RLS integration tests passed!';
RAISE NOTICE 'RLS isolation is correctly preventing cross-tenant data access';

DROP TABLE test_config;
