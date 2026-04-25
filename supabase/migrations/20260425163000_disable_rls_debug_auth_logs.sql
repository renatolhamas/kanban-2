-- Migration: Disable RLS on debug_auth_logs table
-- Description: debug_auth_logs is an internal audit table for the custom_access_token_hook
-- RLS was enabled automatically by rls_auto_enable event trigger but no policies were created
-- This caused all queries to be blocked. Disabling RLS is safe since this table is internal.

ALTER TABLE public.debug_auth_logs DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.debug_auth_logs IS 'Internal audit table for JWT authentication hook events. RLS disabled as this is system-internal, not exposed via API.';
