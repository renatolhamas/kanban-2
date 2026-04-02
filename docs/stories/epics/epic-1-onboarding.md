---
epic_id: EPIC-1
epic_name: Foundation & Authentication
status: Draft
created_date: 2026-04-01
created_by: Morgan (PM)
priority: P0
target_completion: 2-3 weeks (Weeks 1-3)
source_prd: docs/prd/14-implementation-roadmap-7-epics-sequenced.md
---

# EPIC-1: FOUNDATION & AUTH

## Epic Goal
Establish the complete technical foundation: database schema, authentication, tenant onboarding, RLS security, Evolution API integration, and webhook infrastructure.

## Epic Description

**Existing System Context:**
- No infrastructure exists yet (greenfield)
- Supabase Cloud account provisioned (ready for schema)
- Evolution API v2 credentials obtained (ready for pairing)
- Frontend is Next.js (ready for auth flows)

**Enhancement Details:**
- Complete PostgreSQL schema (tenants, users, contacts, conversations, messages, columns)
- Supabase Auth (register, login, profile management)
- Tenant auto-creation with default "Main" kanban + standard columns
- RLS policies for multi-tenant data isolation
- Evolution API QR pairing setup
- Webhook endpoint infrastructure for message ingestion

**Success Criteria:**
- Users can register/login and land in empty kanban dashboard
- Each user is automatically assigned to a tenant with default kanban structure
- RLS policies prevent cross-tenant data access
- Evolution API can be paired via QR code
- Webhook endpoint is ready to receive messages (manual testing phase)

---

## Stories (6 sequenced stories per PRD)

### Story 1.1: Database Schema Creation

**Description:**
Create complete PostgreSQL schema: tenants, users, contacts, conversations, messages, columns.

**Executor Assignment:**
- **Executor:** @data-engineer
- **Quality Gate:** @architect
- **Quality Gate Tools:** [schema_validation, foreign_key_integrity, performance_baseline]

**Acceptance Criteria:**
- [ ] `tenants` table: id, owner_id, created_at, updated_at
- [ ] `users` table: id (via auth.uid), tenant_id, name, email, profile
- [ ] `contacts` table: id, tenant_id, whatsapp_number (E.164), name, created_at
- [ ] `conversations` table: id, tenant_id, contact_id, column_id, status
- [ ] `messages` table: id, conversation_id, sender (user/contact), body, created_at
- [ ] `kanban_columns` table: id, tenant_id, name, position, created_at
- [ ] All foreign keys reference correct parent tables
- [ ] Indexes on tenant_id, contact_id, conversation_id for query performance
- [ ] Schema documented in `/docs/architecture/schema.md`

**Integration Points:**
- Supabase PostgreSQL
- RLS policy layer (Story 1.4)
- Evolution webhook data (Story 1.6)

**Dependencies:**
- None (foundational)

**Risks:**
- Primary: Schema design doesn't support multi-user Phase 2
- Mitigation: Review schema with @architect, plan for user-level columns
- Rollback: Database migration rollback, clear all data

---

### Story 1.2: Supabase Auth (Register, Login, Profile)

**Description:**
Implement authentication: user registration, login, and profile management via Supabase Auth.

**Executor Assignment:**
- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [auth_security_review, password_validation, jwt_inspection]

**Acceptance Criteria:**
- [ ] User can sign up with email + password (password >= 8 chars, validation rules)
- [ ] User can log in with email + password
- [ ] JWT token generated and stored in secure httpOnly cookie
- [ ] User profile accessible after login (name, email)
- [ ] User can update profile (name, optional)
- [ ] Logout clears JWT and redirects to login
- [ ] Password reset flow (optional, documented for future)
- [ ] All auth endpoints follow Supabase best practices

**Integration Points:**
- Supabase Auth service
- Next.js auth middleware
- Frontend: Login/Signup forms
- Session state management (Context or Zustand)

**Dependencies:**
- Story 1.1 (schema ready)

**Risks:**
- Primary: Credentials exposure or weak session handling
- Mitigation: httpOnly cookies only, no localStorage tokens, token refresh strategy
- Rollback: Disable auth endpoint, force session reset

---

### Story 1.3: Onboarding & Tenant Auto-Creation

**Description:**
On user signup, automatically create tenant, default "Main" kanban, and standard column structure.

**Executor Assignment:**
- **Executor:** @dev
- **Quality Gate:** @data-engineer
- **Quality Gate Tools:** [data_consistency_check, rls_readiness_test, kanban_structure_validation]

**Acceptance Criteria:**
- [ ] After signup, new tenant row created with user as owner_id
- [ ] Default kanban named "Main" created for tenant
- [ ] Standard columns created: "Novo" → "Qualificado" → "Proposta" → "Vendido" → "Arquivado"
- [ ] User auto-assigned to tenant (via auth context)
- [ ] User lands in empty dashboard (kanban visible, no cards yet)
- [ ] Tenant isolation works: user only sees their tenant's data
- [ ] Duplicate signup prevention (same email → existing user login)

**Integration Points:**
- Story 1.1 (schema)
- Story 1.2 (auth JWT)
- Story 1.4 (RLS verification)

**Dependencies:**
- Story 1.2 (Auth must work)

**Risks:**
- Primary: Tenant/kanban not created, user stranded after login
- Mitigation: Database transaction rollback on failure, error handling in onboarding flow
- Rollback: Clear auto-created tenant, manual re-creation via support

---

### Story 1.4: RLS Policies Validation

**Description:**
Define and test RLS policies to ensure each user can only access their tenant's data.

**Executor Assignment:**
- **Executor:** @data-engineer
- **Quality Gate:** @dev
- **Quality Gate Tools:** [rls_policy_audit, cross_tenant_attack_test, data_isolation_verification]

**Acceptance Criteria:**
- [ ] RLS policy on `tenants`: user can only select/read their own tenant
- [ ] RLS policy on `users`: user can only select/read users in their tenant
- [ ] RLS policy on `contacts`: select/update only from user's tenant
- [ ] RLS policy on `conversations`: select/update only from user's tenant
- [ ] RLS policy on `messages`: select/update only from user's tenant's conversations
- [ ] RLS policy on `kanban_columns`: select only from user's tenant
- [ ] All policies tested: attempt to query another tenant's data → denied
- [ ] Unit tests verify cross-tenant attack is impossible

**Integration Points:**
- Story 1.1 (schema)
- Story 1.2 (JWT context with user ID)
- Supabase RLS engine

**Dependencies:**
- Story 1.1, 1.2 (schema and auth in place)

**Risks:**
- Primary: RLS misconfiguration allows data leakage between tenants
- Mitigation: Comprehensive security tests, penetration testing mindset
- Rollback: Disable RLS temporarily (security risk), clear potentially exposed data

---

### Story 1.5: Evolution API Pairing (QR Code)

**Description:**
Integrate Evolution API v2 pairing flow: generate QR code, validate pairing, store instance credentials securely.

**Executor Assignment:**
- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [api_integration_review, secret_management_audit, error_handling_validation]

**Acceptance Criteria:**
- [ ] Pairing UI shows QR code generated from Evolution API
- [ ] User can scan QR code with Evolution app on WhatsApp phone
- [ ] After pairing, instance credentials stored securely (NOT in code, NOT in git)
- [ ] Instance status verified (connected/disconnected)
- [ ] Credentials refreshed on login (if needed)
- [ ] Error handling for pairing failure (timeout, invalid QR, etc.)
- [ ] Documentation: `/docs/architecture/evolution-api.md`

**Integration Points:**
- Evolution API v2 (pairing endpoint)
- Supabase Vault (secure secret storage) or environment variables
- Next.js API route (`/api/evolution/pair`)
- Settings page UI

**Dependencies:**
- Story 1.2 (auth must be working)

**Risks:**
- Primary: Credentials exposed or leaked in logs/client-side code
- Mitigation: Server-side API calls only, use Supabase Vault, no console logs of secrets
- Rollback: Revoke exposed credentials, re-pair new instance

---

### Story 1.6: Webhook Endpoint Setup (/api/webhooks/messages)

**Description:**
Create webhook endpoint for Evolution API message ingestion, validate HMAC signature, prepare for DB storage (Story 4).

**Executor Assignment:**
- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [api_security_review, webhook_signature_validation, load_testing]

**Acceptance Criteria:**
- [ ] POST `/api/webhooks/messages` endpoint created in Next.js API route
- [ ] Webhook validates HMAC-SHA256 signature (Evolution API requirement)
- [ ] Invalid signatures rejected (403 Forbidden)
- [ ] Webhook accepts Evolution API message payload (raw format)
- [ ] Request logged for debugging (no sensitive data)
- [ ] Endpoint responds 200 OK immediately (async processing in Phase 2)
- [ ] Manual testing with curl/Postman validated (documentation provided)
- [ ] Ready for database integration (Phase 2 - Story 4)

**Integration Points:**
- Evolution API webhook sender
- Next.js API routes
- Request logging/monitoring
- Phase 2: Story 4 (DB storage)

**Dependencies:**
- Story 1.5 (Evolution API credentials in place)

**Risks:**
- Primary: Webhook accepts invalid messages or is exploited for DoS
- Mitigation: HMAC validation required, rate limiting (Phase 2), input sanitization
- Rollback: Disable webhook endpoint, queue messages for manual re-processing

---

## Compatibility Requirements

- [ ] Schema supports Phase 2 multi-user expansion (user-level access control)
- [ ] RLS policies are bulletproof for tenant isolation
- [ ] Authentication follows Supabase Cloud best practices (JWT, httpOnly cookies)
- [ ] Evolution API integration compatible with webhook ingestion pipeline
- [ ] All secrets stored outside code (environment variables or vault)

## Definition of Done

- [ ] All 6 stories completed with AC met
- [ ] Database schema deployed and tested
- [ ] Authentication flow tested end-to-end (signup → login → dashboard)
- [ ] RLS policies audited and verified (no cross-tenant access)
- [ ] Evolution API pairing functional and tested manually
- [ ] Webhook endpoint accepts and validates signatures
- [ ] All documentation in `/docs/architecture/`
- [ ] No hardcoded credentials or secrets in codebase
- [ ] Code passes security review (@architect)
- [ ] Ready for Phase 2 (Story Development Cycle)

---

## Quality Assurance Strategy

### CodeRabbit Validation
- **Schema Story:** Foreign key integrity, indexing strategy, performance baseline
- **Auth Story:** Password rules, JWT payload, session handling, secure storage
- **Onboarding Story:** Transaction safety, error handling, data consistency
- **RLS Story:** Policy correctness, cross-tenant attack prevention, SQL injection protection
- **Evolution Story:** Secret management, API error handling, timeout behavior
- **Webhook Story:** Signature validation, request parsing, error responses

### Specialized Expertise
- @architect: Overall security design, API contracts, Evolution integration
- @data-engineer: Schema design, RLS policies, data isolation verification
- @dev: Implementation of auth flows, webhook handling, session management

### Quality Gates by Risk Level
- **Schema Story:** CRITICAL → Pre-Commit + Pre-PR + Pre-Deployment audit
- **Auth Story:** CRITICAL → Full security review + penetration testing mindset
- **RLS Story:** CRITICAL → Pre-Deployment data isolation audit
- **Evolution/Webhook Stories:** HIGH → Pre-PR + manual testing validation

---

## Handoff to Story Manager (@sm)

"Please develop detailed user stories for this foundation epic. Key considerations:

- This is the complete technical foundation for the entire MVP
- Schema must support Phase 2 multi-user expansion without breaking changes
- RLS policies are non-negotiable for security — data isolation is the top priority
- All credentials and secrets must be stored securely (never in code or git)
- Authentication follows Supabase Cloud best practices
- Evolution API integration must be rock-solid before Phase 2 DB integration
- After completion, users can register, log in, see empty kanban, and Evolution is paired

The epic should establish a secure, scalable, multi-tenant foundation while maintaining compatibility with future phases."

---

**Epic Status:** Ready for Story Development  
**Next Action:** @sm creates detailed user stories (1.1 through 1.6)  
**Blocked By:** None  
**Blocks:** EPIC-2 (Evolution Phase 1 - Setup & Pairing)
