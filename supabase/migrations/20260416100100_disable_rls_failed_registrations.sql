-- Migration: Disable RLS on failed_registrations table
-- Date: 2026-04-16
-- Reason: Table is system-internal (audit logs), accessed only via service_role (backend)
-- Detail: RLS was enabled but no policies existed, making table inaccessible to regular users
--         This was by accident — the table should not be user-facing anyway

ALTER TABLE public.failed_registrations DISABLE ROW LEVEL SECURITY;

-- Verification
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'failed_registrations';
-- Expected: relrowsecurity = false
