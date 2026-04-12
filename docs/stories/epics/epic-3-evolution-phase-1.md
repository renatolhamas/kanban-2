---
epic_id: EPIC-3
epic_name: Evolution Phase 1 - Setup & Pairing
status: Draft
created_date: 2026-04-12
created_by: Morgan (PM)
priority: P1
target_completion: 1-2 weeks (Weeks 7-8)
source_prd: docs/prd/15-implementation-roadmap-7-epics-sequenced.md
---

# EPIC-3: EVOLUTION PHASE 1 (Setup & Pairing)

## Epic Goal

Establish WhatsApp integration via Evo GO: enable QR code pairing, validate webhook infrastructure, and prepare for Phase 2 database integration. Users can connect their WhatsApp instance and begin receiving incoming messages via webhooks.

## Epic Description

**Existing System Context:**

- Epic 1 (Foundation & Auth): Database schema complete, authentication working, RLS policies enforced
- Epic 2 (UI Core & Design System): Design system established with Shadcn/ui, Tailwind, and Manrope typography
- Evo GO: External WhatsApp API service with credentials obtained
- Webhook infrastructure: Endpoint structure ready for message ingestion

**Enhancement Details:**

- Evo GO instance pairing flow: user scans QR code to connect WhatsApp number
- Webhook endpoint for incoming message webhooks from Evo GO
- HMAC-SHA256 signature validation to verify webhook authenticity
- Manual testing framework using curl/Postman
- Error handling and logging for pairing failures

**Success Criteria:**

- [ ] User can pair Evo GO instance via QR code in Settings
- [ ] Instance credentials stored securely (Supabase Vault or env variables)
- [ ] Webhook endpoint validates HMAC signatures correctly
- [ ] Webhook accepts and logs incoming messages (no DB storage yet)
- [ ] Pairing status visible in Settings (connected/disconnected)
- [ ] Manual testing verified with curl/Postman
- [ ] Ready for Phase 2 (Message DB integration)

---

## Stories (4 sequenced stories per PRD)

### Story 3.1: Evo GO Pairing (QR Code)

**Description:**
Integrate Evo GO pairing flow: generate QR code in Settings, validate pairing, store instance credentials securely.

**Executor Assignment:**

- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [api_integration_review, secret_management_audit, error_handling_validation]

**Acceptance Criteria:**

- [ ] Settings page displays "Connection" subsection
- [ ] QR code generated from Evo GO API (`POST /instance/create`)
- [ ] User can scan QR code with Evolution app on WhatsApp phone
- [ ] After pairing, instance credentials stored in environment or Supabase Vault (NOT in code)
- [ ] Instance ID and API key accessible via authenticated API endpoint
- [ ] Pairing status endpoint (`GET /api/settings/evo-go/status`) returns connection state
- [ ] Error handling: pairing timeout, invalid QR, API failures logged with user-friendly messages
- [ ] Documentation: `/docs/architecture/evo-go-integration.md`

**Integration Points:**

- Evo GO API (`POST /instance/create`, `GET /instance/{id}/status`)
- Supabase Vault for secret storage (or environment variables as fallback)
- Next.js API route: `POST /api/settings/evo-go/pair`
- Settings page UI (Connection subsection)
- Frontend: QR code display component

**Dependencies:**

- Epic 1 (Auth & RLS must be working)
- Epic 2 (UI components available)

**Risks:**

- Primary: Credentials exposed in logs or client-side code
- Mitigation: Server-side API calls only, never log full credentials, use secure storage only
- Rollback: Revoke exposed credentials, re-pair new instance

---

### Story 3.2: Webhook Endpoint Setup (/api/webhooks/messages)

**Description:**
Create webhook endpoint for Evo GO message ingestion, accept incoming webhooks, prepare for signature validation (Story 3.3).

**Executor Assignment:**

- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [api_design_review, request_logging_validation, error_response_testing]

**Acceptance Criteria:**

- [ ] `POST /api/webhooks/messages` endpoint created in Next.js
- [ ] Endpoint accepts Evo GO webhook payload (raw JSON)
- [ ] Request headers logged (X-Signature, X-Timestamp) for validation
- [ ] Endpoint responds `200 OK` immediately (async processing)
- [ ] Request validation: content-type is application/json
- [ ] Error responses: `400 Bad Request` for malformed payloads, `401 Unauthorized` for missing headers
- [ ] Logging: request timestamp, payload size, source IP (no message content)
- [ ] Ready for signature validation in Story 3.3
- [ ] Documentation: `/docs/architecture/webhook-flow.md`

**Integration Points:**

- Evo GO webhook sender
- Next.js API routes
- Request logging/monitoring system
- Story 3.3 (HMAC validation)

**Dependencies:**

- Story 3.1 (Evo GO instance must exist)

**Risks:**

- Primary: Endpoint accepts malformed or malicious payloads
- Mitigation: Schema validation (Story 3.3), input sanitization, rate limiting (Phase 2)
- Rollback: Disable webhook endpoint, queue messages for manual re-processing

---

### Story 3.3: Webhook Signature Validation (HMAC-SHA256)

**Description:**
Implement HMAC-SHA256 signature validation on webhook endpoint to verify authenticity of incoming Evo GO webhooks.

**Executor Assignment:**

- **Executor:** @dev
- **Quality Gate:** @architect
- **Quality Gate Tools:** [crypto_validation_review, signature_test_vectors, security_audit]

**Acceptance Criteria:**

- [ ] Endpoint validates Evo GO `X-Signature` header (HMAC-SHA256)
- [ ] Invalid signatures rejected with `403 Forbidden`
- [ ] Signature validation uses instance API key from Supabase Vault
- [ ] Signature format: `sha256=<hex_digest>` (Evo GO standard)
- [ ] Request body NOT modified before validation (raw bytes)
- [ ] Validation timestamp checked: reject if older than 5 minutes (clock skew tolerance)
- [ ] Test vectors provided: known good signature → 200 OK, bad signature → 403 Forbidden
- [ ] Documentation: `/docs/architecture/webhook-security.md`
- [ ] Ready for manual testing (Story 3.4)

**Integration Points:**

- Story 3.2 (Webhook endpoint)
- Supabase Vault (instance API key retrieval)
- Node.js crypto module
- Test suite for validation logic

**Dependencies:**

- Story 3.2 (Webhook endpoint exists)
- Story 3.1 (Instance credentials available)

**Risks:**

- Primary: Weak signature validation allows webhook spoofing or injection attacks
- Mitigation: Use crypto.timingSafeEqual() for comparison, strict format validation, comprehensive unit tests
- Rollback: Disable signature validation (temporarily reduce security), review logs for suspicious activity

---

### Story 3.4: Manual Testing & Documentation

**Description:**
Validate Evo GO pairing and webhook endpoint using curl/Postman. Document the entire flow for developers and support.

**Executor Assignment:**

- **Executor:** @qa
- **Quality Gate:** @dev
- **Quality Gate Tools:** [integration_test_validation, endpoint_security_check, documentation_review]

**Acceptance Criteria:**

- [ ] QR code generation works: scan in Evolution app → instance paired
- [ ] Webhook endpoint accepts curl POST request (no HMAC needed for manual test)
- [ ] Webhook logs incoming request correctly
- [ ] Manual test with valid HMAC signature → 200 OK
- [ ] Manual test with invalid HMAC signature → 403 Forbidden
- [ ] Postman collection created: `docs/postman/evo-go-webhooks.json`
- [ ] Testing guide: `/docs/guides/evo-go-manual-testing.md` (curl commands, expected responses)
- [ ] Edge cases tested: timeout, malformed payload, missing headers, old timestamps
- [ ] Pairing status visible in Settings after successful QR scan
- [ ] Disconnect/re-pair workflow tested

**Integration Points:**

- Stories 3.1, 3.2, 3.3 (all integration points)
- Evo GO sandbox/production environment
- Postman or curl CLI
- Testing documentation

**Dependencies:**

- Story 3.1, 3.2, 3.3 (all must be complete)

**Risks:**

- Primary: Integration doesn't work end-to-end; untested edge cases cause failures in Phase 2
- Mitigation: Comprehensive manual testing, clear documentation, test vectors validated
- Rollback: Use sandbox Evo GO credentials for safe testing, manual re-pairing in production

---

## Compatibility Requirements

- [ ] Settings page layout supports "Connection" subsection (extends existing design)
- [ ] Evo GO credentials do NOT break existing auth/RLS (isolated storage)
- [ ] Webhook endpoint does NOT conflict with other Next.js API routes
- [ ] Pairing flow compatible with user onboarding (non-blocking setup)
- [ ] Error handling follows existing project patterns (toasts, console logging)

## Definition of Done

- [ ] All 4 stories completed with AC met
- [ ] Evo GO pairing functional and tested
- [ ] Webhook endpoint accepts and validates signatures
- [ ] Manual testing documented and verified
- [ ] All secrets stored securely (NOT in code)
- [ ] Pairing status visible in Settings UI
- [ ] Documentation complete in `/docs/architecture/`
- [ ] Code passes security review (@architect)
- [ ] Ready for Phase 2 (DB integration in Epic 4)

---

## Quality Assurance Strategy

### CodeRabbit Validation

- **Evo GO Story:** Secret management, API error handling, timeout behavior, QR code generation
- **Webhook Story:** Request validation, error responses, logging (no sensitive data)
- **Signature Story:** Crypto implementation, timing attack prevention, hex validation
- **Testing Story:** Integration test coverage, documentation quality, edge case handling

### Specialized Expertise

- @architect: API design, security review, secret management, webhook best practices
- @dev: Implementation of pairing flow, webhook handling, signature validation
- @qa: Manual testing, documentation completeness, edge case validation

### Quality Gates by Risk Level

- **Signature Story:** CRITICAL → Pre-Commit crypto validation + security review
- **Pairing Story:** HIGH → Pre-PR secret management audit + credential rotation test
- **Webhook Story:** HIGH → Pre-PR request validation + DOS prevention check
- **Testing Story:** MEDIUM → Manual test coverage + documentation review

---

## Handoff to Story Manager (@sm)

"Please develop detailed user stories for this Evolution Phase 1 epic. Key considerations:

- This epic establishes WhatsApp integration via Evo GO
- Credentials MUST be stored securely — never hardcoded or logged
- Signature validation is critical for security — use crypto.timingSafeEqual()
- Webhook endpoint must be production-ready (correct error responses, logging)
- Manual testing must be comprehensive before Phase 2 (DB integration)
- Settings UI must clearly show pairing status and allow disconnect/re-pair
- After completion, users can pair WhatsApp and webhook infrastructure is validated

The epic should enable secure, reliable message ingestion while maintaining data isolation and security."

---

**Epic Status:** Ready for Story Development  
**Next Action:** @sm creates detailed user stories (3.1 through 3.4)  
**Blocked By:** EPIC-2 (UI Core must be complete)  
**Blocks:** EPIC-4 (Kanban Board & Contacts), EPIC-5 (Evolution Phase 2 - DB Integration)
