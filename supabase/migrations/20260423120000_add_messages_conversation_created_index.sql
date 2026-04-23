-- Migration: Add composite index for last-message-per-conversation queries (Story 5.4)
-- Purpose: Optimize correlated subquery performance for Kanban board last message preview display
-- Target Performance: ≤ 200ms for 100+ conversations per page
-- Story: 5.4 — Last Message Preview (SQL Subquery Optimization + UI Display)
-- Created: 2026-04-23

-- ============================================================================
-- INDEX CREATION
-- ============================================================================

-- Composite index: (conversation_id ASC, created_at DESC)
-- - Filters by conversation_id (WHERE clause in subquery)
-- - Orders by created_at DESC (ORDER BY in subquery)
-- - INCLUDE clause adds sender_type + content for index-only scans
-- - Improves query: "last message per conversation" pattern

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON public.messages(conversation_id ASC, created_at DESC)
INCLUDE (sender_type, content);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX public.idx_messages_conversation_created IS
'Composite index optimized for last-message-per-conversation queries used in Kanban board preview.

Supports correlated subquery pattern:
  SELECT content FROM messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC LIMIT 1

Index Composition:
  - conversation_id ASC: filters by conversation (WHERE clause)
  - created_at DESC: reverse order for LIMIT 1 optimization
  - INCLUDE (sender_type, content): enables index-only scans

Performance Target: ≤ 200ms for 100+ conversations per tenant page
Story: 5.4 - Last Message Preview optimization
Date Created: 2026-04-23

Expected Improvements:
  - Index Scan instead of Full Table Scan
  - No sorting required (data already ordered by index)
  - Possible index-only scan (INCLUDE columns)
  - ~10-20x faster query execution for typical workloads';

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS public.idx_messages_conversation_created;

