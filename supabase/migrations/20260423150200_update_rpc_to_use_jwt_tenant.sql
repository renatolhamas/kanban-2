-- Migration: Update get_conversations_with_last_message with strict JWT validation
-- Purpose: Support p_tenant_id for compatibility while enforcing JWT-based isolation
-- Story: 5.4.1 — Frontend & API Integration

CREATE OR REPLACE FUNCTION public.get_conversations_with_last_message(p_kanban_id uuid, p_tenant_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  wa_phone text,
  status text,
  last_message_at timestamptz,
  column_id uuid,
  contact_name text,
  last_message_content text,
  last_sender_type text,
  last_media_url text,
  last_media_type text,
  unread_count int
) AS $$
DECLARE
  v_jwt_tenant_id uuid;
BEGIN
  -- Extract tenant_id from JWT app_metadata (populated by custom_access_token_hook)
  v_jwt_tenant_id := ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

  -- VALIDATION: If p_tenant_id is provided, it MUST match the JWT tenant_id
  IF v_jwt_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: tenant_id not found in JWT';
  END IF;

  IF p_tenant_id IS NOT NULL AND p_tenant_id != v_jwt_tenant_id THEN
    RAISE EXCEPTION 'Forbidden: JWT tenant_id (%) does not match requested tenant_id (%)', v_jwt_tenant_id, p_tenant_id;
  END IF;

  -- Use the validated JWT tenant_id for the query
  RETURN QUERY
  SELECT 
    c.id,
    c.wa_phone,
    c.status,
    c.last_message_at,
    c.column_id,
    con.name AS contact_name,
    (SELECT content FROM public.messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) AS last_message_content,
    (SELECT sender_type FROM public.messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) AS last_sender_type,
    (SELECT media_url FROM public.messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) AS last_media_url,
    (SELECT media_type FROM public.messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC LIMIT 1) AS last_media_type,
    0 AS unread_count
  FROM public.conversations c
  LEFT JOIN public.contacts con ON c.contact_id = con.id
  WHERE c.kanban_id = p_kanban_id 
    AND c.tenant_id = v_jwt_tenant_id
    AND c.status = 'active'
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
