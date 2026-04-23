-- Migration: Update RPC to include last_media_type (Story 5.4 Fix)
-- Purpose: Support media indicators even when URL is not yet available

CREATE OR REPLACE FUNCTION public.get_conversations_with_last_message(p_kanban_id uuid, p_tenant_id uuid)
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
BEGIN
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
    AND c.tenant_id = p_tenant_id
    AND c.status = 'active'
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
