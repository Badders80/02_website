# 02_website — Progress

> **This project uses `01_evolution` as the Task Master hub.**
> For tasks, sprints, logs, and audits, see:
> [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)

---

## Local Status

**Current Phase:** 🟢 Phase 2 — Fresh Build  
**Last Updated:** 2026-05-20  

**Phase 0:** ✅ Complete — Asset extraction (~40 images in public/images/)  
**Phase 1:** ✅ Complete — Content extraction (faq.json, press.json, footer.json)  
**Phase 2:** � Complete — Press section (PressShowcaseSection + press page)  
**Phase 3:** ⬜ Not started — SEO + deployment

**Total Files:** ~35 source files  
**Blockers:** 0

---

## Session Log

| Date | Focus | Status | Log |
|------|-------|--------|-----|
| 2026-05-19 | Repo setup + planning | ✅ Complete | [../../01_evolution/docs/logs/02-website-2026-05-19.md](../../01_evolution/docs/logs/02-website-2026-05-19.md) |
| 2026-05-20 | Press section + press page | ✅ Complete | [logs/2026-05-20.md](logs/2026-05-20.md) |

---

## What's Next

**Priority 1:** Complete remaining homepage sections (About, How It Works, Marketplace, FAQ)
**Priority 2:** SEO infrastructure (sitemap, JSON-LD, Open Graph)
**Priority 3:** Vercel deployment
**Priority 4:** Backend integration testing

See [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md) for canonical task list and sprint status.

---

## Architecture

| Feature | Frontend | Backend |
|---------|----------|---------|
| **Browse horses** | Display UI | `GET /ssot/horses` |
| **KYC verification** | Redirect UI | `POST /kyc/create-session` |
| **Login/auth** | Firebase UI | Token verification |

**Environment:**
```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
```

---

## Related

- **Task Master / Progress:** [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)
- **Build Summary (local):** [`BUILD_SUMMARY.md`](BUILD_SUMMARY.md) — Architecture + what exists
- **Plan:** [`../GAME_PLAN.md`](../GAME_PLAN.md) — Build plan
- **Backend:** [`../../01_evolution/docs/BUILD_SUMMARY.md`](../../01_evolution/docs/BUILD_SUMMARY.md) — Backend map
