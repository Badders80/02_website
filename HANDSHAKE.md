# Data & Auth Handshake — Frontend (Post-GCP)

**Version:** 3.0  
**Last updated:** 2026-06-30  
**Canonical facts:** [`STATE.md`](STATE.md) — if this file disagrees, trust STATE + code.

**Status:** Post-GCP reframe **mostly complete** for user-facing flows. GCP Cloud Functions are retired.

---

## Overview

`02_website/` runs on **Vercel** (Next.js 16). Data and payments do **not** go through GCP.

```
Google Sheets (optional) ──sync_inventory.py──▶ src/data/*.json
                                                        │
Firebase Auth (client) ────────────────────────────────┤
                                                        ▼
                              marketplace / mystable / checkout pages
                                                        │
Stripe Identity + Checkout ◀── Next.js API routes (Vercel)
```

---

## Data — local JSON

| File | Purpose | Read by |
|------|---------|---------|
| `src/data/horses.json` | Horse records | Profiles, marketplace |
| `src/data/hlts.json` | Listings | Marketplace |
| `src/data/trainers.json` | Trainers | Detail pages |
| `src/data/owners.json` | Owners | HLT detail |
| `src/data/holdings.json` | User positions | MyStable |

**Sync:** `python3 scripts/sync_inventory.py` (see `scripts/sheets_config.json` for Sheet IDs).

**Rule:** Active pages must not call `getHlts()` / `getHoldings()` from `src/lib/api.ts`. Legacy `api.ts` remains for dormant admin paths only.

---

## Auth — Firebase (client)

- SDK: `src/lib/firebase.ts`
- Context: `src/lib/auth-context.tsx` → `useAuth()`
- Dev bypass: `NEXT_PUBLIC_BYPASS_AUTH_KYC=true`

---

## Payments — Stripe (Vercel)

| Route | Purpose |
|-------|---------|
| `POST /api/kyc/create-session` | Stripe Identity session |
| `POST /api/kyc/callback` | Webhook → Firebase custom claims |
| `POST /api/checkout/create-session` | Checkout session |
| `POST /api/checkout/webhook` | Payment → holdings update |

**Server env (Vercel):** `STRIPE_SECRET_KEY`  
**Client env:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Dormant (do not wire new features)

- `src/lib/api.ts`, `src/lib/gcp-auth.ts` — GCP SSOT proxy (dead endpoints)
- `src/app/api/proxy/` — 410 retired
- `src/app/admin/` — parked; not in production nav

---

## Verify

```bash
npm run lint && npm run build
grep -r "cloudfunctions.net" src/app/marketplace src/app/mystable src/app/api/kyc src/app/api/checkout --include="*.ts" --include="*.tsx"
# Should return nothing
```

---

## Related

- [`STATE.md`](STATE.md) — live blockers + build order
- [`01_evolution/STATE.md`](../01_evolution/STATE.md) — backend live state (GCP retired)