# Data & Auth Handshake — Frontend (Post-GCP Reframe)

**Version:** 2.0
**Last Updated:** 2026-06-24
**Supersedes:** v1.0 (GCP Cloud Functions architecture — retired)
**Status:** TRANSITION — GCP retired, codebase still references it. Target state below is not yet built.

---

## Overview

The frontend (`02_website/`) runs on Vercel as a Next.js app. GCP Cloud Functions are retired (billing delinquent). The target architecture is: local JSON data synced from Google Sheets, Firebase Auth client-side, Stripe direct via Next.js API routes. **None of the target infrastructure exists yet** — this document describes the target state and what needs to change to get there.

**Current state:** API calls in `src/lib/api.ts` hit dead GCP endpoints and fall back to mock data via try/catch. Stripe routes proxy through GCP (also dead). `src/data/` does not exist. `scripts/sync_inventory.py` does not exist. The `stripe` server package is not installed.

**Target architecture:**
```
Google Sheets (inventory) ──replay script (TO BUILD)──▶ src/data/*.json (TO BUILD)
                                                              │
Firebase Auth (client SDK) ─────────────────────────────▶ who you are (LIVE)
                                                              │
Stripe Identity (redirect) ◀─── Next.js API (TO REWRITE) ──▶ KYC session
Stripe Checkout (redirect) ◀─── Next.js API (TO REWRITE) ──▶ payment session
```

---

## Data Source — Local JSON (TARGET — not yet built)

Inventory will be managed in Google Sheets, synced to local JSON via a replay script. The site reads from JSON at build time. No runtime API calls for inventory.

### Data files (to be created in `src/data/`)

| File | Source sheet | Read by | Format | Status |
|---|---|---|---|---|
| `horses.json` | Horses sheet | Horse profiles, marketplace | `Horse[]` | ❌ Not built |
| `hlts.json` | HLTs sheet | Marketplace listings | `HLT[]` | ❌ Not built |
| `trainers.json` | Trainers sheet | Horse detail pages | `Trainer[]` | ❌ Not built |
| `owners.json` | Owners sheet | HLT detail | `Owner[]` | ❌ Not built |
| `holdings.json` | Holdings sheet | MyStable dashboard | `Holding[]` | ❌ Not built |

### Replay process (to be built)

```bash
# Edit the Google Sheet, then:
python scripts/sync_inventory.py   # TO BE BUILT
# Outputs: src/data/horses.json, hlts.json, trainers.json, owners.json, holdings.json

# Rebuild:
npm run lint && npm run build
git add src/data/
git commit -m "inventory: replay $(date +%Y-%m-%d)"
```

### Reading data in Next.js (target pattern)

```typescript
// Marketplace page — target: reads local JSON
import hlts from "@/data/hlts.json";

export default function MarketplacePage() {
  const activeListings = hlts.filter(h => h.marketplace_visible && h.listing_status === "active");
  // ...
}
```

```typescript
// MyStable page — target: reads local JSON filtered by user
import holdings from "@/data/holdings.json";

export default function MyStablePage({ user }) {
  const userHoldings = holdings.filter(h => h.user_email === user.email);
  // ...
}
```

### Current state (what happens today)

Both pages import from `@/lib/api` and call dead GCP endpoints. The try/catch fallback loads mock data so the pages render, but the data is fake. `NEXT_PUBLIC_BYPASS_STRIPE=true` gates the mock-data path in dev — without it, marketplace and mystable show empty listings.

---

## Authentication — Firebase (Client-Side Only)

Firebase Auth runs in the browser via the client SDK. No backend token verification. `src/lib/firebase.ts` is client-side only (guarded by `typeof window !== "undefined"`).

**Note:** `firebase-admin` is in devDependencies but unused. It was for server-side token verification (now retired with GCP). Should be removed as part of reframe.

### Config

```env
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"evolution-engine",...}
```

### Sign-in methods

- **Email/Password** — `signInWithEmailAndPassword(auth, email, password)`
- **Google OAuth** — `signInWithPopup(auth, googleProvider)`

### Auth context

`src/lib/auth-context.tsx` provides `useAuth()` hook with `{ user, role, kycStatus, loading }`. In dev:
- `NEXT_PUBLIC_BYPASS_AUTH_KYC=*** mocks an admin user
- `NEXT_PUBLIC_MOCK_ROLE` / `NEXT_PUBLIC_MOCK_KYC` set mock values

### What's NOT here (removed with GCP)

- ~~Backend Firebase Admin token verification~~ — `firebase-admin` still in devDeps but unused
- ~~`POST /auth/verify` endpoint~~ — client SDK handles auth state
- ~~GCP service account~~ — no server-side admin operations

---

## Stripe — KYC + Payments (TARGET: Direct — CURRENT: GCP proxy, dead)

### Current state (broken)

Both KYC and checkout routes forward to GCP via `getGcpIdentityToken()`:

| Route | Current behavior | Status |
|---|---|---|
| `api/kyc/create-session/route.ts` | Gets GCP token → `fetch(${KYC_API_BASE}/create-session)` → dead | ❌ Broken |
| `api/checkout/create-session/route.ts` | Gets GCP token → `fetch(${PAYMENTS_API_BASE}/create-session)` → dead | ❌ Broken |
| `api/kyc/callback/route.ts` | Uses GCP auth to process Stripe webhook | ⚠️ Needs rewrite |
| `api/checkout/webhook/route.ts` | Uses GCP auth to process Stripe webhook | ⚠️ Needs rewrite |

**The `stripe` server SDK is NOT installed.** Only `@stripe/stripe-js` (client) is in package.json. The server package must be added before the rewrite.

`mystable/verify/page.tsx` calls `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` but the `stripePromise` is never used — the actual KYC flow goes through the Next.js API route → GCP.

### Target state (direct Stripe)

**KYC flow:**
```
User clicks "Verify Identity"
  → POST /api/kyc/create-session (Next.js route)
  → Route calls stripe.identity.VerificationSession.create() directly
  → Returns { session_url }
  → Client redirects to Stripe
  → Stripe redirects back to /auth/verify?session_id=...
  → Client polls for status (or webhook updates via /api/kyc/callback)
```

**Payment flow:**
```
User clicks "Buy Shares" on a listing
  → POST /api/checkout/create-session (Next.js route)
  → Route calls stripe.checkout.Session.create() directly
  → Returns { session_url }
  → Client redirects to Stripe Checkout
  → Stripe redirects back to /mystable?success=true
```

### Environment

```env
# Client-side (public) — LIVE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Server-side (Vercel env, never in client code) — TO BE ADDED
STRIPE_SECRET_KEY=***
```

### What needs to happen

1. Install `stripe` server package: `npm install stripe`
2. Rewrite `api/kyc/create-session/route.ts` — remove `getGcpIdentityToken()`, call `stripe.identity.VerificationSession.create()` directly
3. Rewrite `api/checkout/create-session/route.ts` — remove `getGcpIdentityToken()`, call `stripe.checkout.Session.create()` directly
4. Rewrite `api/kyc/callback/route.ts` — verify Stripe signature directly (no GCP)
5. Rewrite `api/checkout/webhook/route.ts` — verify Stripe signature directly (no GCP)
6. Add `STRIPE_SECRET_KEY` to Vercel env vars

---

## Other GCP-Coupled API Routes (disposition needed)

| Route | What it does | GCP dependency | Disposition |
|---|---|---|---|
| `api/proxy/[...path]/route.ts` | Cloud Functions proxy | `getGcpIdentityToken()` | Dormant-ify |
| `api/diagnostics/wif/route.ts` | GCP WIF diagnostics | `getGcpIdentityToken()` | Dormant-ify |
| `api/applications/submit/route.ts` | Submit application to GCP | `getGcpIdentityToken()`, hardcoded `cloudfunctions.net` URL | Dormant-ify or rewrite to local |
| `api/applications/list/route.ts` | List applications from GCP | `getGcpIdentityToken()`, hardcoded `cloudfunctions.net` URL | Dormant-ify or rewrite to local |

---

## Assets — Local, Not GCS

All assets are in `_assets/` (427 files consolidated). The website references them via:

- `_shared/brand` → symlink to `_assets/brand`
- `public/images/` → static copies or symlinks from `_assets/`
- No GCS URLs, no `gs://` buckets, no asset upload API

See: [_assets/WHATS_LEFT.md](../_assets/WHATS_LEFT.md) for the full asset inventory.

---

## Environment Variables — Complete List

### Live (required)

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Client | Firebase Auth init |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js load |
| `NEXT_PUBLIC_APP_URL` | Client/Server | App URL for redirects |

### Dev only

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BYPASS_AUTH_KYC` | Bypass auth in dev |
| `NEXT_PUBLIC_MOCK_ROLE` | Mock user role |
| `NEXT_PUBLIC_MOCK_KYC` | Mock KYC status |
| `NEXT_PUBLIC_BYPASS_STRIPE` | **Critical for dev** — gates mock data path for marketplace/mystable. Without this, listings are empty. |

### To be added

| Variable | Scope | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server (Vercel) | Stripe session creation (build-order #5) |

### Existing but needs disposition

| Variable | Notes |
|---|---|
| `GOOGLE_SHEETS_WEB_APP_URL` | Google Apps Script URL — **directly relevant to replay script** |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Was for NextAuth server-side auth — likely stale |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth config — likely stale |
| `CLOUD_RUN_PROXY_URL` | GCP Cloud Run proxy — retired |
| `PAYMENTS_API_BASE` | GCP Payments API — retired |

### Retired (do NOT set)

| Variable | Why retired |
|---|---|
| ~~`NEXT_PUBLIC_API_BASE`~~ | No GCP backend |

---

## Verification

```bash
# Build gate (just check does not exist in this project — use npm directly)
npm run lint && npm run build

# No dead GCP references in active code (after reframe complete)
grep -r "cloudfunctions.net" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v admin | grep -v dormant
# Should return nothing after build-order #4-7

# No active imports of gcp-auth (after reframe)
grep -r "gcp-auth" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
# Should only show dormant files after build-order #5-7
```

---

## Related

- **[AGENTS.md](AGENTS.md)** — Website agent rules
- **[BLOCKERS.md](BLOCKERS.md)** — Current blockers
- **[GAME_PLAN.md](GAME_PLAN.md)** — Build plan
- **[_assets/WHATS_LEFT.md](../_assets/WHATS_LEFT.md)** — Asset consolidation status
- **[01_evolution/BLOCKERS.md](../01_evolution/BLOCKERS.md)** — Backend blockers (GCP retired)