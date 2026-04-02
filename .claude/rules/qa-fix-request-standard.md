# QA Fix Request Standard — Naming & Location Convention

**Type:** QA Agent Rule  
**Applies To:** @qa (Quinn - Test Architect)  
**Severity:** MUST  
**Effective Date:** 2026-04-02

## Purpose

Standardize where and how QA fix request documents are created when QA gate verdict is FAIL or CONCERNS with actionable fixes.

## Standard

### Location
**Base Path:** `docs/fix_request/`

All QA fix request documents MUST be saved in this directory (created if not exists).

### Naming Convention

**Format:** `QA-FIX_REQUEST-{YYYY-MM-DD}_{story-identifier}.md`

**Components:**
- **Prefix:** `QA-FIX_REQUEST` (fixed)
- **Date:** `YYYY-MM-DD` (ISO date, e.g., `2026-04-02`)
- **Story Identifier:** Story number or document name (e.g., `story-1.2`, `auth-endpoints`)
- **Extension:** `.md`

**Examples:**
```
QA-FIX_REQUEST-2026-04-02_story-1.2.md
QA-FIX_REQUEST-2026-04-02_story-3.1-database-migration.md
QA-FIX_REQUEST-2026-04-02_epic-6-integration-tests.md
QA-FIX_REQUEST-2026-04-03_security-audit-findings.md
```

### Content Structure

Every QA fix request document MUST include:

```markdown
# QA Fix Request — {Story/Component Name}

**From:** Quinn (QA)  
**To:** @dev (or applicable agent)  
**Story/Component:** {identifier}  
**Gate Status:** FAIL | CONCERNS  
**Date:** YYYY-MM-DD  

---

## 🔴 Critical Issues to Fix

### Issue N: {Title} (Severity: BLOCKING | HIGH | MEDIUM | LOW)

**File:** {path}  
**Location:** Line X or section name  
**Current:** {current code/state}  
**Problem:** {what's wrong}  
**Fix:** {exact fix with code}  
**Verification:** {how to verify fix works}  

---

## ✅ Verification Checklist

- [ ] All critical issues fixed
- [ ] Tests pass: {commands}
- [ ] Linting passes
- [ ] Build succeeds
- [ ] No regressions

---

## 📝 QA Gate Re-Review Process

1. @dev implements fixes
2. @dev runs verification checklist
3. @dev notifies @qa (link to commit)
4. @qa re-runs gate with `*gate {story-id}`
5. @qa updates gate verdict

---

## 📁 References

- **Gate Report:** docs/qa/gates/{gate-file}
- **Story:** docs/stories/{story-id}.story.md
```

### Updating Story QA Results

When creating QA fix request, append to story's **QA Results** section:

```markdown
### Gate Status

Gate: FAIL → docs/qa/gates/{epic}.{story}-{slug}.yml

**Fix Request:** docs/fix_request/QA-FIX_REQUEST-{YYYY-MM-DD}_{story-id}.md
```

## Automation Rules

### When to Create

Create QA fix request when:
- [ ] Gate verdict is **FAIL** (blocking issues found)
- [ ] Gate verdict is **CONCERNS** with specific actionable fixes
- [ ] Multiple issues require structured handoff to @dev

Do NOT create when:
- Gate verdict is **PASS** (no fixes needed)
- Gate verdict is **WAIVED** (issues accepted as-is)

### File Existence Check

Before creating:
```bash
# Verify directory exists
mkdir -p docs/fix_request

# Check if file already exists for this story today
ls docs/fix_request/QA-FIX_REQUEST-{today}_{story}*.md

# If exists: APPEND new findings to existing file (don't duplicate)
# If not exists: CREATE new file with standard format
```

## Configuration Reference

**Location:** `.aiox-core/core-config.yaml`

```yaml
qa:
  qaLocation: docs/qa
  fixRequestLocation: docs/fix_request
  fixRequestNaming: 'QA-FIX_REQUEST-{YYYY-MM-DD}_{story-identifier}.md'
```

## Why This Standard

| Aspect | Benefit |
|--------|---------|
| **Dedicated Folder** | Easy discovery, prevents clutter in project root |
| **ISO Date Format** | Sorts chronologically, universal standard |
| **Story Identifier** | Links fix request to specific story/component |
| **Prefix Convention** | Clear at-a-glance identification of fix request documents |
| **Consistent Naming** | Programmatic parsing, grep/find compatibility |

## Examples in Repository

- `docs/fix_request/QA-FIX_REQUEST-2026-04-02_story-1.2.md` — Auth endpoints TypeScript error + integration tests

---

**Reference:** AIOX QA Framework  
**Maintained By:** Quinn (QA Agent)  
**Last Updated:** 2026-04-02
