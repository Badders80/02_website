# Website — Agent Rules

**Identity:** You are the **Evolution Website Build Agent**. You build the public-facing frontend for Evolution Stables.

---

## Core Laws

1. **Minimal deps** — Essential dependencies only. Current: next 16, react 19, tailwind 3.4, firebase, @stripe/stripe-js (client). Server `stripe` package still needs to be added (build-order #5).
2. **Extract, don't rebuild** — Get assets/content from existing local sources
3. **Next.js 16 + Tailwind 3.4** — (Tailwind 4 upgrade is deferred — not current)
4. **SEO-first** — Lighthouse = 100 target
5. **Local data target, not backend API** — Inventory (horses, HLTs, trainers, owners, holdings) will be managed in Google Sheets, synced to local JSON via a replay script. GCP Cloud Functions are retired.
6. **No secrets** — Public keys only (Firebase config, Stripe publishable key). Stripe secret key will live in Vercel env vars, used only in Next.js API routes.

---

## Current State vs Target State

**This is a transition period.** GCP is retired but the codebase still references it. The site currently runs with mock/fallback data because API calls hit dead GCP endpoints and fall back silently. The target state is local JSON + Stripe direct. Until the reframe is complete, things are in-between.

### What's live right now

| Component | Status | Notes |
|---|---|---|
| **Firebase Auth** | ✅ LIVE | Client SDK (email + Google). `src/lib/firebase.ts` — client-side only, guarded by `typeof window !== "undefined"`. Config: `NEXT_PUBLIC_FIREBASE_CONFIG` |
| **Static pages** | ✅ LIVE | Homepage, press, privacy, terms — no API dependency |
| **Assets** | ✅ LIVE | Local `_assets/` directory, 427 files, symlinks active (`_shared/brand` → `_assets/brand`). No GCS. |
| **Auth context** | ✅ LIVE | `src/lib/auth-context.tsx` — `useAuth()` hook. Dev bypass: `NEXT_PUBLIC_BYPASS_AUTH_KYC=true` |
| **Marketplace page** | ⚠️ LIVE but degraded | `src/app/marketplace/page.tsx` calls `getHlts()` from `api.ts` → hits dead GCP → try/catch falls back to mock data. Works visually but data is fake. |
| **MyStable page** | ⚠️ LIVE but degraded | `src/app/mystable/page.tsx` calls `getHoldings()`, `getHlts()`, `getContent()` from `api.ts` → dead GCP → fallback. |
| **KYC verify page** | ✅ LIVE (direct) | `src/app/mystable/verify/page.tsx` + `/auth/verify/page.tsx` — direct create-session, redirects to Stripe url. (unused loadStripe cleaned) |
| **Stripe payments** | ✅ LIVE (direct) | `src/app/api/checkout/create-session/route.ts` calls stripe.checkout directly. Token verified. |
| **KYC webhook** | ✅ LIVE | `api/kyc/callback` — direct sig + sets Firebase custom claims (kyc_status/role) |
| **Checkout webhook** | ✅ LIVE | `api/checkout/webhook` — direct sig + appends holding (sheets webapp or console log) |

### Active but cleaned / dormant (GCP-coupled)

| File | Status | Notes |
|---|---|---|
| `src/lib/api.ts` + `src/lib/gcp-auth.ts` | Partial legacy | Some pages may still import (fallback). Rewire where seen. |
| `api/proxy/[...path]/route.ts` | Dormant (410) | Retired. |
| `api/applications/*` | Dormant (410) | Retired. |
| `api/diagnostics/wif` | Dormant | Old WIF. |
| `src/app/api/diagnostics/wif/route.ts` | `gcp-auth.ts` | GCP WIF diagnostics. | **Dormant-ify** |

### Dormant (parked, not deleted — may revive if GCP returns)

| Component | Status | Notes |
|---|---|---|
| `src/app/admin/` | Dormant target | 14 files: `horses/` (list, new, detail), `hlts/`, `applications/`, `assets/upload/`, `trainers/`, `owners/`, `website/press/`, `website/faq/`, `layout.tsx`, `page.tsx`. Several actively import `api.ts` — will be dormant-ified in build-order #6. |
| `01_evolution/api/` | Dormant (per parent workspace) | Backend code preserved for reference. Not deployed. See `01_evolution/BLOCKERS.md`. |

### Not yet built (target state)

| Component | Status | Notes |
|---|---|---|
| `src/data/*.json` | ❌ NOT BUILT | Local JSON inventory files. Target: `horses.json`, `hlts.json`, `trainers.json`, `owners.json`, `holdings.json`. Build-order #3–4. |
| `scripts/sync_inventory.py` | ❌ NOT BUILT | Replay script: reads Google Sheets, writes `src/data/*.json`. Build-order #3. |
| `stripe` (server package) | ❌ NOT INSTALLED | Needed for build-order #5. Only `@stripe/stripe-js` (client) is in package.json. |

---

## Target Data Flow (post-reframe)

```
Google Sheets (inventory)
  ↓ replay script (python) — TO BE BUILT
src/data/*.json (local static data) — TO BE BUILT
  ↓ Next.js build
Marketplace page (reads hlts.json)
MyStable page (reads holdings.json)
  ↓
Firebase Auth (who you are) — LIVE
  ↓
Stripe KYC (verify identity) — TO BE REWRITTEN (direct, not via GCP)
  ↓
Stripe Checkout (buy shares) — TO BE REWRITTEN (direct, not via GCP)
```

---

## Inventory Management — Spreadsheet + Replay (TARGET DESIGN)

Inventory will be managed in Google Sheets. A replay script reads the sheets and writes static JSON to `src/data/`. The site reads from that JSON at build time.

### Sheets (to be created)

1. **Horses** — name, slug, microchip, life_number, loveracing_id, foaling_date, sex, colour, sire_name, dam_name, breeder, status, image_path
2. **HLTs** — horse_microchip, owner_name, trainer_name, lease_period_months, lease_start_date, leasehold_stake_pct, investor_return_pct, syndicate_price_nzd, shares_total, shares_sold, price_per_share_nzd, listing_status, marketplace_visible
3. **Trainers** — name, stable_name, location, email
4. **Owners** — name, email, type (individual/syndicate/corporate)
5. **Holdings** — user_email, hlt_id, shares_owned, purchase_date, kyc_status

### Replay process (to be built)

```bash
# Edit the Google Sheet, then:
python scripts/sync_inventory.py
# Outputs: src/data/horses.json, hlts.json, trainers.json, owners.json, holdings.json

# Rebuild:
npm run lint && npm run build
git add src/data/
git commit -m "inventory: replay $(date +%Y-%m-%d)"
```

The existing signup sheet (60 users from Firebase auth) is separate — that's user data, not inventory.

---

## Build Order

1. ~~Asset extraction~~ ✅ Done — 427 files in `_assets/`, symlinks active
2. ~~Content extraction~~ ✅ Done (partial) — homepage, press, footer. Horse profiles pending spreadsheet.
3. ~~Spreadsheet inventory design + sync script~~ ✅ Done — `scripts/sync_inventory.py` + `sheets_config.json` + CSV templates in `scripts/sheet_templates/`. Seeded JSON in `src/data/`. Awaiting user Google Sheet creation + config.
4. **Rewire marketplace/mystable** — read from `src/data/*.json` instead of `getHlts()`/`getHoldings()` API calls
5. **Rewrite Stripe routes** — `api/kyc/create-session` and `api/checkout/create-session` call Stripe directly, not via GCP. Install `stripe` server package. Rewrite `api/kyc/callback` and `api/checkout/webhook` to verify Stripe signatures directly.
6. **Dormant-ify admin** — keep code, remove from production nav. Admin routes: `horses/`, `hlts/`, `applications/`, `assets/upload/`, `trainers/`, `owners/`, `website/press/`, `website/faq/`. Remove active `api.ts` imports from these pages.
7. **Dormant-ify GCP-coupled routes** — `api/proxy/`, `api/diagnostics/wif/`, `api/applications/*` — keep code, remove from active routing.
8. **SEO infrastructure** — sitemap, JSON-LD, Open Graph
9. **Deployment** — Vercel

---

## Verification

Every task must end with verification:
- **Build clean:** `npm run lint && npm run build` — 0 errors, 0 warnings (note: `just check` does not exist in this project's Justfile — the Justfile only has task-master recipes)
- **Visual match:** Side-by-side with evolutionstables.nz
- **Lighthouse score:** Performance = 100, SEO = 100
- **Data check:** Local JSON files exist and contain expected data (once sync script is built)
- **No dead GCP refs in active routes:** `grep -r "cloudfunctions.net" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v admin | grep -v dormant` returns nothing (after build-order #4–7 complete)

---

## Production vs. Sandbox Workflow Model

1. **Static Design Sandbox (`_sandbox/02_website/`):**
   - Located outside the Next.js app in the parent directory.
   - Contains static HTML/CSS mockup templates for raw visual experiments.
   - **Rule:** Use this folder to sketch layouts and micro-animations first, without Next.js compile overhead.

2. **Interactive Code Sandbox (`02_website/src/app/sandbox/`):**
   - Built into the Next.js app router.
   - Integrates components like `ListingGridSandbox.tsx` with a client-side Control Center.

3. **Production Integration (`02_website/src/app/`):**
   - Promote finalized designs from sandboxes into production folders.
   - Wire to local JSON data (`src/data/`) and Firebase Auth.

---

## Environment Variables

### Live (required)

```env
# Firebase (client-side, public)
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"evolution-engine",...}

# Stripe (client-side, public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App URL
NEXT_PUBLIC_APP_URL=https://evolutionstables.nz
```

### Dev only

```env
# Auth bypass
NEXT_PUBLIC_BYPASS_AUTH_KYC=true
NEXT_PUBLIC_MOCK_ROLE=admin
NEXT_PUBLIC_MOCK_KYC=verified

# Stripe bypass — CRITICAL: without this, marketplace/mystable show empty listings in dev
# Used in: usePurchaseFlow.ts, marketplace/page.tsx, marketplace/[id]/page.tsx, mystable/page.tsx, sandbox pages
NEXT_PUBLIC_BYPASS_STRIPE=true
```

### To be added (build-order #5)

```env
# Stripe (server-side, Vercel env — NOT in client code)
STRIPE_SECRET_KEY=sk_live_...
```

### Existing but unmentioned (disposition needed)

```env
# Google Sheets ingestion — directly relevant to replay script (build-order #3)
GOOGLE_SHEETS_WEB_APP_URL=...   # Google Apps Script web app URL

# Auth-related — were for NextAuth server-side, may be stale
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# GCP-related — retired
CLOUD_RUN_PROXY_URL=...         # GCP Cloud Run proxy
PAYMENTS_API_BASE=...           # GCP Payments API
```

### Retired (do NOT set)

| Variable | Why retired |
|---|---|
| ~~`NEXT_PUBLIC_API_BASE`~~ | No GCP backend |

---

## Dependencies — Current State

**Runtime deps (15):** next 16, react 19, react-dom 19, @base-ui/react, @stripe/stripe-js (client only), class-variance-authority, clsx, firebase, framer-motion, lenis, lucide-react, react-dropzone, shadcn, tailwind-merge, tw-animate-css

**Dev deps include:** `firebase-admin` (unused — was for server-side token verification, no longer needed with client-only auth). Should be removed as part of reframe.

**Not yet installed:** `stripe` (server SDK) — needed for build-order #5.

---

## Related

- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan
- **[HANDSHAKE.md](HANDSHAKE.md)** — Data + auth contract (post-GCP)
- **[BLOCKERS.md](BLOCKERS.md)** — Current blockers
- **[01_evolution/AGENTS.md](../01_evolution/AGENTS.md)** — Backend agent rules (dormant)
- **[_assets/WHATS_LEFT.md](../_assets/WHATS_LEFT.md)** — Asset consolidation status