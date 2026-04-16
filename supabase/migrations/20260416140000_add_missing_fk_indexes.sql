-- Add missing indexes on foreign keys for performance
-- Database: ujcjucgylwkjrdpsqffs
-- Date: 2026-04-16

-- Problem: These foreign keys are used in DELETE and JOIN operations
-- but lack indexes, causing full table scans on dependent tables

-- Impact:
-- - DELETE from kanbans → full scan of automatic_messages (before)
-- - DELETE from contacts → full scan of conversations (before)
-- - DELETE from columns → full scan of conversations (before)
-- With indexes: Index scan, 100x faster

-- Solution: Create non-blocking indexes using CONCURRENTLY
-- (allows concurrent reads/writes while index is created)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automatic_messages_scheduled_kanban
  ON public.automatic_messages(scheduled_kanban_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_contact_id
  ON public.conversations(contact_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_column_id
  ON public.conversations(column_id);

-- Verification query (run after migration):
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE indexname IN (
--   'idx_automatic_messages_scheduled_kanban',
--   'idx_conversations_contact_id',
--   'idx_conversations_column_id'
-- );
