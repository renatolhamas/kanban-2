-- Migration: Drop test_user_access view
-- Date: 2026-04-16
-- Reason: Security fix — SECURITY DEFINER view bypasses RLS policies
-- Detail: View was executing with superadmin permissions, allowing any authenticated user
--         to see data from all tenants, violating multi-tenant isolation

DROP VIEW IF EXISTS public.test_user_access;

-- Verification
-- SELECT * FROM information_schema.views WHERE table_name = 'test_user_access';
-- Expected: 0 rows
