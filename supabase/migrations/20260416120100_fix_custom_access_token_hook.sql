-- Fix Custom Access Token Hook - Deep Merge for app_metadata
-- Problem: Previous version was overwriting entire claims object, losing required JWT fields
-- Solution: Use jsonb_set with nested path to merge only app_metadata within claims
--
-- Reference: Story 4.1 — Correção do Isolamento Multi-Tenant via RLS

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
  user_role TEXT;
BEGIN
  -- Extract user_id from claims
  -- STRICT: If user_id is missing, raise exception
  IF NOT (event->'claims' ? 'sub') THEN
    RAISE EXCEPTION 'custom_access_token_hook: missing user_id (sub) in claims';
  END IF;

  -- Fetch tenant_id and role from users table using user_id from JWT
  -- STRICT: If query fails (user not found, DB down, etc.) exception is raised
  BEGIN
    SELECT tenant_id, role INTO user_tenant_id, user_role
    FROM public.users
    WHERE id = (event->'claims' ->> 'sub')::uuid;

    IF user_tenant_id IS NULL THEN
      RAISE EXCEPTION 'User not found or missing tenant_id for user_id: %', event->'claims' ->> 'sub';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- STRICT mode: any error raises exception, login fails
    RAISE EXCEPTION 'custom_access_token_hook failed to fetch user data: %', SQLERRM;
  END;

  -- Deep merge: Update app_metadata within claims, preserving all other JWT fields
  -- Uses jsonb_set with nested path {claims, app_metadata} to merge only app_metadata
  -- All other claims fields (aud, exp, iat, sub, email, phone, aal, session_id, is_anonymous, etc.) remain intact
  event := jsonb_set(
    event,
    '{claims, app_metadata}',
    COALESCE(event->'claims'->'app_metadata', '{}'::jsonb) ||
    jsonb_build_object(
      'tenant_id', user_tenant_id::text,
      'role', user_role
    )
  );

  RETURN event;

EXCEPTION WHEN OTHERS THEN
  -- STRICT: any unhandled error raises exception
  RAISE EXCEPTION 'custom_access_token_hook fatal error: %', SQLERRM;
END;
$$;

-- Reconfirm permissions (idempotent)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM anon, authenticated;

-- Update documentation
COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
'Custom JWT hook that injects app_metadata.tenant_id and app_metadata.role from the users table.
Ensures tenant isolation is enforced by the database, not by editable user_metadata.
Uses deep merge (jsonb_set with nested path) to preserve all required JWT claims fields.
STRICT behavior: raises exception on any error, failing login safely.
Must be enabled in Supabase Dashboard > Authentication > Hooks > Custom Access Token Hook.
Source: Story 4.1';
