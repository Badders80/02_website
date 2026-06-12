# Evolution Stables — Website Build Summary

**Date:** 2026-06-11  
**Status:** 🟡 Phase 4 — Backend Integration (Auth pipeline in progress)  
**Repository:** `02_website/`

> **This is the map.** What the project is, what exists, the rules.
> For session-by-session progress, see [PROGRESS.md](PROGRESS.md).`

---

## What We're Building

Public-facing website for Evolution Stables — the investor and user interface to the backend platform.

**The goal:** Zero-debt replication of evolutionstables.nz with modern tech stack (Next.js 16 + Tailwind 4).

---

## Build Philosophy

**Old approach:** Clone existing build with all its debt  
**New approach:** Extract only visible assets → Build fresh with zero debt

**Zero Debt Means:**
- ✅ Only 3 dependencies (next, react, tailwind)
- ✅ No unused code
- ✅ No hidden infrastructure
- ✅ Clean folder structure
- ✅ Modern tech stack

**Zero Debt Does NOT Mean:**
- ❌ No infrastructure for future features
- ❌ No content management
- ❌ No SEO infrastructure

---

## Architecture

### Frontend (This Repo)
- **Next.js 16** — App Router, TypeScript
- **Tailwind 4** — Utility-first CSS
- **Firebase Auth** — Client SDK (login, signup)
- **Stripe Identity** — Redirect flow (via backend API)

### Backend (01_evolution/)
- **Cloud Functions** — SSOT, Assets, KYC APIs
- **Firestore** — Database
- **Cloud Storage** — Image storage
- **Stripe** — Secret keys, webhooks

### Connection
```
Website (Vercel) → API Calls → Backend (GCP)
```

---

## What Exists Now

**Files:** ~45 source files  
**Folders:** Complete skeleton + key components + auth infrastructure + API proxy

```
02_website/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage with all sections
│   │   ├── press/page.tsx        ← Press page (3-col grid, SEO)
│   │   ├── admin/                ← Admin dashboard (CRUD UI)
│   │   ├── marketplace/page.tsx  ← Marketplace landing
│   │   ├── marketplace-sandbox/  ← Interactive sandbox with "Apply to Own"
│   │   ├── mystable/page.tsx     ← User dashboard
│   │   ├── mystable-sandbox/     ← Sandbox investor dashboard
│   │   ├── handshake/page.tsx    ← Backend handshake diagnostics page
│   │   ├── api/proxy/[...path]/  ← API proxy -> Cloud Run -> Cloud Functions
│   │   └── api/kyc/              ← KYC session creation endpoint
│   ├── components/
│   │   ├── NavBar.tsx            ← Navigation
│   │   ├── Footer.tsx            ← Footer
│   │   ├── KycBanner.tsx         ← KYC status banner
│   │   └── sections/
│   │       ├── HeroSection.tsx
│   │       ├── PressShowcaseSection.tsx ← Production code (logos + carousel)
│   │       ├── AboutSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── MarketplaceSection.tsx
│   │       └── FAQSection.tsx
│   └── lib/
│       ├── press-articles.ts     ← Press data
│       ├── api.ts                ← API client (routes through proxy)
│       ├── gcp-auth.ts           ← WIF token exchange for Vercel→GCP
│       ├── auth.ts               ← Firebase auth utilities
│       ├── auth-context.tsx       ← Auth context provider
│       ├── firebase.ts           ← Firebase client init
│       └── usePurchaseFlow.ts    ← KYC purchase flow hook
├── public/images/                ← ~40 extracted assets
├── dna/content/
│   ├── press.json                ← Press articles
│   ├── faq.json                  ← FAQ items
│   └── footer.json               ← Footer content
└── docs/
    ├── BUILD_SUMMARY.md          ← This file
    ├── PROGRESS.md               ← Session tracker
    └── logs/                     ← Daily logs
```

---

## Architecture

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Browse horses** | Marketplace sandbox | `GET /ssot/horses` (via Cloud Run proxy) | 🟡 Auth pending |
| **Assets/media** | Image display | `GET /assets/*` (via Cloud Run proxy) | 🟡 Auth pending |
| **KYC verification** | Redirect to Stripe Identity | `POST /kyc/create-session` (via Cloud Run proxy) | 🟡 Auth pending |
| **Login/auth** | Firebase UI + gcp-auth.ts | Token verification in Cloud Functions | ✅ Code ready |
| **Auth pipeline** | WIF → `website-api@` SA | Vercel OIDC → GCP STS → identity token | 🟡 OIDC not enabled |

### Request Flow
```
Browser ──Firebase ID Token──→ Vercel (Next.js)
                                   │
                              src/app/api/proxy/[...path]/
                                   │
                            src/lib/gcp-auth.ts (WIF exchange)
                                   │
                         Vercel OIDC Token ─→ GCP STS ─→ identity token
                                   │
                         Cloud Run: evolution-api-proxy
                                   │
                         ┌─────────┼─────────┐
                         ▼         ▼         ▼
                    ssot CF   assets CF   kyc CF
                    (Firebase Auth middleware on all 3)
```

### GCP Infrastructure
- **Cloud Functions:** ssot (v13), assets (v5), kyc (v9) — all ACTIVE with Firebase Auth
- **Cloud Run:** evolution-api-proxy — SERVING, IAM bridge between Vercel and CFs
- **WIF:** vercel-pool / vercel-oidc — OIDC provider linked to https://oidc.vercel.com
- **Service Account:** website-api@evolution-engine.iam.gserviceaccount.com

### Environment
```env
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net
NEXT_PUBLIC_BYPASS_AUTH_KYC=true  # local dev only
```

---

## Architecture Rules

1. **Zero debt** — Only 3 dependencies (next, react, tailwind)
2. **Extract, don't rebuild** — Get assets/content from existing sources
3. **Fresh build** — Next.js 16 + Tailwind 4 from scratch
4. **SEO-first** — Lighthouse = 100 target
5. **Backend handshake** — All data via HTTP calls to `01_evolution/`
6. **No secrets** — Public keys only, secrets live in backend
7. **Production as source of truth** — Copy exact code from Evolution-3.1 GitHub repo instead of recreating from scratch
8. **WIF auth for Vercel→GCP** — All API calls route through Cloud Run proxy using Workload Identity Federation; no `allUsers` IAM bindings, no service account keys

---

## Related

- **Current status:** [`PROGRESS.md`](PROGRESS.md) — Session tracker, what's next, architecture status
- **Plan:** [`GAME_PLAN.md`](../GAME_PLAN.md) — Build plan
- **Backend:** [`01_evolution/docs/BUILD_SUMMARY.md`](../../01_evolution/docs/BUILD_SUMMARY.md) — Backend map
