# Evolution Stables — Website Build Summary

**Date:** 2026-05-20  
**Status:** � Phase 2 — Fresh Build (Press section complete)  
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

**Files:** ~35 source files  
**Folders:** Complete skeleton + key components

```
02_website/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage with all sections
│   │   ├── press/page.tsx        ← Press page (3-col grid, SEO)
│   │   ├── admin/                ← Admin dashboard (CRUD UI)
│   │   ├── marketplace/page.tsx  ← Marketplace landing
│   │   └── mystable/page.tsx     ← User dashboard
│   ├── components/
│   │   ├── NavBar.tsx            ← Navigation
│   │   ├── Footer.tsx            ← Footer
│   │   └── sections/
│   │       ├── HeroSection.tsx
│   │       ├── PressShowcaseSection.tsx ← Production code (logos + carousel)
│   │       ├── AboutSection.tsx
│   │       ├── HowItWorksSection.tsx
│   │       ├── MarketplaceSection.tsx
│   │       └── FAQSection.tsx
│   └── lib/
│       ├── press-articles.ts     ← Press data
│       └── api.ts                ← API client
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

## Architecture Rules

1. **Zero debt** — Only 3 dependencies (next, react, tailwind)
2. **Extract, don't rebuild** — Get assets/content from existing sources
3. **Fresh build** — Next.js 16 + Tailwind 4 from scratch
4. **SEO-first** — Lighthouse = 100 target
5. **Backend handshake** — All data via HTTP calls to `01_evolution/`
6. **No secrets** — Public keys only, secrets live in backend
7. **Production as source of truth** — Copy exact code from Evolution-3.1 GitHub repo instead of recreating from scratch

---

## Related

- **Current status:** [`PROGRESS.md`](PROGRESS.md) — Session tracker, what's next, architecture status
- **Plan:** [`GAME_PLAN.md`](../GAME_PLAN.md) — Build plan
- **Backend:** [`01_evolution/docs/BUILD_SUMMARY.md`](../../01_evolution/docs/BUILD_SUMMARY.md) — Backend map
