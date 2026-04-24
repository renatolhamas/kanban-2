-- Migration: Restore RPC get_conversations_with_last_message
-- Purpose: Dashboard load conversations with last message preview
-- Security: JWT tenant isolation via app_metadata
-- Created: 2026-04-24
-- Story: 5.4.2 — Schema Correction & RPC Recovery

CREATE OR REPLACE FUNCTION public.get_conversations_with_last_message(
  p_kanban_id uuid
)
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
  v_tenant_id uuid;
BEGIN
  v_tenant_id := ((SELECT auth.jwt()) -> 'app_metadata' ->> 'tenant_id')::uuid;

  RETURN QUERY
  SELECT
    c.id,
    c.wa_phone,
    c.status,
    c.last_message_at,
    c.column_id,
    con.name AS contact_name,
    (SELECT m.content FROM public.messages m
     WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC LIMIT 1) AS last_message_content,
    (SELECT m.sender_type FROM public.messages m
     WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC LIMIT 1) AS last_sender_type,
    (SELECT m.media_url FROM public.messages m
     WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC LIMIT 1) AS last_media_url,
    (SELECT m.media_type FROM public.messages m
     WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC LIMIT 1) AS last_media_type,
    c.unread_count
  FROM public.conversations c
  LEFT JOIN public.contacts con ON c.contact_id = con.id
  WHERE c.kanban_id = p_kanban_id
    AND c.tenant_id = v_tenant_id
    AND c.status = 'active'
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
