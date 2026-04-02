# Implementation Plan: Fix User Registration Flow (Story 1.2)

**Plan ID:** plan-001
**Context:** Story 1.2 - User Registration & Tenant Association
**Analysis by:** Quinn (QA Architect)
**Date:** 2026-04-02

---

## 1. Problem Definition

1.  **Database Constraint (L11):** The `users` table has a CHECK constraint: `CHECK (role IN ('admin', 'user', 'viewer'))`. The registration flow tries to insert `role: 'owner'`, which leads to a 500 error.
2.  **UI Feedback Bug:** The `RegisterForm.tsx` incorrectly sets "Success" state because it doesn't wait for errors to propagate from the `page.tsx` handler.

## 2. Proposed Fixes

### A. Database (Migration Update)

Modify `supabase/migrations/20260401234048_create_core_schema.sql` to include `'owner'` and remove `'viewer'`.

```sql
-  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
+  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'owner')),
```

### B. Frontend (Logic Correction)

1.  **page.tsx**: Ensure `handleRegister` re-throws errors after setting the error state.
2.  **RegisterForm.tsx**: Ensure the success state is only triggered if the `onSubmit` promise is fulfilled without errors.

---

## 3. Execution Checklist

- [ ] Modify `supabase/migrations/*_create_core_schema.sql`
- [ ] Apply migration to local Supabase instance (if applicable)
- [ ] Update `app/(auth)/register/page.tsx`
- [ ] Update `components/RegisterForm.tsx`
- [ ] Verify successful registration in Browser
- [ ] Verify database state via Supabase SQL Editor

---

_— Quinn, guardião da qualidade 🛡️_
