# Evolution Stables — Website

**Repository:** `02_website/`  
**Type:** Frontend (investor/user-facing)  
**Deployment:** Vercel  
**Status:** 🟢 Phase 0 — Planning

---

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## Purpose

Public-facing website for Evolution Stables — the investor and user interface to the backend platform.

**What lives here:**
- Homepage (marketing, stakeholder sections)
- Press page (press releases, media kit)
- About page (team, mission)
- Investor login/KYC flows
- Horse browsing (future)
- MyStable dashboard (future)

**What doesn't live here:**
- ❌ API endpoints (backend)
- ❌ Database (backend)
- ❌ Stripe secret keys (backend)
- ❌ Admin tools (backend)

---

## Architecture

```
02_website/
├── src/                    ← Next.js application
│   ├── app/                ← App Router pages
│   └── lib/                ← Utilities (API client, auth)
├── public/                 ← Static assets
│   └── images/             ← Optimized images
├── dna/                    ← Design system + content
│   ├── content/            ← JSON content files
│   ├── brand/              ← Brand guidelines
│   └── conventions/        ← Development conventions
├── docs/                   ← Documentation
│   ├── PROGRESS.md         ← Build progress
│   ├── logs/               ← Session logs
│   └── audit/              ← Quality audits
├── GAME_PLAN.md            ← Build plan
├── README.md               ← This file
└── package.json            ← Dependencies
```

---

## Backend Handshake

This frontend connects to the backend (`01_evolution/`) via HTTP API calls:

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function getHorses() {
  const res = await fetch(`${API_BASE}/ssot/horses`);
  return res.json();
}

export async function createKYCSession(userId: string) {
  const res = await fetch(`${API_BASE}/kyc/create-session`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  const { session_url } = await res.json();
  window.location.href = session_url; // Redirect to Stripe
}
```

**Backend endpoints:**
- `NEXT_PUBLIC_API_BASE` → `https://...cloudfunctions.net/ssot`
- Stripe Identity → `https://...cloudfunctions.net/kyc/create-session`
- Firebase Auth → Client SDK (no backend needed)

---

## Zero-Debt Policy

**What we extract from existing build:**
- ✅ Images (public/images/ folder)
- ✅ Content (text from homepage, press releases)
- ✅ Brand assets (logos, colors, fonts)

**What we don't extract:**
- ❌ Admin pages
- ❌ Backend code
- ❌ Unused dependencies
- ❌ Configuration files

**What we build fresh:**
- ✅ Next.js 16 + Tailwind 4
- ✅ Minimal dependencies (next, react, tailwind)
- ✅ Clean folder structure
- ✅ SEO infrastructure (sitemap, JSON-LD, Open Graph)

---

## Development Sandboxes

This repository supports a two-stage sandbox workflow:

*   **Static Design Sandbox (`../_sandbox/02_website/`):** Raw HTML/CSS templates for rapid, compile-free design layout and micro-animation prototyping.
*   **Next.js App Sandbox (`src/app/sandbox/`):** React-based implementation utilizing sandbox components (like `ListingGridSandbox.tsx`) equipped with interactive controls for real-time visual tweaks.
*   **Production:** Promoted features reside in `/src/app/` (e.g. `/marketplace`), linked to real auth/database states.

---

## Related

- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan (Phases 0-3)
- **[docs/PROGRESS.md](docs/PROGRESS.md)** — Current progress
- **[01_evolution/](../01_evolution/)** — Backend platform
- **[01_evolution/docs/PROGRESS.md](../01_evolution/docs/PROGRESS.md)** — Backend progress

---

## Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_BASE=https://australia-southeast1-evolution-engine.cloudfunctions.net

# Stripe (public key only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase (client config)
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"evolution-engine",...}
```

**Secrets live in backend:**
- `STRIPE_SECRET_KEY` → `01_evolution/api/.env.api.yaml`
- `STRIPE_WEBHOOK_SECRET` → `01_evolution/api/.env.api.yaml`
 
