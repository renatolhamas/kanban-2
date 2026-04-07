# ⚠️ CRITICAL: Evo GO vs Evolution API — Clear Distinction

**Status:** MANDATORY READING FOR ALL TEAM MEMBERS  
**Date:** 2026-04-06  
**Author:** Aria (Architect)

---

## The Mistake We Almost Made

This project uses **EVO GO**, NOT Evolution API v2.

These are **TWO COMPLETELY DIFFERENT PROJECTS** maintained by Evolution Foundation:

| Aspect | Evolution API v2 | Evo GO |
|--------|------------------|--------|
| **Language** | Node.js | Go |
| **GitHub** | https://github.com/EvolutionAPI/evolution-api | https://github.com/EvolutionAPI/evolution-go |
| **Docs** | doc.evolution-api.com/v2 | docs.evolutionfoundation.com.br/evolution-go |
| **Status** | ⚠️ Original version (may be legacy) | ✅ Modern, optimized version |
| **Status in this project** | ❌ DO NOT USE | ✅ USE THIS ONE |

---

## What We're Using: EVO GO

- **Documentation:** https://docs.evolutionfoundation.com.br/evolution-go ✅ **ACESSÍVEL**
- **Installation Guide:** https://docs.evolutionfoundation.com.br/evolution-go/installation ✅ **ACESSÍVEL**
- **GitHub Repository:** https://github.com/EvolutionAPI/evolution-go ✅ **OPEN SOURCE**
- **Technology:** Go language (high-performance, otimizado)

---

## What We're NOT Using: Evolution API v2

- **Documentation:** https://doc.evolution-api.com/v2/api-reference
- **GitHub Repository:** https://github.com/EvolutionAPI/evolution-api
- **Technology:** Node.js
- **Status:** ❌ **DEPRECATED FOR THIS PROJECT**

---

## Why This Matters

If you're looking for documentation or examples:

1. **Check Evo GO docs first:**  
   👉 https://docs.evolutionfoundation.com.br/evolution-go

2. **IF you see Evolution API v2 references:**  
   👉 IGNORE THEM — they don't apply to our project

3. **IF you find examples online using Evolution API v2:**  
   👉 These may not work with Evo GO — verify before implementing

---

## Files Updated (2026-04-06)

The following files were corrected to remove all Evolution API v2 references:

- ✅ `docs/prd/9-technical-architecture.md` — Now references Evo GO only
- ✅ `docs/prd/15-appendices.md` — References consolidated, deprecated links marked
- ✅ `docs/brief.md` — API documentation link corrected
- ✅ `docs/architecture/6-integration-patterns-evolution-api-supabase.md` — Title and content updated
- ✅ `docs/architecture/index.md` — TOC updated
- ✅ `docs/db/pesquisa.schema.evogo.md` — Research document corrected

---

## Checklist for Team

When working on Evo GO integration, verify:

- [ ] You're consulting **Evo GO docs** (https://docs.evolutionfoundation.com.br/evolution-go)
- [ ] You're referencing **Evo GO GitHub** (https://github.com/EvolutionAPI/evolution-go)
- [ ] You're NOT using Evolution API v2 code examples
- [ ] You're NOT following Evolution API v2 documentation
- [ ] Your PR/commit references clarify "Evo GO" (not ambiguous "Evolution API")

---

## If You Have Questions

1. Check `docs/db/pesquisa.schema.evogo.md` — comprehensive research
2. Check `docs/prd/9-technical-architecture.md` — section 9.3 Evo GO Integration
3. Check Evo GO official docs: https://docs.evolutionfoundation.com.br/evolution-go

---

**Last Updated:** 2026-04-06 by Aria  
**Next Review:** When starting Epic 2 (Evo GO Setup & Pairing)
