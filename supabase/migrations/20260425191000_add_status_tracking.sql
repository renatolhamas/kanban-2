-- Migration: Add status tracking to messages table
-- Story 6.3: Message Delivery Validation

-- 1. Add status columns
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sending',
ADD COLUMN IF NOT EXISTS status_updated_at timestamp with time zone NOT NULL DEFAULT now();

-- 2. Create function to handle status updates
CREATE OR REPLACE FUNCTION handle_message_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status_updated_at only if status has changed
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        NEW.status_updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS tr_messages_status_update ON messages;
CREATE TRIGGER tr_messages_status_update
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_status_update();

-- 4. Update existing messages (optional, set status to 'sent' if not 'sending')
-- We'll assume all existing messages are at least 'sent'
UPDATE messages SET status = 'sent' WHERE status = 'sending' AND created_at < now() - interval '1 minute';

-- 5. Add check constraint for status values
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_status_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_status_check 
CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'error'));

-- 6. Add index for performance on status queries
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages (status);
