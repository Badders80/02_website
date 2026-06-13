# 02_website — Progress

> **This project uses `01_evolution` as the Task Master hub.**
> For tasks, sprints, logs, and audits, see:
> [`../../01_evolution/docs/PROGRESS.md`](../../01_evolution/docs/PROGRESS.md)

---

## Local Status

**Current Phase:** 🟢 Phase 5 — Ownership Application System (Complete)  
**Last Updated:** 2026-06-12  

**Phase 0:** ✅ Complete — Asset extraction (~40 images in public/images/)  
**Phase 1:** ✅ Complete — Content extraction (faq.json, press.json, footer.json)  
**Phase 2:** ✅ Complete — Press & Marketplace sections & pages  
**Phase 3:** ✅ Complete — SEO + deployment (Vercel live at evolution.2.0)  
**Phase 4:** ✅ Complete — Backend integration (WIF infra ready)  
**Phase 5:** 🟢 Complete — Ownership Application System (email notifications, admin dashboard)

**Total Files:** ~60 source files  
**Blockers:** 2 (Cloud Function deployment, Email notification implementation)

---

## Session Log

| Date | Focus | Status | Log |
|------|-------|--------|-----|
| 2026-05-19 | Repo setup + planning | ✅ Complete | [../../01_evolution/docs/logs/02-website-2026-05-19.md](../../01_evolution/docs/logs/02-website-2026-05-19.md) |
| 2026-05-20 | Press section + press page | ✅ Complete | [logs/2026-05-20.md](logs/2026-05-20.md) |
| 2026-05-22 | Marketplace Section & Prototype | ✅ Complete | [logs/2026-05-22.md](logs/2026-05-22.md) |
| 2026-06-11 | GCP Auth Blocker & WIF Infrastructure | ✅ Complete | [logs/2026-06-11.md](logs/2026-06-11.md) |
| 2026-06-12 | Ownership Application System | ✅ Complete | [logs/2026-06-12.md](logs/2026-06-12.md) |

---

## What's Next

**Priority 1 — 🔴 BLOCKER:** Deploy Cloud Function
- Run deployment command in `api/applications/`
- Verify function is active and accessible

**Priority 2 — 🔴 BLOCKER:** Implement Email Notifications
- Choose email provider (Gmail API, SendGrid, etc.)
- Implement actual email sending
- Test email delivery

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
