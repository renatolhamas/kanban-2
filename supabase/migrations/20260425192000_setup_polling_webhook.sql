-- Migration: Setup Database Webhook for Polling Fallback (Safe Version)
-- Story 6.3: Message Delivery Validation

-- 1. Enable pg_net extension if not enabled (required for outgoing HTTP calls from PG)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the trigger function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_poll_message_status()
RETURNS TRIGGER AS $$
DECLARE
  project_ref text;
  service_key text;
BEGIN
  -- SAFE FALLBACK: Try to get settings without failing if they are missing
  BEGIN
    project_ref := current_setting('app.supabase_project_ref');
    service_key := current_setting('app.supabase_service_role_key');
  EXCEPTION WHEN OTHERS THEN
    -- Settings not found, skip polling trigger silently to allow message persistence
    RETURN NEW;
  END;

  -- Only attempt post if both settings are found
  IF project_ref IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://' || project_ref || '.supabase.co/functions/v1/poll-message-status',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on messages table
-- Only trigger for outgoing messages (sender_type = 'agent')
DROP TRIGGER IF EXISTS tr_poll_message_status ON messages;
CREATE TRIGGER tr_poll_message_status
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.sender_type = 'agent')
  EXECUTE FUNCTION trigger_poll_message_status();
