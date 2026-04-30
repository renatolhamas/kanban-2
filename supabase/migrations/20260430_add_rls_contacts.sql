-- Add RLS (Row Level Security) policy for contacts table
-- This ensures multi-tenant isolation at the database level

-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own contacts (tenant isolation)
CREATE POLICY contacts_tenant_isolation ON contacts
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create policy: users can only insert contacts for their tenant
CREATE POLICY contacts_insert_own_tenant ON contacts
  FOR INSERT
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create policy: users can only update their own contacts
CREATE POLICY contacts_update_own_tenant ON contacts
  FOR UPDATE
  USING (tenant_id = auth.jwt() ->> 'tenant_id')
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

-- Create policy: users can only delete their own contacts
CREATE POLICY contacts_delete_own_tenant ON contacts
  FOR DELETE
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Comment explaining the RLS policy
COMMENT ON POLICY contacts_tenant_isolation ON contacts IS
  'Multi-tenant isolation: Users can only see/modify contacts belonging to their tenant';
