-- Migration: enhance_webhooks_schema
-- Story 5.1: Webhook Contact Auto-Registration
-- Adds wa_name and is_group columns to contacts table
-- Adds upsert_contact RPC function with partial update (preserves name on conflict)

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS wa_name text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_group boolean DEFAULT false;

CREATE OR REPLACE FUNCTION public.upsert_contact(
  p_tenant_id uuid,
  p_phone     text,
  p_name      text,
  p_wa_name   text,
  p_is_group  boolean
) RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.contacts (tenant_id, phone, name, wa_name, is_group, updated_at)
  VALUES (p_tenant_id, p_phone, p_name, p_wa_name, p_is_group, NOW())
  ON CONFLICT (phone, tenant_id)
  DO UPDATE SET
    wa_name    = EXCLUDED.wa_name,
    is_group   = EXCLUDED.is_group,
    updated_at = NOW()
    -- name is intentionally NOT updated to preserve manual edits
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
