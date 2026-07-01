# 02_website — Progress

> **STALE (2026-06-17, GCP/WIF era).** Do not use for agent boot. Live state: [`../STATE.md`](../STATE.md).

> **Historical:** This project used `01_evolution` as the Task Master hub.
> For backend sprints/logs, see [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)

---

## Local Status

**Current Phase:** � Phase 6 — Production Deployment (WIF Configuration Required)  
**Last Updated:** 2026-06-17  
**Blocker:** GCP WIF Provider Configuration (Manual GCP Console Action Required)

**Phase 0:** ✅ Complete — Asset extraction (~40 images in public/images/)  
**Phase 1:** ✅ Complete — Content extraction (faq.json, press.json, footer.json)  
**Phase 2:** ✅ Complete — Press & Marketplace sections & pages  
**Phase 3:** ✅ Complete — SEO + deployment (Vercel live)  
**Phase 4:** ✅ Complete — Backend integration (WIF infra ready)  
**Phase 5:** ✅ Complete — Ownership Application System (email notifications, admin dashboard)  
**Phase 6:** ⏸️ In Progress — Production deployment (www.evolutionstables.nz live, awaiting WIF fix)

### 🔴 Current Blocker (2026-06-17)

**Issue:** Handshake endpoint shows 0/7 passing, KYC returns 403  
**Root Cause:** GCP Workload Identity Provider not configured with Vercel's OIDC issuer  
**Required Action:** Manual configuration in GCP Console (5 minutes)  
**Instructions:** See [docs/SESSION_BRIEF_2026_06_17.md](docs/SESSION_BRIEF_2026_06_17.md)

### ✅ What's Complete

- Firebase Auth fully implemented (login/logout working)
- NextAuth completely removed
- KYC route fixed (correct `/kyc/create-session` endpoint)
- All environment variables set in Vercel
- OIDC enabled in Vercel Security settings
- Build passes (0 errors, 0 warnings)
- All routes deployed and returning 200 OK
- Production site live: https://www.evolutionstables.nz

### ⏸️ What's Blocked

- GCP WIF provider configuration (gcloud CLI returning contradictory errors)
- Handshake endpoint (0/7 due to 403 from all backend APIs)
- KYC verification flow (requires WIF to work)
- Backend API integration (SSOT, Assets, KYC all returning 403)

### 🎯 Next Steps

1. Configure WIF provider in GCP Console (see session brief)
2. Redeploy to Vercel
3. Verify handshake passes 7/7
4. Test full KYC flow
5. Launch to production

**Total Files:** ~60 source files  
**Blockers:** 1 (Organization policy blocking public Cloud Function access)

---

## Session Log

| Date | Focus | Status | Log |
|------|-------|--------|-----|
| 2026-05-19 | Repo setup + planning | ✅ Complete | [../../01_evolution/docs/logs/02-website-2026-05-19.md](../../01_evolution/docs/logs/02-website-2026-05-19.md) |
| 2026-05-20 | Press section + press page | ✅ Complete | [logs/2026-05-20.md](logs/2026-05-20.md) |
| 2026-05-22 | Marketplace Section & Prototype | ✅ Complete | [logs/2026-05-22.md](logs/2026-05-22.md) |
| 2026-06-11 | GCP Auth Blocker & WIF Infrastructure | ✅ Complete | [logs/2026-06-11.md](logs/2026-06-11.md) |
| 2026-06-12 | Ownership Application System | ✅ Complete | [logs/2026-06-12.md](logs/2026-06-12.md) |
| 2026-06-17 | Go Live Deployment + Google OAuth | ✅ Complete | [logs/2026-06-17.md](logs/2026-06-17.md) |

---

## What's Next

**Priority 1 — � DEPLOYED:** Production website live at www.evolutionstables.nz
- ✅ Website deployed to Vercel
- ✅ Applications Cloud Function deployed to GCP
- ✅ Google OAuth login implemented
- ⏳ Firebase config needs to be added to Vercel environment variables (manual step)

**Priority 2 — 🟡 BLOCKER:** Organization Policy for Cloud Function
- Function deployed but requires authentication
- Options: (1) Use WIF auth from frontend, (2) Request org policy exception, (3) Grant Vercel OIDC SA access

**Priority 3:** Test full chain — visit /handshake, verify 7/7 green
**Priority 4:** Test "Apply for Ownership" → Admin review flow
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
| **Ownership applications** | ApplyForm component | `POST /applications/submit` (Cloud Function) | ✅ Code complete |
| **Admin dashboard** | Applications page | `GET /applications/list` (Cloud Function) | ✅ Code complete |

**New Infrastructure (this session):**
```
Frontend → Next.js API Routes → Cloud Functions → Firestore → Email Notification
```

**Cloud Functions deployed:**
- `ssot` — ACTIVE (v13, Firebase Auth middleware)
- `assets` — ACTIVE (v5, Firebase Auth middleware)
- `kyc` — ACTIVE (v9, Firebase Auth middleware)
- `applications` — READY TO DEPLOY (new)

**Cloud Run:**
- `evolution-api-proxy` — SERVING, acts as IAM bridge

**Environment:**
```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_BYPASS_AUTH_KYC=true  # local dev only
ADMIN_EMAIL=admin@evolutionstables.nz  # new
```

---

## New Features (This Session)

### Ownership Application System

**What's New:**
- Simple application form (no KYC/payment required)
- Email notification system (placeholder)
- Admin dashboard to view applications
- Firestore storage for applications

**Files Added:**
- `api/applications/` — Cloud Functions backend
- `src/components/marketplace/ApplyForm.tsx` — Frontend component
- `src/app/admin/applications/` — Admin dashboard
- `src/app/api/applications/` — Next.js API routes
- `docs/APPLICATION_SYSTEM.md` — Documentation
- `docs/IMPLEMENTATION_SUMMARY.md` — Implementation summary

**Status:** Code complete, needs deployment

---

## Related

- **Task Master / Progress:** [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)
- **Build Summary (local):** [`BUILD_SUMMARY.md`](BUILD_SUMMARY.md) — Architecture + what exists
- **Plan:** [`../GAME_PLAN.md`](../GAME_PLAN.md) — Build plan
- **Backend:** [`../../01_evolution/docs/BUILD_SUMMARY.md`](../../01_evolution/docs/BUILD_SUMMARY.md) — Backend map
- **Application System:** [`docs/APPLICATION_SYSTEM.md`](docs/APPLICATION_SYSTEM.md) — System documentation
- **Implementation Summary:** [`docs/IMPLEMENTATION_SUMMARY.md`](docs/IMPLEMENTATION_SUMMARY.md) — Implementation details
