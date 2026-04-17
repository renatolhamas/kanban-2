# GitHub Actions Workflows

Automated quality gates and design system enforcement.

## Workflows

### 1. Design System Compliance (`design-system-check.yml`)

**Trigger:** PRs/pushes that modify `src/components/` or `app/`

**Checks:**
- ✅ Design token usage compliance (`npm run check:tokens`)
- ✅ Linting (`npm run lint`)
- ✅ Type safety (`npm run typecheck`)
- ✅ Build verification (`npm run build`)

**Failure Action:** PR blocks merge if any check fails

**For Developers:**
```bash
# Run locally before pushing
npm run check:tokens
npm run lint
npm run typecheck
npm run build
```

### 2. Quality Gates (`quality-gates.yml`)

**Trigger:** All PRs and pushes to main/master

**Checks:**
- ✅ Unit tests (`npm test`)
- ✅ Accessibility (`jest-axe`)
- ✅ Type safety (`npm run typecheck`)
- ✅ Build (`npm run build`)
- ✅ Linting (`npm run lint`)

**Report:** Summary posted to PR with status badges

## Setup Instructions

### First Time Setup

1. Ensure workflows are in `.github/workflows/`
2. Push to remote:
   ```bash
   git add .github/workflows/
   git commit -m "ci: add GitHub Actions workflows"
   git push
   ```

3. Go to **Settings → Actions → General**
   - Enable: "Allow all actions and reusable workflows"

### Protected Branch Rules (Optional)

To require passing checks before merge:

1. Go to **Settings → Branches → Branch Protection Rules**
2. Add rule for `main` or `master`
3. Require status checks:
   - ✅ Design System Compliance
   - ✅ Tests
   - ✅ Build Verification

## Debugging Failed Checks

### Token Compliance Failed

```bash
npm run check:tokens
```

**Common fixes:**
- Use `bg-primary` instead of `bg-emerald-500`
- Use `text-text-inverse` instead of `text-white`
- Use `border-surface-container-low` instead of `border-gray-200`
- Use `shadow-ambient` instead of `shadow-lg`

### Lint Failed

```bash
npm run lint
```

### Type Check Failed

```bash
npm run typecheck
```

### Build Failed

```bash
npm run build
```

## Customizing Workflows

### Adjust Token Check Sensitivity

Edit `.claude/hooks/design-token-check.cjs`:
- Modify `HARDCODED_PATTERNS` array
- Add new patterns or exceptions

### Add New Checks

1. Edit workflow file (`.github/workflows/*.yml`)
2. Add new `step:` under the job
3. Configure condition (e.g., `if: always()`)

### Skip Checks for Emergency

Add `[skip-ci]` to commit message:
```bash
git commit -m "fix: critical hotfix [skip-ci]"
```

⚠️ **Use sparingly** - bypassing quality gates risks regressions.

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. View latest runs with status

### PR Status Checks

Green checkmark = All gates passed  
Red X = One or more gates failed

Click on "Details" to see full output.

## Performance

- **Design System Check:** ~30-45 seconds
- **Quality Gates:** ~2-3 minutes total
- **Full Suite:** ~4-5 minutes

To speed up:
- Move heavy checks to merge commit (not on every push)
- Use caching for node_modules
- Run tests in parallel

---

**Questions?** See `docs/design-system/ENFORCEMENT-GUIDE.md`
