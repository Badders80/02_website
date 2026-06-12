# 02_website — Progress

> **This project uses `01_evolution` as the Task Master hub.**
> For tasks, sprints, logs, and audits, see:
> [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)

---

## Local Status

**Current Phase:** � Phase 4 — Backend Integration (Auth pipeline in progress)  
**Last Updated:** 2026-06-11  

**Phase 0:** ✅ Complete — Asset extraction (~40 images in public/images/)  
**Phase 1:** ✅ Complete — Content extraction (faq.json, press.json, footer.json)  
**Phase 2:** ✅ Complete — Press & Marketplace sections & pages  
**Phase 3:** ✅ Complete — SEO + deployment (Vercel live at evolution.2.0)  
**Phase 4:** 🟡 In Progress — Backend integration (WIF infra ready, Vercel OIDC pending)

**Total Files:** ~45 source files  
**Blockers:** 1 (Vercel OIDC not yet enabled in dashboard)

---

## Session Log

| Date | Focus | Status | Log |
|------|-------|--------|-----|
| 2026-05-19 | Repo setup + planning | ✅ Complete | [../../01_evolution/docs/logs/02-website-2026-05-19.md](../../01_evolution/docs/logs/02-website-2026-05-19.md) |
| 2026-05-20 | Press section + press page | ✅ Complete | [logs/2026-05-20.md](logs/2026-05-20.md) |
| 2026-05-22 | Marketplace Section & Prototype | ✅ Complete | [logs/2026-05-22.md](logs/2026-05-22.md) |
| 2026-06-11 | GCP Auth Blocker & WIF Infrastructure | 🟡 In Progress | [logs/2026-06-11.md](logs/2026-06-11.md) |

---

## What's Next

**Priority 1 — 🔴 BLOCKER:** Enable Vercel OIDC in Vercel Dashboard (manual step)
- Go to Vercel project → Settings → Security → OpenID Connect → Enable
- This makes `VERCEL_OIDC_TOKEN` available to serverless functions
- Required for WIF token exchange → GCP Cloud Functions access

**Priority 2:** Redeploy Vercel after OIDC enabled
**Priority 3:** Test full chain — visit /handshake, verify 7/7 green
**Priority 4:** Test "Apply to Own" → KYC flow with real user
**Priority 5:** Remaining homepage sections polish
**Priority 6:** Stables page, MyStable dashboard real data

See [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md) for canonical task list and sprint status.

---

## Architecture

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Browse horses** | Marketplace sandbox | `GET /ssot/horses` (via Cloud Run proxy) | 🟡 Auth pending |
| **Assets/media** | Image display | `GET /assets/*` (via Cloud Run proxy) | 🟡 Auth pending |
| **KYC verification** | Redirect UI | `POST /kyc/create-session` (via Cloud Run proxy) | 🟡 Auth pending |
| **Login/auth** | Firebase UI + `src/lib/gcp-auth.ts` | Token verification in Cloud Functions | ✅ Code ready |
| **Auth pipeline** | `website-api@` SA via WIF | Vercel OIDC → GCP STS → identity token | 🟡 Vercel OIDC not enabled |

**New Infrastructure (this session):**
```
Vercel → Cloud Run Proxy (evolution-api-proxy) → Cloud Functions (ssot/assets/kyc)
         ↑ WIF token exchange (vercel-pool / vercel-oidc)
         ↑ website-api@ service account impersonation
```

**Cloud Functions deployed:**
- `ssot` — ACTIVE (v13, Firebase Auth middleware)
- `assets` — ACTIVE (v5, Firebase Auth middleware)
- `kyc` — ACTIVE (v9, Firebase Auth middleware)

**Cloud Run:**
- `evolution-api-proxy` — SERVING, acts as IAM bridge

**Environment:**
```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_BYPASS_AUTH_KYC=true  # local dev only
```

---

## Related

- **Task Master / Progress:** [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)
- **Build Summary (local):** [`BUILD_SUMMARY.md`](BUILD_SUMMARY.md) — Architecture + what exists
- **Plan:** [`../GAME_PLAN.md`](../GAME_PLAN.md) — Build plan
- **Backend:** [`../../01_evolution/docs/BUILD_SUMMARY.md`](../../01_evolution/docs/BUILD_SUMMARY.md) — Backend map
