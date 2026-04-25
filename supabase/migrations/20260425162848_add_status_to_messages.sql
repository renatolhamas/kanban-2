-- Migration: Add status column to messages table
-- Description: Adds a status column to track message delivery state (sending, sent, error)
-- Required for Story 6.2 (Optimistic UI)

-- 1. Add the column
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent';

-- 2. Update existing messages to 'sent' (since they were successfully processed before this change)
UPDATE public.messages SET status = 'sent' WHERE status IS NULL;

-- 3. Add a check constraint to ensure valid states
-- States: 
-- 'sending': Message is being processed by the backend/Evolution API
-- 'sent': Message was successfully delivered to Evolution API
-- 'error': Delivery failed
ALTER TABLE public.messages 
ADD CONSTRAINT messages_status_check 
CHECK (status IN ('sending', 'sent', 'error'));

-- 4. Create an index for faster filtering in the chat UI
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);

COMMENT ON COLUMN public.messages.status IS 'Status do envio da mensagem: sending, sent, error';
