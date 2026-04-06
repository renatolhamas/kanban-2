-- Add description column to conversations table
-- This column is required for RLS test fixtures

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN conversations.description IS 'Conversation description or topic';
