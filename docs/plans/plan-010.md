# Implementation Plan: ESM Migration — Kanban App

**Plan ID:** plan-010  
**Status:** Pending  
**Created:** 2026-04-06  
**Created By:** @architect (Aria)  
**Complexity:** STANDARD  
**Total Duration:** 2-3 weeks (3 phases)

---

## Executive Summary

**Objective:** Migrate from CommonJS (CJS) → ESM (ES Modules) only to support **ESLint 9+**, enabling future tooling upgrades and aligning with JavaScript ecosystem standards.

**Current State:**
- `package.json`: Missing `"type": "module"`
- `next.config.js`: CommonJS (CJS)
- `jest.config.js`: CommonJS (CJS)
- `postcss.config.js`: CommonJS (CJS)
- `.gemini/hooks/*.js`: CommonJS (CJS)
- `eslint.config.js`: Already ESM ✅
- `tailwind.config.ts`: Already ESM ✅

**Phases:**
- **Phase 1 (Week 1):** Foundation & package.json setup — @dev + @architect
- **Phase 2 (Week 2):** Config file migration (Next, Jest, PostCSS) — @dev + @qa
- **Phase 3 (Week 3):** Hook files migration & verification — @dev + @qa

**Estimated Effort:** 12-16 dev hours + 6-8 QA hours

**Risk Level:** 🟡 MEDIUM (Build compatibility, test runner compatibility — mitigated by staged testing)

---

## Critical Dependencies (Backwards)

```
Phase 3 (Verification & Hooks)
  ↓ depends on
Phase 2 (Config files) complete + tests passing
  ↓ depends on
Phase 1 (package.json setup) complete + TypeScript clean
```

---

## Phase 1: Foundation Setup (Week 1)

**Owner Agent:** @architect (Aria) — Architecture Lead  
**Implementation Agent:** @dev (Dex)  
**QA Agent:** @qa (Quinn) — Validation

### Subtask 1.1: Update package.json

- **Owner:** @architect + @dev
- **Files to modify:**
  - `package.json`
- **Changes:**
  1. Add `"type": "module"` at root level
  2. Update scripts to use `--experimental-modules` if needed (unlikely with Node 18+)
  3. Verify all dependencies support ESM

- **Current package.json snippet:**
  ```json
  {
    "name": "kanban-app",
    "version": "0.1.0",
    "private": true,
    "scripts": { ... }
  }
  ```

- **Target:**
  ```json
  {
    "name": "kanban-app",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": { ... }
  }
  ```

- **Why it matters:**
  - Tells Node.js to treat `.js` files as ESM, not CJS
  - Required for ESLint 9+ and other ESM-native tools
  - Enables `import`/`export` syntax in `.js` files

- **Estimated effort:** 0.5 hours
- **Verification:**
  - `npm list` shows no errors
  - Node.js v18+ available (check: `node --version`)
  - No immediate build/dev errors

- **Subtask order:** Day 1

### Subtask 1.2: Review Dependency ESM Compatibility

- **Owner:** @architect
- **Files to check:**
  - `package.json` dependencies
  - Key packages: `next`, `jest`, `@supabase/supabase-js`, `typescript-eslint`

- **Critical dependencies status:**
  | Package | Version | ESM Support | Notes |
  |---------|---------|-------------|-------|
  | `next` | 16.2.2 | ✅ Full | Next.js 12+ is ESM-compatible |
  | `jest` | 29.7.0 | ✅ Partial | ESM via `ts-jest` (v29+) |
  | `@supabase/supabase-js` | 2.39.0 | ✅ Full | Supports both CJS/ESM |
  | `typescript-eslint` | 8.58.0 | ✅ Full | ESM native |
  | `yaml` | 2.8.3 | ✅ Full | Modern ESM support |
  | `jose` | 6.2.2 | ✅ Full | ESM native |
  | `inquirer` | 13.3.2 | ⚠️ Check | May need ESM support |

- **Action items:**
  - Verify `inquirer` ESM compatibility (v13+ should support it)
  - No package downgrades needed
  - Add notes to TECHNICAL-DEBT.md if any packages lack ESM

- **Estimated effort:** 1 hour
- **Verification:**
  - All critical packages verified
  - No breaking changes identified
  - Compatibility matrix documented

- **Subtask order:** Day 1-2

### Subtask 1.3: Configure tsconfig.json (if needed)

- **Owner:** @architect + @dev
- **Files to check:**
  - `tsconfig.json`
  - Current: `"module": "ESNext"` ✅ Already correct

- **Current state:**
  ```json
  {
    "compilerOptions": {
      "module": "ESNext",
      "moduleResolution": "bundler",
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true
    }
  }
  ```

- **Target:** No changes needed! ✅ Already optimized for ESM
  - `module: ESNext` → Emit ESM syntax
  - `moduleResolution: bundler` → Next.js compatible
  - `esModuleInterop: true` → Still helpful for interop with legacy CJS
  - `allowSyntheticDefaultImports: true` → Allows default imports from CJS

- **Estimated effort:** 0.25 hours (review only)
- **Verification:**
  - `npm run typecheck` passes without errors

- **Subtask order:** Day 2

### Subtask 1.4: QA Gate Phase 1

- **Owner:** @qa (Quinn)
- **Verification checklist:**
  - [ ] `package.json` contains `"type": "module"`
  - [ ] `npm install` succeeds without warnings
  - [ ] `npm run typecheck` passes
  - [ ] No peer dependency conflicts
  - [ ] Node version check: ≥ 18.0.0
  - [ ] All critical dependencies ESM-compatible

- **Estimated effort:** 1 hour
- **Depends on:** 1.1, 1.2, 1.3
- **Verdict:** PASS (proceed to Phase 2) or NO-GO (list blockers)
- **Gate file:** `docs/qa/gates/esm-migration-phase-1.yml`
- **Subtask order:** Day 3

---

## Phase 2: Config File Migration (Week 2)

**Owner Agent:** @dev (Dex) — Implementation  
**QA Agent:** @qa (Quinn) — Testing  
**Dependencies:** Phase 1 COMPLETE + PASS

### Subtask 2.1: Migrate next.config.js → ESM

- **Owner:** @dev
- **File:** `next.config.js`
- **Current (CommonJS):**
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    experimental: {
      esmExternals: true,
    },
  };

  module.exports = nextConfig;
  ```

- **Target (ESM):**
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    experimental: {
      esmExternals: true,
    },
  };

  export default nextConfig;
  ```

- **Changes:**
  1. Replace `module.exports` with `export default`
  2. No other logic changes needed
  3. JSDoc comment `@type` still works

- **Estimated effort:** 0.5 hours
- **Verification:**
  - `npm run build` succeeds
  - `npm run dev` starts without errors
  - No Next.js warnings about module format

- **Depends on:** Phase 1 PASS
- **Subtask order:** Day 1 of Week 2

### Subtask 2.2: Migrate jest.config.js → ESM

- **Owner:** @dev
- **File:** `jest.config.js`
- **Current (CommonJS):**
  ```javascript
  const nextJest = require("next/jest");

  const createJestConfig = nextJest({
    dir: "./",
  });

  const customJestConfig = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    // ...
  };

  module.exports = createJestConfig(customJestConfig);
  ```

- **Target (ESM):**
  ```javascript
  import nextJest from "next/jest.js";

  const createJestConfig = nextJest({
    dir: "./",
  });

  const customJestConfig = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    // ...
  };

  export default createJestConfig(customJestConfig);
  ```

- **Critical changes:**
  1. `require("next/jest")` → `import nextJest from "next/jest.js"`
     - Note: Must include `.js` extension for ESM
  2. `module.exports` → `export default`

- **Why .js extension is needed:**
  - ESM requires explicit file extensions
  - Node.js resolution algorithm is stricter with ESM
  - Next.js exports are ready for this

- **Estimated effort:** 1 hour
- **Verification:**
  - `npm test` runs without errors
  - All tests pass: `npm run test`
  - Jest configuration loads correctly
  - `npm run test:watch` works

- **Depends on:** 2.1
- **Subtask order:** Day 2 of Week 2

### Subtask 2.3: Migrate postcss.config.js → ESM

- **Owner:** @dev
- **File:** `postcss.config.js`
- **Current (CommonJS):**
  ```javascript
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```

- **Target (ESM):**
  ```javascript
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```

- **Changes:**
  1. `module.exports` → `export default`
  2. No other changes (no requires/imports)

- **Estimated effort:** 0.5 hours
- **Verification:**
  - `npm run build` completes without CSS errors
  - PostCSS plugins load correctly
  - Tailwind CSS processes without warnings
  - CSS files generated correctly

- **Depends on:** 2.2
- **Subtask order:** Day 3 of Week 2

### Subtask 2.4: Verify All Config Files Work Together

- **Owner:** @dev
- **Verification steps:**
  1. Run `npm run build` → Success
  2. Run `npm run dev` → Starts on port 3017
  3. Run `npm test` → All tests pass
  4. Run `npm run typecheck` → No errors
  5. Run `npm run lint` → No new errors

- **Estimated effort:** 1.5 hours
- **Testing checklist:**
  - [ ] Build succeeds without errors
  - [ ] Dev server starts and pages load
  - [ ] All tests pass
  - [ ] TypeScript checks pass
  - [ ] ESLint runs without config errors
  - [ ] No module resolution errors in logs

- **Depends on:** 2.1, 2.2, 2.3
- **Subtask order:** Day 4 of Week 2

### Subtask 2.5: QA Gate Phase 2

- **Owner:** @qa (Quinn)
- **Verification checklist:**
  - [ ] `next.config.js` uses `export default` ✓
  - [ ] `jest.config.js` uses ESM imports + `export default` ✓
  - [ ] `postcss.config.js` uses `export default` ✓
  - [ ] `npm run build` succeeds
  - [ ] `npm run dev` works
  - [ ] `npm test` — all tests pass
  - [ ] `npm run typecheck` — no errors
  - [ ] `npm run lint` — no new errors
  - [ ] No runtime module resolution errors

- **Estimated effort:** 2 hours
- **Depends on:** 2.4
- **Verdict:** PASS (proceed to Phase 3) or FAIL (return to @dev)
- **Gate file:** `docs/qa/gates/esm-migration-phase-2.yml`
- **Subtask order:** Day 5 of Week 2

---

## Phase 3: Hook Files & Final Verification (Week 3)

**Owner Agent:** @dev (Dex)  
**QA Agent:** @qa (Quinn)  
**Dependencies:** Phase 2 COMPLETE + PASS

### Subtask 3.1: Migrate .gemini/hooks/*.js → ESM

- **Owner:** @dev
- **Files to migrate:**
  - `.gemini/hooks/after-tool.js`
  - `.gemini/hooks/before-agent.js`
  - `.gemini/hooks/before-tool.js`
  - `.gemini/hooks/rewind-handler.js`
  - `.gemini/hooks/session-end.js`
  - `.gemini/hooks/session-start.js`

- **Pattern migration** (same for all files):
  ```javascript
  // Before (CommonJS)
  const fs = require('fs');
  const path = require('path');
  
  module.exports = async (context) => {
    // hook logic
  };
  ```

  ```javascript
  // After (ESM)
  import fs from 'fs';
  import path from 'path';
  
  export default async (context) => {
    // hook logic
  };
  ```

- **Critical notes:**
  - ESM requires `.js` extensions in import paths (if importing local modules)
  - `__dirname` and `__filename` are not available in ESM
  - If used, must import: `import { fileURLToPath } from 'url';`
  - Each file is a **separate transformation** — no cross-file logic changes

- **Estimated effort:** 2-3 hours (6 files)
- **Per-file effort:** 20-30 minutes each

- **Example transformation** (if file uses `__dirname`):
  ```javascript
  // Add at top:
  import { fileURLToPath } from 'url';
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  ```

- **Verification per file:**
  - [ ] All `require()` → `import` statements
  - [ ] `module.exports` → `export default`
  - [ ] No syntax errors: `node --check filename.js`
  - [ ] If uses `__dirname`: properly imported

- **Depends on:** Phase 2 PASS
- **Subtask order:** Day 1-2 of Week 3

### Subtask 3.2: Full Test Suite Verification

- **Owner:** @dev + @qa
- **Testing steps:**
  1. Run full build: `npm run build`
  2. Run full test suite: `npm test`
  3. Run dev server: `npm run dev` (manual 5-minute check)
  4. Verify no module warnings in console

- **Edge cases to verify:**
  - [ ] Hooks execute correctly when running Claude Code
  - [ ] No "module not found" errors
  - [ ] No circular dependency warnings
  - [ ] File system operations in hooks still work
  - [ ] Path resolution works correctly

- **Estimated effort:** 2 hours
- **Depends on:** 3.1
- **Subtask order:** Day 3 of Week 3

### Subtask 3.3: Remove .eslintrc.json (Already have eslint.config.js)

- **Owner:** @dev
- **Action:** Delete `.eslintrc.json`
- **Reason:**
  - `eslint.config.js` (ESM) is already the modern ESLint 9 format
  - Having both causes confusion/conflicts
  - Need explicit removal to avoid legacy config being used

- **Verification:**
  - [ ] `npm run lint` still works
  - [ ] ESLint uses `eslint.config.js` only
  - [ ] No warnings about config file duplication

- **Estimated effort:** 0.5 hours
- **Depends on:** 3.2
- **Subtask order:** Day 3 of Week 3

### Subtask 3.4: Update Documentation

- **Owner:** @dev
- **Files to create/update:**
  - Create: `docs/MIGRATION-NOTES.md` — Document why ESM, what changed
  - Update: `README.md` — Add note about Node.js 18+ requirement
  - Update: Contributing guide if exists

- **MIGRATION-NOTES.md content:**
  ```markdown
  # ESM Migration (April 2026)

  ## What Changed
  - Migrated from CommonJS (CJS) to ESM across all `.js` config files
  - Updated: next.config.js, jest.config.js, postcss.config.js, .gemini/hooks/*.js
  - Removed: .eslintrc.json (using eslint.config.js now)

  ## Why
  - ESLint 9+ requires ESM
  - Align with JavaScript ecosystem standards
  - Enable future tooling upgrades

  ## Files Changed
  - next.config.js: module.exports → export default
  - jest.config.js: require() → import, module.exports → export default
  - postcss.config.js: module.exports → export default
  - .gemini/hooks/*: All 6 files migrated to ESM

  ## Requirements
  - Node.js ≥ 18.0.0 (ESM native support)
  - No special setup needed — ESM is standard now

  ## Troubleshooting
  - "Cannot find module": Check import paths have `.js` extensions
  - "__dirname not defined": Import from 'url' module
  ```

- **Estimated effort:** 1 hour
- **Depends on:** 3.3
- **Subtask order:** Day 4 of Week 3

### Subtask 3.5: QA Gate Phase 3 — Final Verification

- **Owner:** @qa (Quinn)
- **Comprehensive verification checklist:**
  - [ ] All 6 hook files migrated to ESM
  - [ ] `.eslintrc.json` removed
  - [ ] `npm run build` succeeds
  - [ ] `npm test` — all tests pass
  - [ ] `npm run lint` — no errors
  - [ ] `npm run typecheck` — clean
  - [ ] `npm run dev` — starts without module errors
  - [ ] Manual test: Navigate to app, check console for errors
  - [ ] Documentation updated
  - [ ] No "require is not defined" errors anywhere
  - [ ] No module resolution warnings

- **Manual integration test:**
  1. Start dev server: `npm run dev`
  2. Open http://localhost:3017
  3. Perform basic user flows: login, register, etc.
  4. Check browser console for errors (F12)
  5. Check terminal for warnings

- **Estimated effort:** 3 hours
- **Depends on:** 3.1, 3.2, 3.3, 3.4
- **Verdict:** PASS (complete) or FAIL (return to @dev)
- **Gate file:** `docs/qa/gates/esm-migration-phase-3.yml`
- **Subtask order:** Day 5 of Week 3

---

## Acceptance Criteria

### Phase 1 ✓
- [ ] `package.json` has `"type": "module"`
- [ ] All dependencies verified for ESM support
- [ ] `tsconfig.json` confirmed optimal
- [ ] TypeScript compiles without errors
- [ ] No build warnings

### Phase 2 ✓
- [ ] `next.config.js` uses ESM syntax
- [ ] `jest.config.js` uses ESM syntax
- [ ] `postcss.config.js` uses ESM syntax
- [ ] All config files load correctly
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] Dev server runs cleanly

### Phase 3 ✓
- [ ] All 6 hook files migrated to ESM
- [ ] `.eslintrc.json` removed
- [ ] Full test suite passes
- [ ] Manual integration testing PASS
- [ ] Documentation complete
- [ ] Zero module resolution errors

---

## Risk & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Build failure after phase 1 | HIGH | Staged testing after each phase, revert if needed |
| Test runner incompatibility | HIGH | Jest v29+ has full ESM support via ts-jest |
| Hook files break during ESM migration | MEDIUM | Test each hook individually before full suite |
| Module resolution errors in production | MEDIUM | Comprehensive QA gate with manual testing |
| __dirname undefined in hooks | MEDIUM | Import pattern documented in subtask 3.1 |

---

## Timeline

```
Week 1: Phase 1 (Foundation)
  ├─ 1.1: Update package.json (Day 1)
  ├─ 1.2: Dependency compatibility review (Day 1-2)
  ├─ 1.3: tsconfig.json review (Day 2)
  └─ 1.4: QA gate phase 1 (Day 3)

Week 2: Phase 2 (Config Files)
  ├─ 2.1: Migrate next.config.js (Day 1)
  ├─ 2.2: Migrate jest.config.js (Day 2)
  ├─ 2.3: Migrate postcss.config.js (Day 3)
  ├─ 2.4: Integration verification (Day 4)
  └─ 2.5: QA gate phase 2 (Day 5)

Week 3: Phase 3 (Hooks & Final)
  ├─ 3.1: Migrate 6 hook files (Day 1-2)
  ├─ 3.2: Full test suite verification (Day 3)
  ├─ 3.3: Remove .eslintrc.json (Day 3)
  ├─ 3.4: Update documentation (Day 4)
  └─ 3.5: QA gate phase 3 (Day 5)
```

---

## Agent Responsibilities Summary

| Agent | Role | Phases | Key Tasks |
|-------|------|--------|-----------|
| **@architect (Aria)** | Architecture Lead | 1 | Assess dependencies, design migration strategy |
| **@dev (Dex)** | Implementation | 1, 2, 3 | Migrate all files, run build/test verification |
| **@qa (Quinn)** | QA & Validation | 1, 2, 3 | Gate verification, integration testing |
| **@devops (Gage)** | Deployment (optional) | Post-3 | Push to main (if needed), CI/CD updates |

---

## Success Metrics

By end of Phase 3:
- ✅ 100% of config files use ESM syntax
- ✅ ESLint 9+ compatible and working
- ✅ All tests passing
- ✅ Build succeeds without warnings
- ✅ Dev server runs cleanly
- ✅ Future tooling upgrades enabled
- ✅ Team can upgrade ESLint without blockers

---

## Common Issues & Solutions

### "Cannot find module 'next/jest'"
**Solution:** Add `.js` extension in jest.config.js:
```javascript
import nextJest from "next/jest.js";  // ← Must include .js
```

### "__dirname is not defined"
**Solution:** Add to top of file:
```javascript
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
```

### "Module not found: .eslintrc.json"
**Solution:** Delete the old `.eslintrc.json` file (we have `eslint.config.js` already)

### Jest tests fail with "Cannot use import outside module"
**Solution:** Ensure ts-jest is configured correctly in jest.config.js:
```javascript
const config = createJestConfig(customJestConfig);
// ts-jest should auto-detect ESM from tsconfig.json
```

### "Unexpected token export"
**Solution:** Verify Node.js version ≥ 18.0.0:
```bash
node --version  # Should show v18.x or higher
```

---

## Next Steps After Phase 3

1. **PR Creation:** @devops creates PR with all ESM changes
2. **ESLint 9 Upgrade:** Optional future task (now unblocked)
3. **Monorepo Consideration:** If expanding, ESM foundation helps
4. **Team Communication:** Document for contributors

---

## Notes for Implementation

1. **Phase 1 is prerequisite:** Do not skip dependency verification
2. **Config files are strict:** ESM requires explicit file extensions (.js)
3. **Test early and often:** After each config file migration
4. **Hook files are last:** They depend on everything else being stable
5. **Document as you go:** Update MIGRATION-NOTES.md with learnings

---

**Plan Status:** Ready for Execution  
**Next Step:** Phase 1 Subtask 1.1 — @dev updates package.json

---

_Synkra AIOX Plan Format v2.0 — Architecture-led ESM Migration Strategy_
