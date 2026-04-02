# 11. Development Workflow

## 11.1 Local Setup

```bash
# Clone & install
git clone <repo>
npm install

# Environment
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_KEY, etc.

# Start dev server
npm run dev  # http://localhost:3000

# Supabase local (optional)
supabase start
supabase db push

# Run tests
npm test

# Lint & typecheck
npm run lint
npm run typecheck
```

## 11.2 Code Review Checklist

Before marking complete, verify:
- ✅ TypeScript compiles without errors (`npm run typecheck`)
- ✅ Linting passes (`npm run lint`)
- ✅ Tests pass (`npm test`)
- ✅ No hardcoded secrets or credentials
- ✅ RLS policies applied (if DB changes)
- ✅ Error handling implemented
- ✅ Loading/error states added to UI

---
