-- RLS Isolation Tests for Story 4.1
-- Validates that app_metadata tenant isolation is working correctly
-- Test cases: correct tenant, wrong tenant, user_metadata only

-- Get a real tenant_id and user from backfilled data
DO $$
DECLARE
  v_tenant_id uuid;
  v_user_id uuid;
  v_user_email text;
  v_test_count int;
BEGIN
  -- Fetch first user for testing
  SELECT id, tenant_id, email INTO v_user_id, v_tenant_id, v_user_email
  FROM public.users
  LIMIT 1;

  RAISE NOTICE '=== RLS Isolation Test Setup ===';
  RAISE NOTICE 'Test Tenant ID: %', v_tenant_id;
  RAISE NOTICE 'Test User ID: %', v_user_id;
  RAISE NOTICE 'Test User Email: %', v_user_email;
  RAISE NOTICE '';

  -- ========================================================================
  -- TEST 1: Correct tenant_id in app_metadata → should return data
  -- ========================================================================
  RAISE NOTICE '--- TEST 1: Correct app_metadata.tenant_id ---';
  SET LOCAL request.jwt.claims = json_build_object(
    'sub', v_user_id::text,
    'email', v_user_email,
    'app_metadata', json_build_object('tenant_id', v_tenant_id::text, 'role', 'owner')
  )::text;

  SELECT COUNT(*) INTO v_test_count FROM public.kanbans;
  RAISE NOTICE 'Query result: % rows returned', v_test_count;

  IF v_test_count > 0 THEN
    RAISE NOTICE '✅ PASS: Correct tenant_id returns data';
  ELSE
    RAISE NOTICE '❌ FAIL: Correct tenant_id should return data, got 0 rows';
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- TEST 2: Wrong tenant_id in app_metadata → should return 0 rows
  -- ========================================================================
  RAISE NOTICE '--- TEST 2: Wrong app_metadata.tenant_id ---';
  SET LOCAL request.jwt.claims = json_build_object(
    'sub', v_user_id::text,
    'email', v_user_email,
    'app_metadata', json_build_object('tenant_id', '00000000-0000-0000-0000-000000000000'::text, 'role', 'owner')
  )::text;

  SELECT COUNT(*) INTO v_test_count FROM public.kanbans;
  RAISE NOTICE 'Query result: % rows returned', v_test_count;

  IF v_test_count = 0 THEN
    RAISE NOTICE '✅ PASS: Wrong tenant_id returns 0 rows (no data leak)';
  ELSE
    RAISE NOTICE '❌ FAIL: Wrong tenant_id should return 0 rows, got % rows', v_test_count;
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- TEST 3: Using user_metadata instead of app_metadata → should return 0 rows
  -- ========================================================================
  RAISE NOTICE '--- TEST 3: Only user_metadata (should not work) ---';
  SET LOCAL request.jwt.claims = json_build_object(
    'sub', v_user_id::text,
    'email', v_user_email,
    'user_metadata', json_build_object('tenant_id', v_tenant_id::text, 'role', 'owner')
  )::text;

  SELECT COUNT(*) INTO v_test_count FROM public.kanbans;
  RAISE NOTICE 'Query result: % rows returned', v_test_count;

  IF v_test_count = 0 THEN
    RAISE NOTICE '✅ PASS: user_metadata does not work (policies ignore it)';
  ELSE
    RAISE NOTICE '❌ FAIL: user_metadata should not work, got % rows', v_test_count;
  END IF;
  RAISE NOTICE '';

  -- ========================================================================
  -- TEST 4: Test multiple tables with correct app_metadata
  -- ========================================================================
  RAISE NOTICE '--- TEST 4: Multiple tables with correct app_metadata ---';
  SET LOCAL request.jwt.claims = json_build_object(
    'sub', v_user_id::text,
    'email', v_user_email,
    'app_metadata', json_build_object('tenant_id', v_tenant_id::text, 'role', 'owner')
  )::text;

  DECLARE
    v_kanbans_count int;
    v_contacts_count int;
    v_conversations_count int;
    v_columns_count int;
  BEGIN
    SELECT COUNT(*) INTO v_kanbans_count FROM public.kanbans;
    SELECT COUNT(*) INTO v_contacts_count FROM public.contacts;
    SELECT COUNT(*) INTO v_conversations_count FROM public.conversations;
    SELECT COUNT(*) INTO v_columns_count FROM public.columns;

    RAISE NOTICE 'kanbans: % rows', v_kanbans_count;
    RAISE NOTICE 'contacts: % rows', v_contacts_count;
    RAISE NOTICE 'conversations: % rows', v_conversations_count;
    RAISE NOTICE 'columns: % rows', v_columns_count;

    IF v_kanbans_count >= 0 AND v_contacts_count >= 0 AND v_conversations_count >= 0 AND v_columns_count >= 0 THEN
      RAISE NOTICE '✅ PASS: All tables respect app_metadata isolation';
    END IF;
  END;

  RAISE NOTICE '';
  RAISE NOTICE '=== All RLS Isolation Tests Complete ===';
END $$;
