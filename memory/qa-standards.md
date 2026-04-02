---
name: QA Fix Request Standard & Location
description: Where and how QA creates fix request documents for gate verdicts
type: reference
---

# QA Fix Request Standard

## Quick Reference

**Location:** `docs/fix_request/`

**Naming:** `QA-FIX_REQUEST-{YYYY-MM-DD}_{story-identifier}.md`

**Example:** `docs/fix_request/QA-FIX_REQUEST-2026-04-02_story-1.2.md`

## When to Create

✅ Create when:

- Gate verdict is **FAIL** (blocking issues)
- Gate verdict is **CONCERNS** with actionable fixes
- Multiple structured issues need @dev handoff

❌ Don't create when:

- Gate verdict is **PASS**
- Gate verdict is **WAIVED**

## Document Structure

1. Header: From/To/Story/Date
2. **🔴 Critical Issues to Fix** (with code examples)
3. **⚠️ High Priority Issues** (if applicable)
4. **🟡 Medium Priority Issues** (if applicable)
5. **✅ Verification Checklist** (exact commands)
6. **📝 QA Gate Re-Review Process** (next steps)
7. **📁 References** (links to gate file, story)

## Configuration

**File:** `.aiox-core/core-config.yaml`

```yaml
qa:
  qaLocation: docs/qa
  fixRequestLocation: docs/fix_request
  fixRequestNaming: "QA-FIX_REQUEST-{YYYY-MM-DD}_{story-identifier}.md"
```

**Rule:** `.claude/rules/qa-fix-request-standard.md`

## Story Reference

When creating fix request, update story's **QA Results** section:

```markdown
### Gate Status

Gate: FAIL → docs/qa/gates/{epic}.{story}-{slug}.yml

**Fix Request:** docs/fix*request/QA-FIX_REQUEST-{YYYY-MM-DD}*{story-id}.md
```

## Established 2026-04-02
