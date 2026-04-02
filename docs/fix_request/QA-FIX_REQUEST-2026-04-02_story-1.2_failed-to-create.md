# QA Fix Request: Story 1.2 - Registration Failure Analysis

**ID:** QA-FIX_REQUEST-2026-04-02_story-1.2_failed-to-create
**Status:** OPEN
**Priority:** HIGH
**Context:** User Registration Flow (Story 1.2)
**Date:** 2026-04-02

## Issue Summary

When a user attempts to register at `/register`, the application returns a "Failed to create user record" error in the red toast, but simultaneously shows a green "Registration successful!" success state. This indicates both a backend process failure and a significant frontend state management bug.

---

## Technical Analysis

### Sequence of Execution (Linear but Non-Atomic)

The registration flow follows this strict sequence in `app/api/auth/register/route.ts`:

1.  **Frontend Validation (`RegisterForm.tsx`):** Client-side format checks.
2.  **API Call (`page.tsx`):** `POST /api/auth/register`.
3.  **Backend Pre-check (`route.ts`):** Validates payload and checks if `email` exists in the public `users` table.
4.  **Supabase Auth Creation:** `auth.admin.createUser` creates the identity in the `auth` schema.
5.  **Tenant Creation:** `supabase.from('tenants').insert()` creates the workspace.
6.  **User Record Linkage (FAILURE POINT):** `supabase.from('users').insert()` attempts to link the `userId` from step 4 and `tenantId` from step 5.
7.  **Cleanup & Response:** If Step 6 fails, the code triggers a manual "rollback" (deleting Auth user and Tenant) and returns a 500 error.

### Identified Bugs

#### 1. Frontend State Mismatch (Race Condition/Logic Error)
In `components/RegisterForm.tsx` (lines 64-66), the `success` state is set to `true` immediately after `await onSubmit(...)`.
However, the `onSubmit` function in `app/(auth)/register/page.tsx` (lines 11-40) uses a `try/catch` block that **swallows the error** to set a local `error` state. Because it does not re-throw the error, the `RegisterForm` believes the operation was successful.

#### 2. Backend Linkage Failure
The error "Failed to create user record" suggests that Step 6 is failing. Potential root causes:
*   **RLS Policies:** Row Level Security on the `users` table might be blocking the insert even with Service Role access.
*   **Foreign Key Delay:** A potential race condition where the `auth_user_id` is not yet visible to the public schema's FK constraints at the moment of insertion.
*   **Constraint Violation:** Residual data from failed registration attempts (e.g., a record in `users` with the same email but no corresponding `auth` user).

---

## Recommended Fixes

### Frontend (Mandatory)
- **Error Propagation:** The `handleRegister` function in `page.tsx` should re-throw the error after setting its local state, OR the `RegisterForm` should receive the error state from the parent more effectively.
- **Loading State:** Ensure the UI correctly reflects the "failure" state by resetting the submission status if the API returns `!response.ok`.

### Backend (Mandatory)
- **Transaction/Consistency:** Verify RLS policies on the `users` and `tenants` tables.
- **Traceability:** Add more granular logging before and after the `supabase.from('users').insert()` call to identify specifically which constraint is being violated.

---

## Artifacts Involved

- [page.tsx](file:///c:/git/kanban.2/app/(auth)/register/page.tsx)
- [route.ts](file:///c:/git/kanban.2/app/api/auth/register/route.ts)
- [RegisterForm.tsx](file:///c:/git/kanban.2/components/RegisterForm.tsx)

---
*— Quinn, guardião da qualidade 🛡️*
