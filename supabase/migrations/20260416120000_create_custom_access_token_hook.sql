-- Create Custom Access Token Hook for RLS Multi-Tenant Isolation
-- This hook ensures that app_metadata.tenant_id and app_metadata.role are always
-- injected from the database (users table) into the JWT, not from user_metadata (which is editable)
--
-- Purpose: Prevent tenant isolation bypass by using immutable app_metadata instead of user_editable user_metadata
-- Reference: Story 4.1 — Correção do Isolamento Multi-Tenant via RLS

-- Function: public.custom_access_token_hook
-- This function is called by Supabase Auth when generating a JWT
-- Input: event JSONB containing user_id, user data, etc.
-- Output: Modified event JSONB with app_metadata.tenant_id and app_metadata.role injected
-- Behavior on Error: STRICT — raises exception, login fails with error (no partial JWT emitted)

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
  user_role TEXT;
  claims JSONB;
BEGIN
  -- Extract claims from event
  claims := event -> 'claims';

  -- Fetch tenant_id and role from users table
  -- STRICT: If query fails (user not found, DB down, etc.) exception is raised
  BEGIN
    SELECT tenant_id, role INTO user_tenant_id, user_role
    FROM public.users
    WHERE id = (claims ->> 'sub')::uuid;

    IF user_tenant_id IS NULL THEN
      RAISE EXCEPTION 'User not found or missing tenant_id for user_id: %', claims ->> 'sub';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- STRICT mode: any error raises exception, login fails
    RAISE EXCEPTION 'custom_access_token_hook failed to fetch user data: %', SQLERRM;
  END;

  -- Inject tenant_id and role into app_metadata
  -- This overwrites any existing app_metadata values (database is source of truth)
  claims := COALESCE(claims -> 'app_metadata', '{}'::jsonb) ||
    jsonb_build_object(
      'tenant_id', user_tenant_id::text,
      'role', user_role
    );

  -- Update claims in event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;

EXCEPTION WHEN OTHERS THEN
  -- STRICT: any unhandled error raises exception
  RAISE EXCEPTION 'custom_access_token_hook fatal error: %', SQLERRM;
END;
$$;

-- Grant execute permission to supabase_auth_admin role only
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Revoke from other roles for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon, authenticated;

-- Add comment documenting the hook
COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
'Custom JWT hook that injects app_metadata.tenant_id and app_metadata.role from the users table.
Ensures tenant isolation is enforced by the database, not by editable user_metadata.
STRICT behavior: raises exception on any error, failing login safely.
Must be enabled in Supabase Dashboard > Authentication > Hooks > Custom Access Token Hook.
Source: Story 4.1';
