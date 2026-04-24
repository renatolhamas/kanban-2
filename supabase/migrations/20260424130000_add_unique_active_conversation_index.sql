-- Migration: Add unique constraint for active conversations per contact/tenant
-- Story 5.4.3: Prevent conversation fragmentation and race conditions

CREATE UNIQUE INDEX idx_conversations_active_unique 
ON conversations (tenant_id, contact_id) 
WHERE (status = 'active');
