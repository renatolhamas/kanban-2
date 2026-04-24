-- Debug JWT Hook Logging
-- Source: Story 5.4.1 (Debug)

-- 1. Create a log table for auth debugging
CREATE TABLE IF NOT EXISTS public.debug_auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    event_type TEXT,
    payload JSONB,
    extracted_id UUID,
    message TEXT,
    error_detail TEXT
);

-- 2. Update the hook to include logging
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tenant_id UUID;
  user_role TEXT;
  user_uuid UUID;
BEGIN
  -- Log the incoming event
  INSERT INTO public.debug_auth_logs (event_type, payload, message)
  VALUES ('hook_start', event, 'Processing JWT hook');

  -- Extract user_id from claims
  IF NOT (event->'claims' ? 'sub') THEN
    INSERT INTO public.debug_auth_logs (event_type, payload, message)
    VALUES ('error_missing_sub', event, 'Missing user_id (sub) in claims');
    RAISE EXCEPTION 'custom_access_token_hook: missing user_id (sub) in claims';
  END IF;

  user_uuid := (event->'claims' ->> 'sub')::uuid;

  -- Log the extracted ID
  UPDATE public.debug_auth_logs 
  SET extracted_id = user_uuid 
  WHERE id = (SELECT id FROM public.debug_auth_logs ORDER BY created_at DESC LIMIT 1);

  -- Fetch tenant_id and role
  BEGIN
    SELECT tenant_id, role INTO user_tenant_id, user_role
    FROM public.users
    WHERE id = user_uuid;

    IF user_tenant_id IS NULL THEN
      INSERT INTO public.debug_auth_logs (event_type, extracted_id, message)
      VALUES ('error_user_not_found', user_uuid, 'User not found or missing tenant_id in public.users table');
      RAISE EXCEPTION 'User not found or missing tenant_id for user_id: %', user_uuid;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.debug_auth_logs (event_type, extracted_id, message, error_detail)
    VALUES ('error_db_fetch', user_uuid, 'Failed to fetch user data', SQLERRM);
    RAISE EXCEPTION 'custom_access_token_hook failed to fetch user data: %', SQLERRM;
  END;

  -- Deep merge app_metadata
  event := jsonb_set(
    event,
    '{claims, app_metadata}',
    COALESCE(event->'claims'->'app_metadata', '{}'::jsonb) ||
    jsonb_build_object(
      'tenant_id', user_tenant_id::text,
      'role', user_role
    )
  );

  INSERT INTO public.debug_auth_logs (event_type, extracted_id, message)
  VALUES ('hook_success', user_uuid, format('Successfully injected tenant_id: %s', user_tenant_id));

  RETURN event;

EXCEPTION WHEN OTHERS THEN
  INSERT INTO public.debug_auth_logs (event_type, message, error_detail)
  VALUES ('fatal_error', 'Unhandled exception in hook', SQLERRM);
  RAISE EXCEPTION 'custom_access_token_hook fatal error: %', SQLERRM;
END;
$$;

-- Ensure permissions
GRANT ALL ON public.debug_auth_logs TO postgres, service_role;
GRANT INSERT ON public.debug_auth_logs TO supabase_auth_admin;
